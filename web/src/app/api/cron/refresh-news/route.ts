// 定时刷新最新动态的接口。由 Vercel Cron 按 vercel.json 的计划触发。
// 安全：用 CRON_SECRET 校验，防止被公开调用。Vercel Cron 会自动带上
// Authorization: Bearer <CRON_SECRET>。也可手动带同样的头来触发一次。

import { NextRequest, NextResponse } from "next/server";
import { refreshNews } from "@/lib/news-pipeline";
import { refreshEvents } from "@/lib/events-pipeline";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  // 同一次定时任务里同时刷新「完整推演事件」和「最新动态」。
  // 事件是重点，优先生成。
  const eventsResult = await refreshEvents();
  const newsResult = await refreshNews();

  return NextResponse.json({
    events: eventsResult.ok
      ? { ok: true, updatedAt: eventsResult.feed.updatedAt, count: eventsResult.feed.events.length }
      : { ok: false, reason: eventsResult.reason },
    news: newsResult.ok
      ? { ok: true, updatedAt: newsResult.feed.updatedAt, count: newsResult.feed.items.length }
      : { ok: false, reason: newsResult.reason },
  });
}
