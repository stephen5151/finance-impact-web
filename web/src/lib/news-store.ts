// 动态内容的存储层（Vercel Blob）。
// 设计同 llm.ts：留好接口，配置后即用，未配置则优雅降级为「无动态内容」，页面不报错。
//
// 启用方式：在 Vercel 项目里创建一个 Blob Store（Storage → Create → Blob），
// 它会自动注入 BLOB_READ_WRITE_TOKEN 环境变量。本地开发把该变量写进 .env.local。
//
// 存储抽象在这里，后续若想换成 Postgres / KV，只需替换本文件实现。

import "server-only";
import { put, list } from "@vercel/blob";
import { NewsFeed, EventsFeed } from "@/data/news";

const NEWS_PATH = "news/latest.json";
const EVENTS_PATH = "events/latest.json";

const EMPTY_NEWS: NewsFeed = { updatedAt: "", items: [] };
const EMPTY_EVENTS: EventsFeed = { updatedAt: "", events: [] };

/** 是否已配置 Blob 存储。 */
export function isStoreConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

async function readJSON<T>(path: string, fallback: T): Promise<T> {
  if (!isStoreConfigured()) return fallback;
  try {
    const { blobs } = await list({ prefix: path, limit: 1 });
    const blob = blobs[0];
    if (!blob) return fallback;
    // 加缓存破坏参数，确保读到最新一版
    const res = await fetch(`${blob.url}?t=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) return fallback;
    return (await res.json()) as T;
  } catch {
    return fallback;
  }
}

async function writeJSON(path: string, data: unknown): Promise<void> {
  if (!isStoreConfigured()) {
    throw new Error("Blob store not configured: missing BLOB_READ_WRITE_TOKEN");
  }
  await put(path, JSON.stringify(data), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}

/** 读取已发布的最新动态。未配置或失败时返回空，调用方据此隐藏该区块。 */
export function getNewsFeed(): Promise<NewsFeed> {
  return readJSON(NEWS_PATH, EMPTY_NEWS);
}

/** 写入最新动态（覆盖）。供定时任务调用。 */
export function saveNewsFeed(feed: NewsFeed): Promise<void> {
  return writeJSON(NEWS_PATH, feed);
}

/** 读取自动生成的完整推演事件。未配置或失败时返回空，调用方回退到静态事件。 */
export function getEventsFeed(): Promise<EventsFeed> {
  return readJSON(EVENTS_PATH, EMPTY_EVENTS);
}

/** 写入自动生成的完整推演事件（覆盖）。供定时任务调用。 */
export function saveEventsFeed(feed: EventsFeed): Promise<void> {
  return writeJSON(EVENTS_PATH, feed);
}
