import { LatestNewsItem } from "@/data/news";

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

function NewsCard({ item }: { item: LatestNewsItem }) {
  return (
    <a
      href={item.sourceUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex h-full flex-col rounded-2xl border border-stone-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-md"
    >
      <div className="flex items-center justify-between text-xs text-stone-400">
        <span className="rounded-full bg-stone-100 px-2 py-0.5 font-medium text-stone-500">
          {item.source}
        </span>
        <span>{formatDate(item.publishedAt)}</span>
      </div>
      <h3 className="mt-2 text-base font-semibold leading-snug tracking-tight">
        {item.title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-stone-600">{item.summary}</p>
      {item.whyRelevant && (
        <p className="mt-2 rounded-lg bg-stone-50 px-3 py-2 text-xs leading-relaxed text-stone-500">
          和你的关系：{item.whyRelevant}
        </p>
      )}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {item.directions.map((d) => (
          <span
            key={d}
            className="rounded-full bg-stone-900 px-2.5 py-1 text-xs text-stone-50"
          >
            {d}
          </span>
        ))}
        {item.dimensions.map((d) => (
          <span
            key={d}
            className="rounded-full border border-stone-200 px-2.5 py-1 text-xs text-stone-500"
          >
            {d}
          </span>
        ))}
      </div>
    </a>
  );
}

export function LatestNews({
  items,
  updatedAt,
}: {
  items: LatestNewsItem[];
  updatedAt: string;
}) {
  // 没有动态数据时整块不渲染（未配置或还没首次抓取）
  if (items.length === 0) return null;

  return (
    <section id="latest" className="mt-20 scroll-mt-20">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">最新动态</h2>
          <p className="mt-1 text-sm text-stone-500">
            自动抓取可信来源的最新时政财经动态，并标注它和你生活的关系。
            {updatedAt && `更新于 ${formatDate(updatedAt)}`}
          </p>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <NewsCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
