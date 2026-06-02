import { events } from "@/data/events";
import { EventCard } from "@/components/EventCard";
import { AskBox } from "@/components/AskBox";
import { Disclaimer } from "@/components/Disclaimer";
import { LatestNews } from "@/components/LatestNews";
import { getNewsFeed } from "@/lib/news-store";

// 每小时重新读取一次动态新闻（实际更新频率由 cron 决定）
export const revalidate = 3600;

export default async function Home() {
  const feed = await getNewsFeed();

  return (
    <div className="mx-auto max-w-5xl px-5">
      {/* Hero 区 */}
      <section className="pt-16 pb-10 text-center sm:pt-24">
        <p className="mb-4 inline-block rounded-full border border-stone-200 bg-white px-3 py-1 text-xs text-stone-500">
          面向年轻人的事件影响解读
        </p>
        <h1 className="mx-auto max-w-2xl text-3xl font-bold leading-tight tracking-tight sm:text-5xl sm:leading-[1.15]">
          看懂最近大事，
          <br className="hidden sm:block" />
          推演它会怎样影响你的生活
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
        <h2 className="mb-3 text-center text-sm font-medium text-stone-500">
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
              最近一两个月值得关注的政治经济事件，点开看完整推演。
            </p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <EventCard key={event.slug} event={event} />
          ))}
        </div>
      </section>

      {/* 推演说明区 */}
      <section className="mt-20 grid gap-4 sm:grid-cols-3">
        {[
          {
            t: "用路径解释，不用结论压人",
            d: "不直接说「会导致失业」，而是讲清楚事件如何先影响成本、再影响行业、最后传导到你的生活。",
          },
          {
            t: "用「更可能」表达，不装预言",
            d: "避免「一定会、必然会、马上会」。我们说的是「更可能先出现」「短期未必，但中期可能」。",
          },
          {
            t: "用生活语言，不堆砌术语",
            d: "把「流动性收紧」翻译成「钱变贵了，借钱更难了」，让没有金融背景的人也能看懂。",
          },
        ].map((item) => (
          <div
            key={item.t}
            className="rounded-2xl border border-stone-200 bg-white p-5"
          >
            <h3 className="font-semibold tracking-tight">{item.t}</h3>
            <p className="mt-2 text-sm leading-relaxed text-stone-600">
              {item.d}
            </p>
          </div>
        ))}
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
      </section>
    </div>
  );
}
