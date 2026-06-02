// 最新动态的存储层（Vercel Blob）。
// 设计同 llm.ts：留好接口，配置后即用，未配置则优雅降级为「无动态新闻」，页面不报错。
//
// 启用方式：在 Vercel 项目里创建一个 Blob Store（Storage → Create → Blob），
// 它会自动注入 BLOB_READ_WRITE_TOKEN 环境变量。本地开发把该变量写进 .env.local。
//
// 存储抽象在这里，后续若想换成 Postgres / KV，只需替换本文件实现。

import "server-only";
import { put, list } from "@vercel/blob";
import { NewsFeed } from "@/data/news";

const BLOB_PATH = "news/latest.json";

const EMPTY_FEED: NewsFeed = { updatedAt: "", items: [] };

/** 是否已配置 Blob 存储。 */
export function isStoreConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

/** 读取已发布的最新动态。未配置或失败时返回空，调用方据此隐藏该区块。 */
export async function getNewsFeed(): Promise<NewsFeed> {
  if (!isStoreConfigured()) return EMPTY_FEED;
  try {
    const { blobs } = await list({ prefix: BLOB_PATH, limit: 1 });
    const blob = blobs[0];
    if (!blob) return EMPTY_FEED;
    // 加缓存破坏参数，确保读到最新一版
    const res = await fetch(`${blob.url}?t=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) return EMPTY_FEED;
    return (await res.json()) as NewsFeed;
  } catch {
    return EMPTY_FEED;
  }
}

/** 写入最新动态（覆盖同一路径）。供定时任务调用。 */
export async function saveNewsFeed(feed: NewsFeed): Promise<void> {
  if (!isStoreConfigured()) {
    throw new Error("Blob store not configured: missing BLOB_READ_WRITE_TOKEN");
  }
  await put(BLOB_PATH, JSON.stringify(feed), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}
