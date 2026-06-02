// 实时新闻（最新动态）的数据类型与可信源白名单。
// 这部分内容由定时任务自动抓取 + 模型加工生成（见 src/lib/news-pipeline.ts），
// 与人工审核的结构化事件（events.ts）分开维护、分开展示。

import { ImpactDirection, LifeDimension } from "./events";

/** 经模型加工后的一条「最新动态」 */
export interface LatestNewsItem {
  /** 稳定 id（用源链接哈希得到，用于去重） */
  id: string;
  /** 标题（可能由模型改写得更通俗） */
  title: string;
  /** 一句话讲清这件事 */
  summary: string;
  /** 为什么和年轻人的生活有关 */
  whyRelevant: string;
  /** 影响方向标签，复用事件的标签体系 */
  directions: ImpactDirection[];
  /** 涉及的生活维度 */
  dimensions: LifeDimension[];
  /** 来源名称（白名单内） */
  source: string;
  /** 原文链接 */
  sourceUrl: string;
  /** 发布时间（ISO 字符串，取不到则为抓取时间） */
  publishedAt: string;
}

/** 自动发布到页面的整批数据（含整体更新时间） */
export interface NewsFeed {
  updatedAt: string;
  items: LatestNewsItem[];
}

/**
 * 可信源白名单：只有来源命中名单，模型加工后的内容才自动发布到页面。
 * 名单外来源不自动展示（符合 spec 13.3「可信源自动发布」决策）。
 * key 是用于匹配 feed host 或来源名的关键片段，value 是对外展示的来源名。
 */
export const TRUSTED_SOURCES: { match: string; name: string }[] = [
  { match: "gov.cn", name: "中国政府网" },
  { match: "stats.gov.cn", name: "国家统计局" },
  { match: "pbc.gov.cn", name: "中国人民银行" },
  { match: "xinhuanet.com", name: "新华网" },
  { match: "people.com.cn", name: "人民网" },
  { match: "cls.cn", name: "财联社" },
  { match: "yicai.com", name: "第一财经" },
  { match: "caixin.com", name: "财新网" },
  { match: "eastmoney.com", name: "东方财富" },
  { match: "reuters.com", name: "路透" },
  { match: "ftchinese.com", name: "FT中文网" },
];

/** 判断某个链接/来源是否在可信源白名单内；命中返回展示名，否则 null。 */
export function resolveTrustedSource(urlOrName: string): string | null {
  const s = urlOrName.toLowerCase();
  for (const t of TRUSTED_SOURCES) {
    if (s.includes(t.match)) return t.name;
  }
  return null;
}
