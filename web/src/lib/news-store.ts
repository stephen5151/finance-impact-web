// 动态内容的存储层（GitHub Gist 后端）。
// 选用 Gist 的原因：免费、无需绑定支付方式、与 Vercel 部署完全解耦
//（写入不会触发任何重新部署），适合存这种几十 KB 的小 JSON。
//
// 设计同 llm.ts：留好接口，配置后即用，未配置则优雅降级为「无动态内容」，页面不报错。
//
// 启用方式（两个环境变量）：
//   GITHUB_TOKEN  一个有 gist 读写权限的 GitHub Token（fine-grained 勾选 Gists: Read and write，
//                 或 classic token 勾选 gist scope）。
//   GIST_ID       一个用来存数据的 gist 的 ID（新建一个 secret gist，随便放个占位文件即可，
//                 URL 里 gist.github.com/<user>/<这一段> 就是 ID）。
//
// 存储抽象都在本文件，后续若想换回 Blob / 换成 KV，只需替换这里的实现。

import "server-only";
import { NewsFeed, EventsFeed } from "@/data/news";

const NEWS_FILE = "finance-news.json";
const EVENTS_FILE = "finance-events.json";
const API = "https://api.github.com";

const EMPTY_NEWS: NewsFeed = { updatedAt: "", items: [] };
const EMPTY_EVENTS: EventsFeed = { updatedAt: "", events: [] };

function config(): { token: string; gistId: string } | null {
  const token = process.env.GITHUB_TOKEN;
  const gistId = process.env.GIST_ID;
  return token && gistId ? { token, gistId } : null;
}

/** 是否已配置存储（GITHUB_TOKEN + GIST_ID）。 */
export function isStoreConfigured(): boolean {
  return config() !== null;
}

async function readFile<T>(name: string, fallback: T): Promise<T> {
  const c = config();
  if (!c) return fallback;
  try {
    const res = await fetch(`${API}/gists/${c.gistId}`, {
      headers: {
        authorization: `Bearer ${c.token}`,
        accept: "application/vnd.github+json",
      },
      cache: "no-store",
    });
    if (!res.ok) return fallback;
    const data = await res.json();
    const file = data?.files?.[name];
    if (!file) return fallback;
    // 内容 < 1MB 时 content 直接带回；超大才会 truncated，再去 raw_url 取
    let content: string | undefined = file.content;
    if (file.truncated && file.raw_url) {
      const r2 = await fetch(file.raw_url, { cache: "no-store" });
      if (r2.ok) content = await r2.text();
    }
    if (!content) return fallback;
    return JSON.parse(content) as T;
  } catch {
    return fallback;
  }
}

async function writeFile(name: string, data: unknown): Promise<void> {
  const c = config();
  if (!c) {
    throw new Error("Store not configured: missing GITHUB_TOKEN / GIST_ID");
  }
  const res = await fetch(`${API}/gists/${c.gistId}`, {
    method: "PATCH",
    headers: {
      authorization: `Bearer ${c.token}`,
      accept: "application/vnd.github+json",
      "content-type": "application/json",
    },
    body: JSON.stringify({ files: { [name]: { content: JSON.stringify(data) } } }),
  });
  if (!res.ok) {
    throw new Error(`gist write ${res.status}: ${await res.text()}`);
  }
}

/** 读取已发布的最新动态。未配置或失败时返回空，调用方据此隐藏该区块。 */
export function getNewsFeed(): Promise<NewsFeed> {
  return readFile(NEWS_FILE, EMPTY_NEWS);
}

/** 写入最新动态（覆盖）。供定时任务调用。 */
export function saveNewsFeed(feed: NewsFeed): Promise<void> {
  return writeFile(NEWS_FILE, feed);
}

/** 读取自动生成的完整推演事件。未配置或失败时返回空，调用方回退到真实 RSS / 空状态。 */
export function getEventsFeed(): Promise<EventsFeed> {
  return readFile(EVENTS_FILE, EMPTY_EVENTS);
}

/** 写入自动生成的完整推演事件（覆盖）。供定时任务调用。 */
export function saveEventsFeed(feed: EventsFeed): Promise<void> {
  return writeFile(EVENTS_FILE, feed);
}
