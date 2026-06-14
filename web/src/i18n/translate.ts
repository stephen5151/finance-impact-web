// AI 生成内容的按需翻译层（仅服务端）。
// 事件、最新动态、问答这类由模型生成/抓取的中文内容，在以英文展示时，
// 经本层用模型翻译成英文。结果用 unstable_cache 按内容缓存——同一批内容只翻译一次，
// 之后命中缓存，避免每次请求都调用模型。
//
// 设计原则（与 llm.ts / news-store.ts 一致）：未配置模型或调用失败时，
// 优雅降级——原样返回中文内容，页面不报错。
//
// 注意：directions / dimensions / slug / 链接 等「结构化字段」不在这里翻译，
// 它们以中文 token 作为稳定标识，由 dict.ts 的 DIRECTION_LABEL / DIMENSION_LABEL 按语言展示。

import "server-only";
import { unstable_cache } from "next/cache";
import { chatJSON, isLLMConfigured } from "@/lib/llm";
import type { FinanceEvent } from "@/data/events";
import type { LatestNewsItem } from "@/data/news";
import type { RawNewsItem } from "@/lib/news-sources";
import type { AskAnswer } from "@/data/ask";
import type { Lang } from "./dict";

const SYSTEM = [
  "You are a professional translator localizing a finance-explainer site for a young general audience.",
  "Translate every Chinese string in the input array into natural, fluent English.",
  "Keep the meaning, tone, and any numbers, dates, and URLs. Keep it concise — match the source length.",
  "Do NOT add, drop, merge, or reorder items. The output array must have exactly the same length and order.",
  'Return JSON only, shaped: {"items": ["...", "..."]}',
].join(" ");

async function rawTranslate(texts: string[]): Promise<string[]> {
  const totalLen = texts.reduce((n, s) => n + s.length, 0);
  const maxTokens = Math.min(8000, Math.max(1024, totalLen * 3 + 512));
  const out = await chatJSON<{ items: string[] }>({
    system: SYSTEM,
    user: JSON.stringify({ items: texts }),
    temperature: 0,
    maxTokens,
    timeoutMs: 30_000,
  });
  const items = out?.items;
  if (
    !Array.isArray(items) ||
    items.length !== texts.length ||
    items.some((s) => typeof s !== "string")
  ) {
    // 结构不符：放弃翻译，交由上层降级为原文
    throw new Error("translate: shape mismatch");
  }
  return items;
}

const cachedTranslate = unstable_cache(rawTranslate, ["i18n-translate-en-v1"], {
  revalidate: false,
});

/** 把一批中文字符串翻成英文；未配置模型或失败时原样返回。 */
export async function translateBatch(texts: string[]): Promise<string[]> {
  if (texts.length === 0) return texts;
  if (!isLLMConfigured()) return texts;
  try {
    return await cachedTranslate(texts);
  } catch {
    return texts;
  }
}

// ---- 各类型的「展开为字符串数组 → 翻译 → 还原」 ----

function eventStrings(e: FinanceEvent): string[] {
  const d = e.detail;
  return [
    e.title,
    e.date,
    e.summary,
    e.conclusion,
    ...e.audiences,
    d.what,
    d.whyImportant,
    d.firstImpact,
    ...d.transmissionPath,
    ...d.youngPeopleImpact,
    ...d.shortTerm,
    ...d.midTerm,
    ...d.mostAffected,
    ...d.doesNotMean,
    ...(e.sourceName ? [e.sourceName] : []),
  ];
}

function rebuildEvent(e: FinanceEvent, t: string[]): FinanceEvent {
  let i = 0;
  const one = () => t[i++];
  const many = (n: number) => t.slice(i, (i += n));
  const d = e.detail;
  return {
    ...e,
    title: one(),
    date: one(),
    summary: one(),
    conclusion: one(),
    audiences: many(e.audiences.length),
    detail: {
      ...d,
      what: one(),
      whyImportant: one(),
      firstImpact: one(),
      transmissionPath: many(d.transmissionPath.length),
      youngPeopleImpact: many(d.youngPeopleImpact.length),
      shortTerm: many(d.shortTerm.length),
      midTerm: many(d.midTerm.length),
      mostAffected: many(d.mostAffected.length),
      doesNotMean: many(d.doesNotMean.length),
    },
    sourceName: e.sourceName ? one() : e.sourceName,
  };
}

/** 翻译单个事件（含详情）；缓存按内容生效。 */
export async function localizeEvent(
  e: FinanceEvent,
  lang: Lang,
): Promise<FinanceEvent> {
  if (lang === "zh") return e;
  const t = await translateBatch(eventStrings(e));
  return rebuildEvent(e, t);
}

export async function localizeEvents(
  events: FinanceEvent[],
  lang: Lang,
): Promise<FinanceEvent[]> {
  if (lang === "zh") return events;
  return Promise.all(events.map((e) => localizeEvent(e, lang)));
}

/** 只翻译事件标题（用于问答卡里的「想看完整推演」链接）。 */
export async function localizeEventTitles(
  events: FinanceEvent[],
  lang: Lang,
): Promise<FinanceEvent[]> {
  if (lang === "zh" || events.length === 0) return events;
  const titles = await translateBatch(events.map((e) => e.title));
  return events.map((e, i) => ({ ...e, title: titles[i] ?? e.title }));
}

export async function localizeNews(
  items: LatestNewsItem[],
  lang: Lang,
): Promise<LatestNewsItem[]> {
  if (lang === "zh" || items.length === 0) return items;
  return Promise.all(
    items.map(async (it) => {
      const t = await translateBatch([it.title, it.summary, it.whyRelevant, it.source]);
      return {
        ...it,
        title: t[0] ?? it.title,
        summary: t[1] ?? it.summary,
        whyRelevant: t[2] ?? it.whyRelevant,
        source: t[3] ?? it.source,
      };
    }),
  );
}

export async function localizeRawNews(
  items: RawNewsItem[],
  lang: Lang,
): Promise<RawNewsItem[]> {
  if (lang === "zh" || items.length === 0) return items;
  return Promise.all(
    items.map(async (it) => {
      const t = await translateBatch([it.title, it.description, it.source]);
      return {
        ...it,
        title: t[0] ?? it.title,
        description: t[1] ?? it.description,
        source: t[2] ?? it.source,
      };
    }),
  );
}

/** 翻译关键词降级路径生成的问答卡（含命中事件的标题）。 */
export async function localizeAnswer(
  answer: AskAnswer,
  lang: Lang,
): Promise<AskAnswer> {
  if (lang === "zh") return answer;
  const dimTexts = answer.byDimension.map((b) => b.text);
  const flat = [
    answer.directAnswer,
    ...answer.path,
    ...dimTexts,
    ...answer.whoAffected,
    ...answer.signals,
    answer.riskNote,
  ];
  const t = await translateBatch(flat);
  let i = 0;
  const one = () => t[i++];
  const many = (n: number) => t.slice(i, (i += n));
  const directAnswer = one();
  const path = many(answer.path.length);
  const dims = many(dimTexts.length);
  const whoAffected = many(answer.whoAffected.length);
  const signals = many(answer.signals.length);
  const riskNote = one();
  const matchedEvents = await localizeEventTitles(answer.matchedEvents, lang);
  return {
    ...answer,
    directAnswer,
    path,
    byDimension: answer.byDimension.map((b, idx) => ({ ...b, text: dims[idx] ?? b.text })),
    whoAffected,
    signals,
    riskNote,
    matchedEvents,
  };
}
