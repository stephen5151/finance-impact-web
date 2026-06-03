// 「展示用事件」访问层。
// 原则：首页「最近事件」只展示「有据可查、可追溯到来源网站」的真实事件，
// 不再用手写的静态假数据顶替。取数优先级：
//   1. LLM 加工后的完整推演事件（带真实原文链接）
//   2. 直接抓取的真实 RSS 新闻（带来源网站，可点开核对）
//   3. 都没有 → 空状态，由页面提示「正在抓取」，绝不展示无来源的占位事件
//
// 注：静态样例事件（events.ts）仍保留，用于「直接提问」问答库与其示例详情页，
// 但不再作为首页「最近事件」的兜底。

import { events as staticEvents, FinanceEvent } from "./events";
import { getEventsFeed } from "@/lib/news-store";
import { fetchRawNews, RawNewsItem } from "@/lib/news-sources";

/** 首页「最近事件」的展示数据：三态，且任一真实态都带可追溯来源。 */
export type DisplayEvents =
  | { kind: "full"; events: FinanceEvent[]; updatedAt: string }
  | { kind: "raw"; rawItems: RawNewsItem[]; updatedAt: string }
  | { kind: "empty" };

/** 取首页要展示的一批事件：LLM 推演事件 > 真实 RSS 新闻 > 空。 */
export async function getDisplayEvents(): Promise<DisplayEvents> {
  // 1. 优先用 LLM 加工后的完整推演事件
  const feed = await getEventsFeed();
  if (feed.events && feed.events.length > 0) {
    return { kind: "full", events: feed.events, updatedAt: feed.updatedAt };
  }

  // 2. 没有推演事件时，直接展示真实 RSS 新闻（带来源网站，可追溯）
  const rawItems = await fetchRawNews(6);
  if (rawItems.length > 0) {
    return { kind: "raw", rawItems, updatedAt: new Date().toISOString() };
  }

  // 3. 都没有：空状态，绝不用假数据顶替
  return { kind: "empty" };
}

/**
 * 按 slug 取单个事件详情：先查 LLM 动态事件，再查静态样例。
 * 静态样例详情页仍服务于「直接提问」里的示例链接，故保留兜底。
 */
export async function getDisplayEvent(
  slug: string,
): Promise<FinanceEvent | undefined> {
  const feed = await getEventsFeed();
  return (
    feed.events?.find((e) => e.slug === slug) ??
    staticEvents.find((e) => e.slug === slug)
  );
}
