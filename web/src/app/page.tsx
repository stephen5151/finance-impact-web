import { EventCard } from "@/components/EventCard";
import { RawEventCard } from "@/components/RawEventCard";
import { AskBox } from "@/components/AskBox";
import { Disclaimer } from "@/components/Disclaimer";
import { LatestNews } from "@/components/LatestNews";
import { getNewsFeed } from "@/lib/news-store";
import { getDisplayEvents } from "@/data/events-live";
import { getLang } from "@/i18n/lang";
import { ui } from "@/i18n/dict";
import { localizeEvents, localizeNews, localizeRawNews } from "@/i18n/translate";

// 每小时重新读取一次动态内容（实际更新频率由 cron 决定）
export const revalidate = 3600;

export default async function Home() {
  const lang = await getLang();
  const t = ui[lang].home;
  const feed = await getNewsFeed();
  const display = await getDisplayEvents();

  const newsItems = await localizeNews(feed.items, lang);
  const localizedDisplay =
    display.kind === "full"
      ? { ...display, events: await localizeEvents(display.events, lang) }
      : display.kind === "raw"
        ? { ...display, rawItems: await localizeRawNews(display.rawItems, lang) }
        : display;
  const dateLocale = lang === "en" ? "en-US" : "zh-CN";

  return (
    <div className="mx-auto max-w-5xl px-5">
      {/* Hero 区 */}
      <section className="pt-16 pb-10 text-center sm:pt-24">
        <p className="font-sketch mb-4 inline-block rounded-full border border-stone-200 bg-white px-3.5 py-1 text-base text-stone-500">
          {t.heroBadge}
        </p>
        <h1 className="mx-auto max-w-2xl text-3xl font-bold leading-tight tracking-tight sm:text-5xl sm:leading-[1.15]">
          {t.heroTitleLine1}
          <br className="hidden sm:block" />
          {t.heroTitleLine2}
          {lang === "en" ? " " : ""}
          <span className="relative inline-block">
            {t.heroTitleUnderline}
            <span className="absolute -bottom-1.5 left-0 h-[3px] w-full rounded-full bg-stone-900" />
          </span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-stone-600 sm:text-lg">
          {t.heroSubtitle}
        </p>
      </section>

      {/* 风险提示条 */}
      <div className="mx-auto max-w-2xl">
        <Disclaimer lang={lang} />
      </div>

      {/* 提问框区 */}
      <section className="mx-auto mt-8 max-w-2xl">
        <h2 className="font-sketch mb-3 text-center text-xl text-stone-600">
          {t.askHeading}
        </h2>
        <AskBox lang={lang} />
      </section>

      {/* 最新动态区（自动抓取，未配置或无数据时不渲染） */}
      <LatestNews items={newsItems} updatedAt={feed.updatedAt} lang={lang} />

      {/* 最近事件区：只展示「有据可查、可追溯到来源网站」的真实事件 */}
      <section id="events" className="mt-20 scroll-mt-20">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">最近事件</h2>
            <p className="mt-1 text-sm text-stone-500">
              {display.kind === "full" &&
                "根据可信来源最新动态自动生成的推演，点开看完整分析。"}
              {display.kind === "raw" &&
                "来自可信来源的最新真实新闻，点开可直达原文核对。"}
              {display.kind === "empty" &&
                "正在抓取可信来源的最新事件，稍后再来看看。"}
              {display.kind !== "empty" && display.updatedAt && (
                <span className="ml-1 text-stone-400">
                  更新于 {new Date(display.updatedAt).toLocaleDateString("zh-CN")}
                </span>
              )}
            </p>
          </div>
        </div>

        {display.kind === "full" && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {display.events.map((event) => (
              <EventCard key={event.slug} event={event} />
            ))}
          </div>
        )}

        {display.kind === "raw" && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {display.rawItems.map((item) => (
              <RawEventCard key={item.link} item={item} />
            ))}
          </div>
        )}

        {display.kind === "empty" && (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-white/60 px-6 py-12 text-center">
            <p className="text-sm text-stone-500">
              暂时没有可追溯来源的真实事件。
            </p>
            <p className="mt-1 text-xs text-stone-400">
              本站只展示能点开核对来源的真实事件，不用占位假数据。
            </p>
          </div>
        )}
      </section>

      {/* 适用对象说明 */}
      <section className="mt-12 mb-20 rounded-2xl bg-stone-900 px-6 py-8 text-stone-50 sm:px-10">
        <h2 className="text-xl font-bold tracking-tight">这个网站适合谁</h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-stone-300">
          第一版默认服务<strong className="text-stone-50">年轻个人</strong>
          ，重点覆盖找工作与就业、工资与收入、租房与生活成本、日常消费、存钱与现金流、基础理财认知这几个和生活最贴近的维度。
        </p>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-stone-400">
          它暂不针对专业投资者、企业财务决策或复杂资产配置。
          它能帮你理解趋势，但不能替代你的投资或重大财务决策。
        </p>
        <p className="mt-4 max-w-2xl rounded-xl border border-stone-700 bg-stone-800/60 px-4 py-3 text-sm leading-relaxed text-stone-300">
          ⚠️ 站内事件与推演内容<strong className="text-stone-50">仅作示例与参考</strong>
          ，用于演示分析方法，<strong className="text-stone-50">不代表真实发生的事件或数据</strong>
          ，也不构成任何投资建议。
        </p>
      </section>
    </div>
  );
}
