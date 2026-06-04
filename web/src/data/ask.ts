// 问题映射：把用户的自然语言问题，映射到结构化事件 + 生活维度，
// 生成稳定、可校对的结构化回答。第一版不调用大模型，全部基于关键词匹配，
// 保证内容稳定、不空泛、易上线。

import { events, FinanceEvent, LifeDimension, RISK_NOTE } from "./events";

export interface AskAnswer {
  /** 用户原始问题 */
  question: string;
  /** 命中的事件（按相关度排序） */
  matchedEvents: FinanceEvent[];
  /** 识别到的生活维度 */
  dimensions: LifeDimension[];
  /** 一句话直接回答 */
  directAnswer: string;
  /** 影响路径 */
  path: string[];
  /** 按生活维度展开的影响 */
  byDimension: { dimension: LifeDimension; text: string }[];
  /** 哪类年轻人更受影响 */
  whoAffected: string[];
  /** 当前更值得关注的信号 */
  signals: string[];
  /** 风险提示 */
  riskNote: string;
}

const DIMENSION_KEYWORDS: Record<LifeDimension, string[]> = {
  找工作: ["工作", "找工作", "就业", "招聘", "实习", "毕业", "裁员", "offer", "求职", "饭碗"],
  工资收入: ["工资", "收入", "涨薪", "加薪", "奖金", "薪水", "降薪", "加班费"],
  租房成本: ["租房", "房租", "租金", "买房", "房贷", "房价", "住"],
  日常消费: ["消费", "买东西", "物价", "涨价", "吃饭", "外卖", "出行", "打车", "购物", "贵"],
  存钱现金流: ["存钱", "攒钱", "储蓄", "现金流", "存款", "省钱", "月光", "压力"],
  理财认知: ["理财", "投资", "基金", "股票", "收益", "钱生钱", "资产"],
};

// 针对每个事件、每个生活维度，预置稳定的影响表达，避免空泛回答。
const DIMENSION_TEXT: Record<string, Partial<Record<LifeDimension, string>>> = {
  "fed-rate-hold-high": {
    找工作: "靠融资扩张的成长型行业（互联网、创投相关）招聘更可能先收紧，求职竞争可能更激烈一些。",
    工资收入: "整体涨薪节奏更可能放缓，跳槽要求大幅涨薪的难度上升。",
    日常消费: "高利率本身对日常物价影响有限，但会通过抑制经济间接影响消费意愿。",
    租房成本: "对租金没有直接影响，更多通过房贷成本影响买房决策。",
    存钱现金流: "存款利率短期相对友好，但信用卡分期、贷款等借钱成本也偏高，要控制负债。",
    理财认知: "高利率环境下，稳健存款收益相对不差，不必为追高收益承担过高风险。",
  },
  "oil-price-surge": {
    找工作: "航空、物流、化工等和油价高度相关的行业景气会随之波动。",
    工资收入: "对工资没有直接影响，主要通过生活成本上升间接挤压可支配收入。",
    日常消费: "打车、外卖、长途出行和部分依赖运输的商品更可能慢慢变贵。",
    租房成本: "对房租没有直接影响。",
    存钱现金流: "通勤和生活开支上升，会挤压每月能存下来的钱。",
    理财认知: "油价波动很大，不建议因短期涨价就追逐能源相关投资。",
  },
  "inflation-rebound": {
    找工作: "通胀本身不直接决定就业，但会影响央行政策，从而间接影响经济和招聘。",
    工资收入: "如果涨薪赶不上物价，实际购买力其实在缩水，要关注「实际收入」。",
    日常消费: "吃饭、日用品、服务类支出更可能继续偏贵，钱更不经花。",
    租房成本: "生活成本整体上升时，租金也更难明显下降。",
    存钱现金流: "每月能存下来的钱被生活成本挤压，攒钱更吃力。",
    理财认知: "低风险存款可能跑不赢通胀，理财更要关注「跑赢通胀」而非名义收益。",
  },
  "property-policy-easing": {
    找工作: "建筑、装修、家电、中介等地产产业链相关岗位的景气可能逐步改善。",
    工资收入: "相关行业景气改善后，收入预期才会慢慢跟上，传导较慢。",
    日常消费: "对日常消费的直接影响较小。",
    租房成本: "政策更多作用于买卖，对租金的影响通常较慢、较间接。",
    存钱现金流: "如果有买房计划，房贷利率和首付下调是直接的成本利好。",
    理财认知: "政策托底不等于房价必涨，买房仍要量力而行。",
  },
  "geopolitical-tension": {
    找工作: "出口导向和受供应链影响大的行业波动会加大。",
    工资收入: "通过行业景气波动间接影响浮动收入。",
    日常消费: "能源和进口相关商品更可能出现涨价压力。",
    租房成本: "对房租没有直接影响。",
    存钱现金流: "若涨价压力扩散，生活开支上升会挤压现金流。",
    理财认知: "市场短期波动会变大，更不适合追涨杀跌，注意控制风险。",
  },
  "export-manufacturing-weak": {
    找工作: "制造业、外贸相关岗位招聘更可能先收紧，应届生求职难度上升。",
    工资收入: "加班费、奖金等浮动收入更容易被压缩。",
    日常消费: "对日常消费的直接影响较小。",
    租房成本: "对房租没有直接影响。",
    存钱现金流: "收入不稳会直接影响储蓄节奏，建议预留应急资金。",
    理财认知: "收入波动期更应优先保证应急储备，而非激进投资。",
  },
  "consumption-stimulus": {
    找工作: "青年就业扶持和被支持行业可能释放更多岗位和实习机会。",
    工资收入: "行业景气改善后，收入预期才会逐步跟上。",
    日常消费: "补贴和促销可能带来阶段性的降价或优惠。",
    租房成本: "对房租没有直接影响。",
    存钱现金流: "利用补贴和优惠，短期有助于节省部分日常开支。",
    理财认知: "政策刺激带来的机会通常是阶段性的，不宜过度押注。",
  },
  "deposit-rate-cut": {
    找工作: "对就业没有直接影响。",
    工资收入: "如果有房贷，月供成本可能下降，相当于变相减负。",
    日常消费: "低利率鼓励消费，但对具体物价影响有限。",
    租房成本: "对房租没有直接影响。",
    存钱现金流: "靠存款吃利息的收益变低，攒钱速度受影响。",
    理财认知: "低利率环境下要重新认识风险与收益，警惕高收益高风险陷阱。",
  },
};

function scoreEvent(event: FinanceEvent, q: string): number {
  let score = 0;
  // 仅按「关键词命中」打分。之前用「标题单字命中 +0.05」做加权，
  // 但中文里「不/我/的」这类常用字会和几乎任何问题撞上，导致无关问题
  // （甚至「我家猫不吃饭」）也被误判成命中某个财经事件 → 给出离谱答案。
  // 去掉该噪声项，只有真正出现事件关键词才算相关。
  for (const kw of event.keywords) {
    if (q.includes(kw)) score += 3;
  }
  return score;
}

/**
 * 用「命中的事件 + 生活维度」组装结构化回答。
 * 结论、传导路径、影响人群等均取自审核过的静态内容，
 * 因此无论是关键词匹配还是模型匹配，最终输出都落在可信内容边界内。
 * 供 V1 关键词匹配与 V2 模型匹配（见 ask-llm.ts）共用。
 */
export function buildAnswer(
  question: string,
  matchedEvents: FinanceEvent[],
  dimensions: LifeDimension[],
): AskAnswer | null {
  const primary = matchedEvents[0];
  if (!primary) return null;

  const dims = dimensions.length > 0 ? dimensions : primary.dimensions.slice(0, 4);

  const byDimension = dims
    .map((dim) => {
      const text = DIMENSION_TEXT[primary.slug]?.[dim];
      return text ? { dimension: dim, text } : null;
    })
    .filter((x): x is { dimension: LifeDimension; text: string } => x !== null);

  return {
    question,
    matchedEvents,
    dimensions: dims,
    directAnswer: primary.conclusion,
    path: primary.detail.transmissionPath,
    byDimension,
    whoAffected: primary.detail.mostAffected,
    signals: [...primary.detail.shortTerm, ...primary.detail.midTerm.slice(0, 1)],
    riskNote: RISK_NOTE,
  };
}

/** V1：纯关键词匹配。也是 V2 模型不可用时的降级路径。 */
export function answerQuestion(question: string): AskAnswer | null {
  const q = question.trim().toLowerCase();
  if (!q) return null;

  // 1. 找出命中的事件
  const ranked = events
    .map((e) => ({ e, s: scoreEvent(e, q) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s);

  // 2. 识别生活维度
  const detected: LifeDimension[] = [];
  (Object.keys(DIMENSION_KEYWORDS) as LifeDimension[]).forEach((dim) => {
    if (DIMENSION_KEYWORDS[dim].some((kw) => q.includes(kw.toLowerCase()))) {
      detected.push(dim);
    }
  });

  if (ranked.length === 0) {
    // 没有命中任何事件：返回 null，由页面展示「无法识别」的空状态
    return null;
  }

  const matchedEvents = ranked.slice(0, 2).map((x) => x.e);
  return buildAnswer(question, matchedEvents, detected);
}

// 首页展示的问题示例
export const SAMPLE_QUESTIONS = [
  "美联储加息会影响我找工作吗",
  "油价上涨会让我生活更难吗",
  "通胀上升会影响我存钱吗",
  "房地产政策对我租房有影响吗",
  "出口走弱会影响我的工资吗",
  "存款利率下调我该怎么理财",
];
