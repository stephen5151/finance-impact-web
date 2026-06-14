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
            <h2 className="text-2xl font-bold tracking-tight">
              {t.eventsHeading}
            </h2>
            <p className="mt-1 text-sm text-stone-500">
              {localizedDisplay.kind === "full" && t.eventsDescFull}
              {localizedDisplay.kind === "raw" && t.eventsDescRaw}
              {localizedDisplay.kind === "empty" && t.eventsDescEmpty}
              {localizedDisplay.kind !== "empty" && localizedDisplay.updatedAt && (
                <span className="ml-1 text-stone-400">
                  {t.updatedAt}
                  {new Date(localizedDisplay.updatedAt).toLocaleDateString(
                    dateLocale,
                  )}
                </span>
              )}
            </p>
          </div>
        </div>

        {localizedDisplay.kind === "full" && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {localizedDisplay.events.map((event) => (
              <EventCard key={event.slug} event={event} lang={lang} />
            ))}
          </div>
        )}

        {localizedDisplay.kind === "raw" && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {localizedDisplay.rawItems.map((item) => (
              <RawEventCard key={item.link} item={item} lang={lang} />
            ))}
          </div>
        )}

        {localizedDisplay.kind === "empty" && (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-white/60 px-6 py-12 text-center">
            <p className="text-sm text-stone-500">{t.emptyTitle}</p>
            <p className="mt-1 text-xs text-stone-400">{t.emptySub}</p>
          </div>
        )}
      </section>

      {/* 适用对象说明 */}
      <section className="mt-12 mb-20 rounded-2xl bg-stone-900 px-6 py-8 text-stone-50 sm:px-10">
        <h2 className="text-xl font-bold tracking-tight">{t.whoHeading}</h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-stone-300">
          {t.whoP1Pre}
          <strong className="text-stone-50">{t.whoP1Strong}</strong>
          {t.whoP1Post}
        </p>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-stone-400">
          {t.whoP2}
        </p>
        <p className="mt-4 max-w-2xl rounded-xl border border-stone-700 bg-stone-800/60 px-4 py-3 text-sm leading-relaxed text-stone-300">
          {t.whoWarnPre}
          <strong className="text-stone-50">{t.whoWarnStrong1}</strong>
          {t.whoWarnMid}
          <strong className="text-stone-50">{t.whoWarnStrong2}</strong>
          {t.whoWarnPost}
        </p>
      </section>
    </div>
  );
}
