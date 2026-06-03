// 新闻源抓取层：从 RSS 源拉取原始条目。
// RSS 不需要 API key，是最低门槛的接入方式。
//
// 配置：环境变量 NEWS_FEEDS（逗号分隔的 RSS 地址）。不配置则用下方默认源。
// 只有来源命中可信源白名单（见 news.ts）的条目才会被保留。

import "server-only";
import { XMLParser } from "fast-xml-parser";
import { resolveTrustedSource } from "@/data/news";

/** 从源拉到的原始条目（未经模型加工） */
export interface RawNewsItem {
  title: string;
  link: string;
  description: string;
  publishedAt: string;
  /** 命中白名单后的来源展示名 */
  source: string;
}

// 默认 RSS 源：经实测「能直连 + 当天更新 + 命中可信源白名单」的几个。
// 英文源由模型在生成阶段翻译改写成中文。线上可用 NEWS_FEEDS 覆盖，按需增减。
const DEFAULT_FEEDS = [
  // 英文权威
  "https://www.federalreserve.gov/feeds/press_all.xml", // 美联储官方新闻稿
  "http://feeds.bbci.co.uk/news/business/rss.xml", // BBC Business
  "https://www.theguardian.com/uk/business/rss", // 卫报 Business
  "https://www.cnbc.com/id/20910258/device/rss/rss.html", // CNBC Economy
  // 中文（更新活跃）
  "https://dedicated.wallstreetcn.com/rss.xml", // 华尔街见闻
];

function getFeeds(): string[] {
  const env = process.env.NEWS_FEEDS;
  if (env && env.trim()) {
    return env.split(",").map((s) => s.trim()).filter(Boolean);
  }
  return DEFAULT_FEEDS;
}

const parser = new XMLParser({ ignoreAttributes: false });

// 常见 HTML 实体解码：RSS 原文会带 &#39; &amp; 这类实体，
// 现在原始条目会被直接展示给用户，需解码成可读字符。
function decodeEntities(s: string): string {
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&");
}

function stripHtml(s: string): string {
  return decodeEntities(s.replace(/<[^>]*>/g, "")).replace(/\s+/g, " ").trim();
}

async function fetchOneFeed(url: string): Promise<RawNewsItem[]> {
  try {
    const res = await fetch(url, {
      headers: { "user-agent": "finance-impact-web/1.0" },
      signal: AbortSignal.timeout(10_000),
      cache: "no-store",
    });
    if (!res.ok) return [];
    const xml = await res.text();
    const doc = parser.parse(xml);
    // 兼容 RSS（channel.item）与 Atom（feed.entry）
    const channel = doc?.rss?.channel ?? doc?.feed;
    const rawItems = channel?.item ?? channel?.entry ?? [];
    const items = Array.isArray(rawItems) ? rawItems : [rawItems];

    return items
      .map((it): RawNewsItem | null => {
        const link =
          typeof it.link === "string"
            ? it.link
            : it.link?.["@_href"] ?? it.guid ?? "";
        const source = resolveTrustedSource(`${link} ${url}`);
        if (!source || !link) return null; // 不在白名单或无链接，丢弃
        return {
          title: stripHtml(it.title?.["#text"] ?? it.title ?? ""),
          link,
          description: stripHtml(
            it.description ?? it.summary ?? it.content?.["#text"] ?? "",
          ).slice(0, 500),
          publishedAt:
            it.pubDate ?? it.published ?? it.updated ?? new Date().toISOString(),
          source,
        };
      })
      .filter((x): x is RawNewsItem => x !== null);
  } catch {
    return [];
  }
}

/** 抓取所有源，合并、按可信源过滤后的原始条目（已限量）。 */
export async function fetchRawNews(limit = 30): Promise<RawNewsItem[]> {
  const feeds = getFeeds();
  const results = await Promise.all(feeds.map(fetchOneFeed));
  const all = results.flat();
  // 按链接去重
  const seen = new Set<string>();
  const deduped = all.filter((it) => {
    if (seen.has(it.link)) return false;
    seen.add(it.link);
    return true;
  });
  return deduped.slice(0, limit);
}
