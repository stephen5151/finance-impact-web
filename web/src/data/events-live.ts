// 「展示用事件」访问层：优先用自动生成的动态事件，没有则回退到静态样例事件。
// 首页「最近事件」、事件详情页、都通过这里取数据，从而在「配了 key 自动更新」
// 与「没配 key 显示静态样例」之间无缝切换。

import { events as staticEvents, FinanceEvent } from "./events";
import { getEventsFeed } from "@/lib/news-store";

export interface DisplayEvents {
  events: FinanceEvent[];
  /** 是否来自自动生成（true=动态，false=静态兜底） */
  live: boolean;
  /** 动态内容的更新时间（静态时为空） */
  updatedAt: string;
}

/** 取首页要展示的一批事件：有动态用动态，否则回退静态样例。 */
export async function getDisplayEvents(): Promise<DisplayEvents> {
  const feed = await getEventsFeed();
  if (feed.events && feed.events.length > 0) {
    return { events: feed.events, live: true, updatedAt: feed.updatedAt };
  }
  return { events: staticEvents, live: false, updatedAt: "" };
}

/** 按 slug 取单个事件：先查动态，再查静态。 */
export async function getDisplayEvent(
  slug: string,
): Promise<FinanceEvent | undefined> {
  const feed = await getEventsFeed();
  return (
    feed.events?.find((e) => e.slug === slug) ??
    staticEvents.find((e) => e.slug === slug)
  );
}
