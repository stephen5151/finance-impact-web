// 定时刷新最新动态的接口。由 Vercel Cron 按 vercel.json 的计划触发。
// 安全：用 CRON_SECRET 校验，防止被公开调用。Vercel Cron 会自动带上
// Authorization: Bearer <CRON_SECRET>。也可手动带同样的头来触发一次。

import { NextRequest, NextResponse } from "next/server";
import { refreshNews } from "@/lib/news-pipeline";

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

  const result = await refreshNews();
  if (!result.ok) {
    return NextResponse.json({ ok: false, reason: result.reason }, { status: 200 });
  }
  return NextResponse.json({
    ok: true,
    updatedAt: result.feed.updatedAt,
    count: result.feed.items.length,
  });
}
