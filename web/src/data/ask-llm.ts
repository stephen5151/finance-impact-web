// V2 混合问答：模型负责「理解问题 + 匹配事件 + 识别生活维度」，
// 结论与文案仍取自审核过的静态内容（见 buildAnswer）。
// 未配置 API key 或模型调用失败时，调用方降级回 V1 关键词匹配。

import { chatJSON, isLLMConfigured } from "@/lib/llm";
import { events, FinanceEvent, LifeDimension } from "./events";
import { AskAnswer, buildAnswer } from "./ask";

const ALL_DIMENSIONS: LifeDimension[] = [
  "找工作",
  "工资收入",
  "租房成本",
  "日常消费",
  "存钱现金流",
  "理财认知",
];

interface MatchResult {
  /** 最相关事件的 slug，按相关度排序，最多 2 个；无相关则空数组 */
  slugs: string[];
  /** 问题涉及的生活维度 */
  dimensions: LifeDimension[];
}

function buildSystemPrompt(): string {
  const catalog = events
    .map(
      (e) =>
        `- slug: ${e.slug} | 标题: ${e.title} | 摘要: ${e.summary} | 关键词: ${e.keywords.join("、")}`,
    )
    .join("\n");

  return [
    "你是一个金融事件理解助手。你的唯一任务是把用户的自然语言问题，",
    "映射到下面这份固定的事件清单，并识别问题涉及的生活维度。",
    "你不需要、也不可以自己生成结论或建议——结论由系统用审核过的内容生成。",
    "",
    "事件清单：",
    catalog,
    "",
    `可选生活维度（只能从中选，不要新造）：${ALL_DIMENSIONS.join("、")}`,
    "",
    "请只输出 JSON，格式：",
    '{"slugs": ["最相关事件slug", "次相关slug"], "dimensions": ["维度1","维度2"]}',
    "规则：slugs 按相关度排序，最多 2 个；若没有任何事件相关，slugs 返回空数组 []；",
    "dimensions 只填用户问题真正涉及的维度，识别不到就返回空数组。",
  ].join("\n");
}

/**
 * V2 匹配结果（三态）：
 * - answer：模型匹配到相关事件，已用静态内容组装好回答
 * - no-match：模型可用且已运行，但判定没有相关事件 → 应直接显示「无法识别」，
 *   不要再走关键词降级（否则关键词噪声会把无关问题硬塞给某个事件，答非所问）
 * - unavailable：未配置 key 或调用失败 → 调用方可降级到关键词匹配
 */
export type SmartResult =
  | { kind: "answer"; answer: AskAnswer }
  | { kind: "no-match" }
  | { kind: "unavailable" };

/** V2 入口：用模型做语义匹配，再用静态内容组装回答。 */
export async function answerQuestionSmart(
  question: string,
): Promise<SmartResult> {
  if (!isLLMConfigured()) return { kind: "unavailable" };
  const q = question.trim();
  if (!q) return { kind: "unavailable" };

  let result: MatchResult;
  try {
    result = await chatJSON<MatchResult>({
      system: buildSystemPrompt(),
      user: q,
      // 温度 0：匹配是分类任务，必须确定性——同一个问题每次都返回相同事件，
      // 避免用户多点几次「看影响」得到不同答案。
      temperature: 0,
    });
  } catch {
    // 调用失败：当作不可用，交给关键词降级
    return { kind: "unavailable" };
  }

  const slugs = Array.isArray(result?.slugs) ? result.slugs : [];
  const matchedEvents = slugs
    .map((s) => events.find((e) => e.slug === s))
    .filter((e): e is FinanceEvent => Boolean(e))
    .slice(0, 2);

  // 模型明确判定无相关事件：直接 no-match，不降级（避免给无关问题硬凑答案）
  if (matchedEvents.length === 0) return { kind: "no-match" };

  // 只保留合法维度，防止模型造词
  const dimensions = (Array.isArray(result?.dimensions) ? result.dimensions : [])
    .filter((d): d is LifeDimension => ALL_DIMENSIONS.includes(d as LifeDimension));

  const answer = buildAnswer(question, matchedEvents, dimensions);
  return answer ? { kind: "answer", answer } : { kind: "no-match" };
}
