// 新闻加工流水线：抓取 -> 模型筛选/去重/结构化 -> 存储。
// 由定时任务（/api/cron/refresh-news）调用。
// 任一依赖（模型 key / Blob store）缺失时安全失败，不影响已发布内容。

import "server-only";
import { createHash } from "crypto";
import { chatJSON, isLLMConfigured } from "@/lib/llm";
import { fetchRawNews, RawNewsItem } from "@/lib/news-sources";
import { saveNewsFeed, isStoreConfigured } from "@/lib/news-store";
import {
  LatestNewsItem,
  NewsFeed,
  resolveTrustedSource,
} from "@/data/news";

const VALID_DIMENSIONS = [
  "找工作",
  "工资收入",
  "租房成本",
  "日常消费",
  "存钱现金流",
  "理财认知",
];
const VALID_DIRECTIONS = [
  "涨价压力",
  "降价空间",
  "招聘收紧",
  "招聘回暖",
  "借钱变贵",
  "借钱变便宜",
  "收入承压",
  "存款收益变化",
];

function idFor(link: string): string {
  return createHash("sha1").update(link).digest("hex").slice(0, 12);
}

// 模型只做「筛选 + 通俗改写 + 打标签」，不生成预测或投资建议。
function systemPrompt(): string {
  return [
    "你是一个面向年轻人的财经新闻筛选与改写助手。",
    "给你一批新闻原始条目，请挑出真正会影响普通年轻人生活（找工作、工资、租房、消费、存钱、理财）的条目，",
    "把每条改写得通俗易懂，并说明它和年轻人生活的关系。不要编造原文没有的事实，不要给投资建议或预测涨跌。",
    "",
    `生活维度只能从这里选：${VALID_DIMENSIONS.join("、")}`,
    `影响方向标签只能从这里选：${VALID_DIRECTIONS.join("、")}`,
    "",
    "只输出 JSON：",
    '{"items":[{"link":"原文链接","title":"通俗标题","summary":"一句话讲清这件事","whyRelevant":"为什么和你的生活有关","dimensions":["维度"],"directions":["方向标签"]}]}',
    "最多保留 8 条，最相关的排前面。与年轻人生活无关的条目直接丢弃。",
  ].join("\n");
}

interface ModelItem {
  link: string;
  title: string;
  summary: string;
  whyRelevant: string;
  dimensions: string[];
  directions: string[];
}

/**
 * 跑一次完整流水线，成功时返回写入的 feed，失败/未配置返回 null。
 * 返回详细状态便于 cron 端记录。
 */
export async function refreshNews(): Promise<
  { ok: true; feed: NewsFeed } | { ok: false; reason: string }
> {
  if (!isLLMConfigured()) return { ok: false, reason: "LLM 未配置（缺 LLM_API_KEY）" };
  if (!isStoreConfigured())
    return { ok: false, reason: "存储未配置（缺 BLOB_READ_WRITE_TOKEN）" };

  const raw = await fetchRawNews(30);
  if (raw.length === 0) return { ok: false, reason: "未抓到任何可信源条目" };

  const rawByLink = new Map<string, RawNewsItem>(raw.map((r) => [r.link, r]));

  let parsed: { items: ModelItem[] };
  try {
    parsed = await chatJSON<{ items: ModelItem[] }>({
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
      timeoutMs: 30_000,
    });
  } catch (e) {
    return { ok: false, reason: `模型加工失败：${(e as Error).message}` };
  }

  const items: LatestNewsItem[] = (parsed.items ?? [])
    .map((m): LatestNewsItem | null => {
      const rawItem = rawByLink.get(m.link);
      if (!rawItem) return null; // 模型不能凭空造链接
      // 再次确认来源可信（双保险）
      const source = resolveTrustedSource(`${m.link} ${rawItem.source}`);
      if (!source) return null;
      return {
        id: idFor(m.link),
        title: m.title || rawItem.title,
        summary: m.summary || "",
        whyRelevant: m.whyRelevant || "",
        directions: (m.directions ?? []).filter((d) =>
          VALID_DIRECTIONS.includes(d),
        ) as LatestNewsItem["directions"],
        dimensions: (m.dimensions ?? []).filter((d) =>
          VALID_DIMENSIONS.includes(d),
        ) as LatestNewsItem["dimensions"],
        source,
        sourceUrl: m.link,
        publishedAt: rawItem.publishedAt,
      };
    })
    .filter((x): x is LatestNewsItem => x !== null)
    .slice(0, 8);

  const feed: NewsFeed = { updatedAt: new Date().toISOString(), items };
  await saveNewsFeed(feed);
  return { ok: true, feed };
}
