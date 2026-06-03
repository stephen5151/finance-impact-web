import { EventCard } from "@/components/EventCard";
import { AskBox } from "@/components/AskBox";
import { Disclaimer } from "@/components/Disclaimer";
import { LatestNews } from "@/components/LatestNews";
import { getNewsFeed } from "@/lib/news-store";
import { getDisplayEvents } from "@/data/events-live";

// 每小时重新读取一次动态内容（实际更新频率由 cron 决定）
export const revalidate = 3600;

export default async function Home() {
  const feed = await getNewsFeed();
  const { events, live, updatedAt } = await getDisplayEvents();

  return (
    <div className="mx-auto max-w-5xl px-5">
      {/* Hero 区 */}
      <section className="pt-16 pb-10 text-center sm:pt-24">
        <p className="font-sketch mb-4 inline-block rounded-full border border-stone-200 bg-white px-3.5 py-1 text-base text-stone-500">
          面向年轻人的事件影响解读 ✎
        </p>
        <h1 className="mx-auto max-w-2xl text-3xl font-bold leading-tight tracking-tight sm:text-5xl sm:leading-[1.15]">
          看懂最近大事，
          <br className="hidden sm:block" />
          推演它会怎样
          <span className="relative inline-block">
            影响你的生活
            <span className="absolute -bottom-1.5 left-0 h-[3px] w-full rounded-full bg-stone-900" />
          </span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-stone-600 sm:text-lg">
          不是教你炒股，而是帮你理解未来可能发生什么。
          把复杂的政治经济事件，翻译成普通人能听懂的生活影响推演。
        </p>
      </section>

      {/* 风险提示条 */}
      <div className="mx-auto max-w-2xl">
        <Disclaimer />
      </div>

      {/* 提问框区 */}
      <section className="mx-auto mt-8 max-w-2xl">
        <h2 className="font-sketch mb-3 text-center text-xl text-stone-600">
          直接问问：「这会对我有什么影响？」
        </h2>
        <AskBox />
      </section>

      {/* 最新动态区（自动抓取，未配置或无数据时不渲染） */}
      <LatestNews items={feed.items} updatedAt={feed.updatedAt} />

      {/* 最近事件区 */}
      <section id="events" className="mt-20 scroll-mt-20">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">最近事件</h2>
            <p className="mt-1 text-sm text-stone-500">
              {live
                ? "根据可信来源最新动态自动生成的推演，点开看完整分析。"
                : "最近一两个月值得关注的政治经济事件，点开看完整推演。"}
              {live && updatedAt && (
                <span className="ml-1 text-stone-400">
                  更新于 {new Date(updatedAt).toLocaleDateString("zh-CN")}
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <EventCard key={event.slug} event={event} />
          ))}
        </div>
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
