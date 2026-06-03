// 完整推演事件生成流水线：抓取真实新闻 -> 模型按 10 段结构生成完整推演 -> 存储。
// 由定时任务（/api/cron/refresh-news）调用。
// 任一依赖（模型 key / Blob store）缺失时安全失败，不影响已发布内容。
//
// 与 news-pipeline 的区别：news 只生成轻量「最新动态」卡片；
// 这里生成与静态 events 同结构的完整 FinanceEvent（首页「最近事件」+ 详情页推演）。

import "server-only";
import { createHash } from "crypto";
import { chatJSON, isLLMConfigured } from "@/lib/llm";
import { fetchRawNews, RawNewsItem } from "@/lib/news-sources";
import { saveEventsFeed, isStoreConfigured } from "@/lib/news-store";
import {
  EventsFeed,
  resolveTrustedSource,
} from "@/data/news";
import {
  EventDetailSection,
  FinanceEvent,
  ImpactDirection,
  LifeDimension,
} from "@/data/events";

const MAX_EVENTS = 6;

const DIRECTIONS: ImpactDirection[] = [
  "涨价压力",
  "降价空间",
  "招聘收紧",
  "招聘回暖",
  "借钱变贵",
  "借钱变便宜",
  "收入承压",
  "存款收益变化",
];
const DIMENSIONS: LifeDimension[] = [
  "找工作",
  "工资收入",
  "租房成本",
  "日常消费",
  "存钱现金流",
  "理财认知",
];

function slugFor(link: string): string {
  return "live-" + createHash("sha1").update(link).digest("hex").slice(0, 10);
}

function systemPrompt(): string {
  return [
    "你是一个面向年轻人的财经事件推演撰稿助手。给你一批真实新闻条目，",
    `请从中挑出最多 ${MAX_EVENTS} 件真正会影响普通年轻人生活的事件，每件生成一份「完整推演」。`,
    "",
    "硬性表达原则（必须遵守）：",
    "1. 用「传导路径」解释，不直接下结论压人：先影响成本/利润/利率，再影响行业/价格/招聘，最后才到年轻人生活。",
    "2. 用「更可能 / 有较大概率 / 短期未必但中期可能」这类措辞，不要「一定会/必然/马上」这种绝对化预言。",
    "3. 用生活语言，把专业术语翻译成普通人能懂的话。",
    "4. 不预测具体涨跌点位，不给任何投资买卖建议。",
    "5. 不能编造新闻里没有的事实；只基于给定条目推演其生活影响。",
    "",
    `影响方向标签 directions 只能从这里选：${DIRECTIONS.join("、")}`,
    `生活维度 dimensions 只能从这里选：${DIMENSIONS.join("、")}`,
    "",
    "只输出 JSON，结构如下（events 数组，每个元素）：",
    JSON.stringify(
      {
        events: [
          {
            link: "对应新闻原文链接（必须来自输入）",
            title: "通俗的事件标题",
            date: "事件时间的展示文本，如 2026年6月",
            summary: "一句话解释这件事",
            conclusion: "顶部一句话结论（点明对年轻人生活的总体影响方向）",
            directions: ["标签"],
            audiences: ["影响对象，如 求职年轻人、租房族"],
            dimensions: ["生活维度"],
            keywords: ["用于检索的关键词"],
            detail: {
              what: "这件事发生了什么",
              whyImportant: "为什么这件事重要",
              firstImpact: "它通常会先影响什么",
              transmissionPath: ["传导第1步", "第2步", "……最后到生活"],
              youngPeopleImpact: ["对年轻人的重点影响（数组）"],
              shortTerm: ["短期更可能发生什么（数组）"],
              midTerm: ["中期需要留意什么（数组）"],
              mostAffected: ["哪些人更容易感受到影响（数组）"],
              doesNotMean: ["这不代表什么（数组）"],
            },
          },
        ],
      },
      null,
      0,
    ),
    "数组类字段每项 1 句话，控制在 2-4 项。与年轻人生活无关的新闻直接丢弃。",
  ].join("\n");
}

interface ModelEvent {
  link: string;
  title: string;
  date: string;
  summary: string;
  conclusion: string;
  directions: string[];
  audiences: string[];
  dimensions: string[];
  keywords: string[];
  detail: Partial<EventDetailSection>;
}

function strArr(v: unknown, max = 6): string[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x) => typeof x === "string" && x.trim()).slice(0, max);
}

function toFinanceEvent(
  m: ModelEvent,
  raw: RawNewsItem,
  source: string,
): FinanceEvent | null {
  const d = m.detail || {};
  const transmissionPath = strArr(d.transmissionPath, 8);
  // 推演链太短的丢弃，保证质量
  if (!m.title || !m.conclusion || transmissionPath.length < 2) return null;

  const detail: EventDetailSection = {
    what: d.what || raw.description || m.summary,
    whyImportant: d.whyImportant || "",
    firstImpact: d.firstImpact || "",
    transmissionPath,
    youngPeopleImpact: strArr(d.youngPeopleImpact),
    shortTerm: strArr(d.shortTerm),
    midTerm: strArr(d.midTerm),
    mostAffected: strArr(d.mostAffected),
    doesNotMean: strArr(d.doesNotMean),
  };

  return {
    slug: slugFor(m.link),
    title: m.title,
    date: m.date || new Date(raw.publishedAt).toLocaleDateString("zh-CN"),
    summary: m.summary || "",
    directions: (m.directions ?? []).filter((x) =>
      DIRECTIONS.includes(x as ImpactDirection),
    ) as ImpactDirection[],
    audiences: strArr(m.audiences, 4),
    conclusion: m.conclusion,
    detail,
    keywords: strArr(m.keywords, 12),
    dimensions: (m.dimensions ?? []).filter((x) =>
      DIMENSIONS.includes(x as LifeDimension),
    ) as LifeDimension[],
    // 标注来源，便于页面展示与追溯
    sourceName: source,
    sourceUrl: m.link,
  };
}

/** 跑一次完整流水线，成功返回写入的 feed，失败/未配置返回原因。 */
export async function refreshEvents(): Promise<
  { ok: true; feed: EventsFeed } | { ok: false; reason: string }
> {
  if (!isLLMConfigured()) return { ok: false, reason: "LLM 未配置（缺 LLM_API_KEY）" };
  if (!isStoreConfigured())
    return { ok: false, reason: "存储未配置（缺 BLOB_READ_WRITE_TOKEN）" };

  const raw = await fetchRawNews(30);
  if (raw.length === 0) return { ok: false, reason: "未抓到任何可信源条目" };

  const rawByLink = new Map<string, RawNewsItem>(raw.map((r) => [r.link, r]));

  let parsed: { events: ModelEvent[] };
  try {
    parsed = await chatJSON<{ events: ModelEvent[] }>({
      system: systemPrompt(),
      user: JSON.stringify(
        raw.map((r) => ({
          link: r.link,
          title: r.title,
          description: r.description,
          source: r.source,
          publishedAt: r.publishedAt,
        })),
      ),
      maxTokens: 8000,
      timeoutMs: 55_000,
    });
  } catch (e) {
    return { ok: false, reason: `模型生成失败：${(e as Error).message}` };
  }

  const events: FinanceEvent[] = (parsed.events ?? [])
    .map((m) => {
      const raw = rawByLink.get(m.link);
      if (!raw) return null; // 模型不能凭空造链接
      const source = resolveTrustedSource(`${m.link} ${raw.source}`);
      if (!source) return null; // 来源必须可信
      return toFinanceEvent(m, raw, source);
    })
    .filter((x): x is FinanceEvent => x !== null)
    .slice(0, MAX_EVENTS);

  if (events.length === 0)
    return { ok: false, reason: "模型未产出符合质量要求的事件" };

  const feed: EventsFeed = { updatedAt: new Date().toISOString(), events };
  await saveEventsFeed(feed);
  return { ok: true, feed };
}
