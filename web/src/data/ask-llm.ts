// 「直接提问」核心：用模型针对用户问题，基于「真实、可追溯的事件」生成定制回答。
//
// 与旧版区别：旧版 LLM 只做「把问题匹配到 8 个静态样例事件」，答案是预置文案，
// 既离谱又模板化。新版改为：
//   1. 取真实事件目录（优先用 Blob 里自动生成的可追溯事件，含原文链接；
//      没有时退回静态样例作为知识库）。
//   2. 让模型只基于这些事件，针对用户问题生成一份结构化回答（传导路径、
//      分维度影响等），并指明它依据了哪几条事件（用于引用与追溯）。
//   3. 模型判定没有相关事件 → no-match，直接显示「无法识别」，不硬凑。
// 安全护栏（不预测点位、不给投资建议、用传导路径而非绝对结论）写进系统提示。

import { chatJSON, isLLMConfigured } from "@/lib/llm";
import { getEventsFeed } from "@/lib/news-store";
import {
  events as staticEvents,
  FinanceEvent,
  LifeDimension,
  RISK_NOTE,
} from "./events";
import { AskAnswer } from "./ask";

const ALL_DIMENSIONS: LifeDimension[] = [
  "找工作",
  "工资收入",
  "租房成本",
  "日常消费",
  "存钱现金流",
  "理财认知",
];

/** 模型针对问题生成的结构化回答（依据 eventSlugs 指向的真实事件）。 */
interface GeneratedAnswer {
  /** 是否有相关事件可依据；false 或 eventSlugs 为空 → no-match */
  relevant: boolean;
  /** 回答所依据的事件 slug（必须来自给定目录），用于引用与追溯 */
  eventSlugs: string[];
  /** 一句话直接回答用户的问题 */
  directAnswer: string;
  /** 涉及的生活维度（只能取自固定集合） */
  dimensions: LifeDimension[];
  /** 传导路径：从事件出发，一步步到用户生活 */
  path: string[];
  /** 按生活维度展开的具体影响 */
  byDimension: { dimension: LifeDimension; text: string }[];
  /** 哪类年轻人更受影响 */
  whoAffected: string[];
  /** 当前更值得关注的信号 */
  signals: string[];
}

/** 三态结果：见各分支注释。 */
export type SmartResult =
  | { kind: "answer"; answer: AskAnswer }
  | { kind: "no-match" }
  | { kind: "unavailable" };

function strArr(v: unknown, max = 6): string[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x) => typeof x === "string" && x.trim()).slice(0, max);
}

/** 取「真实事件目录」：优先 Blob 自动生成的可追溯事件，没有则退回静态样例。 */
async function getEventCatalog(): Promise<FinanceEvent[]> {
  try {
    const feed = await getEventsFeed();
    if (feed.events && feed.events.length > 0) return feed.events;
  } catch {
    // ignore，退回静态
  }
  return staticEvents;
}

function buildSystemPrompt(catalog: FinanceEvent[]): string {
  const list = catalog
    .map((e) =>
      [
        `slug: ${e.slug}`,
        `标题: ${e.title}`,
        `摘要: ${e.summary}`,
        `结论: ${e.conclusion}`,
        `传导路径: ${e.detail.transmissionPath.join(" → ")}`,
        `关键词: ${e.keywords.join("、")}`,
        e.sourceName ? `来源: ${e.sourceName}` : "",
      ]
        .filter(Boolean)
        .join(" | "),
    )
    .join("\n");

  return [
    "你是一个面向中国年轻人的财经事件影响解读助手。",
    "下面是一份「真实事件目录」（每条都来自真实新闻，可追溯）。用户会问一个",
    "「这件事会怎么影响我」类型的问题。你的任务：",
    "1. 判断目录里是否有与该问题真正相关的事件。若没有，relevant 设为 false。",
    "2. 若有，挑出最相关的 1-2 条（eventSlugs，必须是目录里的 slug），",
    "   并【只基于这些事件】，针对用户的具体问题生成一份定制回答。",
    "",
    "硬性护栏（必须遵守）：",
    "- 只能依据给定事件，不得编造目录里没有的事实或新闻。",
    "- 用「传导路径」解释：先影响成本/利率/行业，再到价格/招聘，最后到用户生活。",
    "- 用「更可能 / 有较大概率 / 短期未必但中期可能」这类措辞，禁止「一定/必然/马上」。",
    "- 不预测具体点位涨跌，不给任何买卖/投资建议。",
    "- 用普通人能懂的生活语言，紧扣用户问的那个点，不要泛泛而谈。",
    "- 若问题与财经/经济毫无关系（如生活琐事），relevant=false。",
    "",
    "真实事件目录：",
    list,
    "",
    `生活维度只能从这里选：${ALL_DIMENSIONS.join("、")}`,
    "",
    "只输出 JSON，结构：",
    JSON.stringify({
      relevant: true,
      eventSlugs: ["目录中的slug"],
      directAnswer: "一句话直接回答用户问题",
      dimensions: ["相关维度"],
      path: ["传导步骤1", "步骤2", "……最后到用户生活"],
      byDimension: [{ dimension: "维度", text: "该维度下的具体影响（1句）" }],
      whoAffected: ["哪类年轻人更受影响（1句）"],
      signals: ["当前更值得关注的信号（1句）"],
    }),
    "数组类字段每项 1 句话，控制在 2-4 项。relevant=false 时其它字段可留空。",
  ].join("\n");
}

/** 直接提问入口：模型基于真实事件生成定制回答。 */
export async function answerQuestionSmart(
  question: string,
): Promise<SmartResult> {
  if (!isLLMConfigured()) return { kind: "unavailable" };
  const q = question.trim();
  if (!q) return { kind: "unavailable" };

  const catalog = await getEventCatalog();
  if (catalog.length === 0) return { kind: "unavailable" };

  let gen: GeneratedAnswer;
  try {
    gen = await chatJSON<GeneratedAnswer>({
      system: buildSystemPrompt(catalog),
      user: q,
      // 温度 0：同一问题每次结果一致，避免多点几次出现不同答案。
      temperature: 0,
      maxTokens: 1500,
      timeoutMs: 20_000,
    });
  } catch {
    // 调用失败：交给上层关键词降级
    return { kind: "unavailable" };
  }

  const slugs = strArr(gen?.eventSlugs, 2);
  const matchedEvents = slugs
    .map((s) => catalog.find((e) => e.slug === s))
    .filter((e): e is FinanceEvent => Boolean(e));

  // 模型判定无关、或没给出有效依据事件、或没有直接回答 → no-match，不硬凑
  if (gen?.relevant === false || matchedEvents.length === 0 || !gen?.directAnswer) {
    return { kind: "no-match" };
  }

  const dimensions = (Array.isArray(gen.dimensions) ? gen.dimensions : []).filter(
    (d): d is LifeDimension => ALL_DIMENSIONS.includes(d as LifeDimension),
  );

  const byDimension = (Array.isArray(gen.byDimension) ? gen.byDimension : [])
    .filter(
      (b): b is { dimension: LifeDimension; text: string } =>
        Boolean(b) &&
        typeof b.text === "string" &&
        ALL_DIMENSIONS.includes(b.dimension as LifeDimension),
    )
    .slice(0, 6);

  const path = strArr(gen.path, 8);
  // 传导路径太短说明没讲清楚，按 no-match 处理，避免给半截答案
  if (path.length < 2) return { kind: "no-match" };

  const answer: AskAnswer = {
    question,
    matchedEvents,
    dimensions: dimensions.length > 0 ? dimensions : matchedEvents[0].dimensions.slice(0, 4),
    directAnswer: gen.directAnswer,
    path,
    byDimension,
    whoAffected: strArr(gen.whoAffected, 4),
    signals: strArr(gen.signals, 4),
    riskNote: RISK_NOTE,
  };
  return { kind: "answer", answer };
}
