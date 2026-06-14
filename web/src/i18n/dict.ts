// 静态界面文案字典（中 / 英）。
// 只放「界面骨架」文案（导航、标题、按钮、固定说明等），不放 AI 生成内容——
// AI 生成内容（事件、动态、问答）由 src/i18n/translate.ts 在展示时翻译。
//
// 本文件不含任何 server-only 依赖，客户端组件（AskBox、语言切换、推理图）可安全 import。

import type { ImpactDirection, LifeDimension } from "@/data/events";

export type Lang = "zh" | "en";

export const LANG_COOKIE = "lang";
export const DEFAULT_LANG: Lang = "zh";

/** 影响方向标签：以中文 token 为 key（动态/静态内容里都用中文 token），按语言取展示名。 */
export const DIRECTION_LABEL: Record<ImpactDirection, { zh: string; en: string }> = {
  涨价压力: { zh: "涨价压力", en: "Price pressure" },
  降价空间: { zh: "降价空间", en: "Room to fall" },
  招聘收紧: { zh: "招聘收紧", en: "Hiring tightens" },
  招聘回暖: { zh: "招聘回暖", en: "Hiring recovers" },
  借钱变贵: { zh: "借钱变贵", en: "Borrowing costlier" },
  借钱变便宜: { zh: "借钱变便宜", en: "Borrowing cheaper" },
  收入承压: { zh: "收入承压", en: "Income under pressure" },
  存款收益变化: { zh: "存款收益变化", en: "Deposit yields shift" },
};

/** 生活维度标签：同样以中文 token 为 key。 */
export const DIMENSION_LABEL: Record<LifeDimension, { zh: string; en: string }> = {
  找工作: { zh: "找工作", en: "Finding a job" },
  工资收入: { zh: "工资收入", en: "Pay & income" },
  租房成本: { zh: "租房成本", en: "Rent & housing" },
  日常消费: { zh: "日常消费", en: "Daily spending" },
  存钱现金流: { zh: "存钱现金流", en: "Saving & cash flow" },
  理财认知: { zh: "理财认知", en: "Money basics" },
};

export function dirLabel(d: ImpactDirection, lang: Lang): string {
  return DIRECTION_LABEL[d]?.[lang] ?? d;
}

export function dimLabel(d: LifeDimension, lang: Lang): string {
  return DIMENSION_LABEL[d]?.[lang] ?? d;
}

/** 各生活维度在「最终落点」里的措辞（推理图用）。 */
export const LANDING_LABEL: Record<LifeDimension, { zh: string; en: string }> = {
  找工作: { zh: "找工作", en: "finding a job" },
  工资收入: { zh: "工资收入", en: "your pay" },
  租房成本: { zh: "租房成本", en: "your rent" },
  日常消费: { zh: "日常消费", en: "your daily spending" },
  存钱现金流: { zh: "存钱和现金流", en: "your savings and cash flow" },
  理财认知: { zh: "理财选择", en: "your money choices" },
};

type Dict = {
  langName: { zh: string; en: string };
  header: {
    brandBadge: string;
    brand: string;
    navEvents: string;
    navAsk: string;
    switchTo: string; // aria-label-ish title for the toggle target
  };
  home: {
    heroBadge: string;
    heroTitleLine1: string;
    heroTitleLine2: string;
    heroTitleUnderline: string;
    heroSubtitle: string;
    askHeading: string;
    eventsHeading: string;
    eventsDescFull: string;
    eventsDescRaw: string;
    eventsDescEmpty: string;
    updatedAt: string; // prefix
    emptyTitle: string;
    emptySub: string;
    whoHeading: string;
    whoP1Pre: string;
    whoP1Strong: string;
    whoP1Post: string;
    whoP2: string;
    whoWarnPre: string;
    whoWarnStrong1: string;
    whoWarnMid: string;
    whoWarnStrong2: string;
    whoWarnPost: string;
  };
  latest: {
    heading: string;
    desc: string;
    updatedAt: string;
    relation: string; // "和你的关系："
  };
  card: {
    source: string; // "信息来源 · "
  };
  disclaimer: {
    compact: string;
    fullPre: string;
    fullStrong: string;
    fullPost: string;
  };
  footer: {
    lines: string[];
    copyright: string; // brand part after year
  };
  ask: {
    title: string;
    intro: string;
    placeholder: string;
    submit: string;
    analyzing: string;
    samples: string[];
    noMatchTitlePre: string; // before quoted question
    noMatchTitlePost: string;
    noMatchBody: string;
    emptyPrompt: string;
    metaTitle: string;
    metaDesc: string;
  };
  answer: {
    about: string; // "关于「" ... "」"
    aboutClose: string;
    groundedWarn: string;
    secPath: string;
    secByDimension: string;
    secWho: string;
    secSignals: string;
    secRisk: string;
    secMore: string;
  };
  event: {
    back: string;
    sourcePrefix: string;
    viewOriginal: string;
    conclusionLabel: string;
    blocks: string[]; // 10 titles
    riskExtra: string; // appended after RISK_NOTE
    ctaQuestion: string;
    ctaButton: string;
    notFound: string;
  };
  roadmap: {
    caption: string;
    therefore: string;
    origin: string;
    destination: string;
    ringPrefix: string; // "第 " + n + " 环"
    ringSuffix: string;
    destFallback: string;
    destTemplate: (labels: string) => string;
  };
  meta: {
    homeTitle: string;
    homeDesc: string;
  };
};

export const ui: Record<Lang, Dict> = {
  zh: {
    langName: { zh: "中文", en: "English" },
    header: {
      brandBadge: "事",
      brand: "事件影响推演",
      navEvents: "最近事件",
      navAsk: "直接提问",
      switchTo: "English",
    },
    home: {
      heroBadge: "面向年轻人的事件影响解读 ✎",
      heroTitleLine1: "看懂最近大事，",
      heroTitleLine2: "推演它会怎样",
      heroTitleUnderline: "影响你的生活",
      heroSubtitle:
        "不是教你炒股，而是帮你理解未来可能发生什么。把复杂的政治经济事件，翻译成普通人能听懂的生活影响推演。",
      askHeading: "直接问问：「这会对我有什么影响？」",
      eventsHeading: "最近事件",
      eventsDescFull: "根据可信来源最新动态自动生成的推演，点开看完整分析。",
      eventsDescRaw: "来自可信来源的最新真实新闻，点开可直达原文核对。",
      eventsDescEmpty: "正在抓取可信来源的最新事件，稍后再来看看。",
      updatedAt: "更新于 ",
      emptyTitle: "暂时没有可追溯来源的真实事件。",
      emptySub: "本站只展示能点开核对来源的真实事件，不用占位假数据。",
      whoHeading: "这个网站适合谁",
      whoP1Pre: "第一版默认服务",
      whoP1Strong: "年轻个人",
      whoP1Post:
        "，重点覆盖找工作与就业、工资与收入、租房与生活成本、日常消费、存钱与现金流、基础理财认知这几个和生活最贴近的维度。",
      whoP2:
        "它暂不针对专业投资者、企业财务决策或复杂资产配置。它能帮你理解趋势，但不能替代你的投资或重大财务决策。",
      whoWarnPre: "⚠️ 站内事件与推演内容",
      whoWarnStrong1: "仅作示例与参考",
      whoWarnMid: "，用于演示分析方法，",
      whoWarnStrong2: "不代表真实发生的事件或数据",
      whoWarnPost: "，也不构成任何投资建议。",
    },
    latest: {
      heading: "最新动态",
      desc: "自动抓取可信来源的最新时政财经动态，并标注它和你生活的关系。",
      updatedAt: "更新于 ",
      relation: "和你的关系：",
    },
    card: { source: "信息来源 · " },
    disclaimer: {
      compact: "⚠️ 本网站仅用于信息理解与生活影响分析，不构成投资建议。投资需谨慎。",
      fullPre: "本网站仅用于信息理解与生活影响分析，",
      fullStrong: "不构成投资建议",
      fullPost: "。投资需谨慎。",
    },
    footer: {
      lines: [
        "· 这是基于公开事件的生活影响解释，不是对未来的保证。",
        "· 不同行业、地区、收入状态，感受到的影响会不同。",
        "· 短期市场波动不等于生活层面的立即变化。",
        "· 内容只能帮助理解趋势，不能替代个人投资或重大财务决策。",
      ],
      copyright: "事件影响推演 · 仅供信息理解与学习",
    },
    ask: {
      title: "直接提问",
      intro:
        "输入「这会对我有什么影响」，我们会把它映射到相关事件，按你的生活维度给一份清晰的回答卡片。",
      placeholder: "例如：美联储加息会影响我找工作吗",
      submit: "看影响",
      analyzing: "分析中…",
      samples: [
        "美联储加息会影响我找工作吗",
        "油价上涨会让我生活更难吗",
        "通胀上升会影响我存钱吗",
        "房地产政策对我租房有影响吗",
        "出口走弱会影响我的工资吗",
        "存款利率下调我该怎么理财",
      ],
      noMatchTitlePre: "暂时没识别出和「",
      noMatchTitlePost: "」相关的事件",
      noMatchBody:
        "第一版基于一批结构化事件来回答。可以换个说法，或者直接从下面这些最近事件里挑一个看完整推演。",
      emptyPrompt: "在上面输入问题，或点一个示例问题试试。",
      metaTitle: "直接提问 | 事件影响推演",
      metaDesc: "输入你的问题，得到一份按生活维度展开的结构化影响解释。",
    },
    answer: {
      about: "关于「",
      aboutClose: "」",
      groundedWarn:
        "⚠️ 本回答基于一般经济常识推演，未对应当前可追溯的具体新闻事件，仅供理解参考。",
      secPath: "影响路径",
      secByDimension: "按生活维度展开",
      secWho: "哪类年轻人更受影响",
      secSignals: "当前更值得关注的信号",
      secRisk: "风险提示",
      secMore: "想看完整推演",
    },
    event: {
      back: "← 返回最近事件",
      sourcePrefix: "信息来源：",
      viewOriginal: "查看原文",
      conclusionLabel: "一句话结论",
      blocks: [
        "这件事发生了什么",
        "为什么这件事重要",
        "它通常会先影响什么",
        "它会怎样一步步传导到普通人的生活",
        "对年轻人的重点影响",
        "短期更可能发生什么",
        "中期需要留意什么",
        "哪些人更容易感受到影响",
        "这不代表什么",
        "风险提示",
      ],
      riskExtra: "本网站仅用于信息理解与生活影响分析，不构成投资建议。投资需谨慎。",
      ctaQuestion: "想知道它具体会怎么影响你？",
      ctaButton: "直接提问 →",
      notFound: "事件未找到",
    },
    roadmap: {
      caption: "从事件出发，一环扣一环，看它如何一步步影响到你 ✎",
      therefore: "因此……",
      origin: "★ 起点",
      destination: "★ 最终落点",
      ringPrefix: "第 ",
      ringSuffix: " 环",
      destFallback: "最终一步步传导到你的日常生活",
      destTemplate: (labels) => `最终更可能影响到你的${labels}`,
    },
    meta: {
      homeTitle: "事件影响推演 | 看懂大事，推演它会怎样影响你的生活",
      homeDesc:
        "把最近的政治经济事件，翻译成普通人能理解的生活影响推演。不是教你炒股，而是帮你理解未来可能发生什么。本网站仅用于信息理解与生活影响分析，不构成投资建议。",
    },
  },
  en: {
    langName: { zh: "中文", en: "English" },
    header: {
      brandBadge: "E",
      brand: "Event Impact",
      navEvents: "Recent events",
      navAsk: "Ask directly",
      switchTo: "中文",
    },
    home: {
      heroBadge: "Event impact, explained for young people ✎",
      heroTitleLine1: "Make sense of the big news,",
      heroTitleLine2: "and see how it could",
      heroTitleUnderline: "affect your life",
      heroSubtitle:
        "Not stock tips — just help understanding what might happen next. We translate complex political and economic events into plain-language stories about how they touch everyday life.",
      askHeading: "Just ask: “How does this affect me?”",
      eventsHeading: "Recent events",
      eventsDescFull:
        "Analyses auto-generated from the latest trusted-source updates. Tap one for the full breakdown.",
      eventsDescRaw:
        "The latest real news from trusted sources. Tap through to verify against the original.",
      eventsDescEmpty:
        "We’re fetching the latest events from trusted sources — check back soon.",
      updatedAt: "Updated ",
      emptyTitle: "No source-verifiable real events right now.",
      emptySub:
        "We only show real events you can open and verify — no placeholder data.",
      whoHeading: "Who this site is for",
      whoP1Pre: "This first version is built for ",
      whoP1Strong: "young individuals",
      whoP1Post:
        ", focusing on the dimensions closest to everyday life: finding a job and employment, pay and income, rent and cost of living, daily spending, saving and cash flow, and basic money sense.",
      whoP2:
        "It is not aimed at professional investors, corporate finance decisions, or complex asset allocation. It can help you understand trends, but it can’t replace your own investment or major financial decisions.",
      whoWarnPre: "⚠️ The events and analyses on this site are ",
      whoWarnStrong1: "examples and references only",
      whoWarnMid: ", meant to demonstrate the analysis method. They ",
      whoWarnStrong2: "do not represent real events or data",
      whoWarnPost: ", and are not investment advice.",
    },
    latest: {
      heading: "Latest updates",
      desc: "Auto-fetched political and economic news from trusted sources, tagged with how it relates to your life.",
      updatedAt: "Updated ",
      relation: "Why it matters to you: ",
    },
    card: { source: "Source · " },
    disclaimer: {
      compact:
        "⚠️ This site is for understanding information and life-impact analysis only — not investment advice. Invest with caution.",
      fullPre:
        "This site is for understanding information and life-impact analysis only, and ",
      fullStrong: "is not investment advice",
      fullPost: ". Invest with caution.",
    },
    footer: {
      lines: [
        "· These are life-impact explanations based on public events, not guarantees about the future.",
        "· The impact you feel varies by industry, region, and income situation.",
        "· Short-term market swings don’t mean immediate changes to everyday life.",
        "· The content helps you understand trends; it can’t replace personal investment or major financial decisions.",
      ],
      copyright: "Event Impact · For information and learning only",
    },
    ask: {
      title: "Ask directly",
      intro:
        "Type “how does this affect me,” and we’ll map it to relevant events and give you a clear answer card organized by the dimensions of your life.",
      placeholder: "e.g. Will Fed rate hikes affect my job search?",
      submit: "See impact",
      analyzing: "Analyzing…",
      samples: [
        "Will Fed rate hikes affect my job search?",
        "Will rising oil prices make life harder?",
        "Will higher inflation affect my savings?",
        "Do property policies affect my rent?",
        "Will weaker exports affect my pay?",
        "Deposit rates are falling — how should I manage money?",
      ],
      noMatchTitlePre: "Couldn’t find an event related to “",
      noMatchTitlePost: "” for now",
      noMatchBody:
        "This first version answers from a set of structured events. Try rephrasing, or pick one of the recent events below for the full analysis.",
      emptyPrompt: "Type a question above, or tap a sample question to try.",
      metaTitle: "Ask directly | Event Impact",
      metaDesc:
        "Type your question and get a structured impact explanation organized by the dimensions of your life.",
    },
    answer: {
      about: "On “",
      aboutClose: "”",
      groundedWarn:
        "⚠️ This answer is reasoned from general economic knowledge and isn’t tied to a specific, source-verifiable news event — for understanding only.",
      secPath: "Impact pathway",
      secByDimension: "By life dimension",
      secWho: "Which young people are most affected",
      secSignals: "Signals worth watching now",
      secRisk: "Risk note",
      secMore: "See the full analysis",
    },
    event: {
      back: "← Back to recent events",
      sourcePrefix: "Source: ",
      viewOriginal: "View original",
      conclusionLabel: "In one sentence",
      blocks: [
        "What happened",
        "Why it matters",
        "What it usually affects first",
        "How it gradually reaches everyday life",
        "Key impact on young people",
        "What’s more likely in the short term",
        "What to watch in the medium term",
        "Who is most likely to feel it",
        "What it does not mean",
        "Risk note",
      ],
      riskExtra:
        "This site is for understanding information and life-impact analysis only — not investment advice. Invest with caution.",
      ctaQuestion: "Want to know how it affects you specifically?",
      ctaButton: "Ask directly →",
      notFound: "Event not found",
    },
    roadmap: {
      caption:
        "Starting from the event, link by link, see how it reaches you step by step ✎",
      therefore: "And so…",
      origin: "★ Start",
      destination: "★ Where it lands",
      ringPrefix: "Link ",
      ringSuffix: "",
      destFallback: "Eventually works its way through to your everyday life",
      destTemplate: (labels) => `Most likely ends up affecting ${labels}`,
    },
    meta: {
      homeTitle: "Event Impact | Understand the news, see how it affects your life",
      homeDesc:
        "We translate recent political and economic events into life-impact analyses anyone can understand. Not stock tips — help understanding what might happen next. For information and life-impact analysis only; not investment advice.",
    },
  },
};
