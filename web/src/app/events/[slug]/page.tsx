import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { RISK_NOTE } from "@/data/events";
import { getDisplayEvent } from "@/data/events-live";
import { ReasoningRoadmapSketch } from "@/components/ReasoningRoadmapSketch";

// 从原文链接取出来源网站域名（去掉 www.），用于在页首标明信息来源的网站地址。
function sourceHost(url?: string): string {
  if (!url) return "";
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

// 事件详情按需动态渲染：数据来自 Blob 的 no-store 读取（始终取最新一版），
// 与 generateStaticParams 的静态预渲染不兼容（会触发 static-to-dynamic 报错），
// 故整页强制动态渲染。详情页流量低，动态渲染开销可接受。
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const event = await getDisplayEvent(slug);
  if (!event) return { title: "事件未找到" };
  return {
    title: `${event.title} | 事件影响推演`,
    description: event.summary,
  };
}

function Block({
  step,
  title,
  children,
}: {
  step: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-stone-100 py-7 first:border-t-0 first:pt-0">
      <h2 className="flex items-center gap-2.5 text-lg font-bold tracking-tight">
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-stone-100 text-xs font-semibold text-stone-500">
          {step}
        </span>
        {title}
      </h2>
      <div className="mt-3 pl-[34px]">{children}</div>
    </section>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((it) => (
        <li
          key={it}
          className="flex gap-2.5 text-[15px] leading-relaxed text-stone-700"
        >
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-stone-300" />
          <span>{it}</span>
        </li>
      ))}
    </ul>
  );
}

export default async function EventPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await getDisplayEvent(slug);
  if (!event) notFound();

  const d = event.detail;

  return (
    <article className="mx-auto max-w-3xl px-5 py-10">
      {/* 正文整体放在一张白色「纸」上，浮在演算纸背景之上 */}
      <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-9">
        <Link
          href="/#events"
          className="text-sm text-stone-500 transition-colors hover:text-stone-900"
        >
          ← 返回最近事件
        </Link>

        {/* 头部 + 一句话结论 */}
        <header className="mt-5">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-stone-400">{event.date}</span>
          {event.directions.map((dir) => (
            <span
              key={dir}
              className="rounded-full bg-stone-900 px-2.5 py-1 text-stone-50"
            >
              {dir}
            </span>
          ))}
        </div>
        <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight">
          {event.title}
        </h1>
        {event.sourceUrl && (
          <p className="mt-2 text-xs text-stone-400">
            信息来源：
            {event.sourceName && (
              <span className="text-stone-500">{event.sourceName} · </span>
            )}
            <a
              href={event.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-stone-700"
            >
              {sourceHost(event.sourceUrl) || "查看原文"}
            </a>
          </p>
        )}
        <div className="mt-5 rounded-2xl bg-stone-900 px-6 py-5 text-stone-50">
          <p className="text-xs text-stone-400">一句话结论</p>
          <p className="mt-1.5 text-base font-medium leading-relaxed">
            {event.conclusion}
          </p>
        </div>
      </header>

      <div className="mt-8">
        <Block step={1} title="这件事发生了什么">
          <p className="text-[15px] leading-relaxed text-stone-700">{d.what}</p>
        </Block>

        <Block step={2} title="为什么这件事重要">
          <p className="text-[15px] leading-relaxed text-stone-700">
            {d.whyImportant}
          </p>
        </Block>

        <Block step={3} title="它通常会先影响什么">
          <p className="text-[15px] leading-relaxed text-stone-700">
            {d.firstImpact}
          </p>
        </Block>

        <Block step={4} title="它会怎样一步步传导到普通人的生活">
          <ReasoningRoadmapSketch title={event.title} steps={d.transmissionPath} />
        </Block>

        <Block step={5} title="对年轻人的重点影响">
          <BulletList items={d.youngPeopleImpact} />
        </Block>

        <Block step={6} title="短期更可能发生什么">
          <BulletList items={d.shortTerm} />
        </Block>

        <Block step={7} title="中期需要留意什么">
          <BulletList items={d.midTerm} />
        </Block>

        <Block step={8} title="哪些人更容易感受到影响">
          <BulletList items={d.mostAffected} />
        </Block>

        <Block step={9} title="这不代表什么">
          <BulletList items={d.doesNotMean} />
        </Block>

        <Block step={10} title="风险提示">
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[15px] leading-relaxed text-amber-800">
            {RISK_NOTE}本网站仅用于信息理解与生活影响分析，不构成投资建议。投资需谨慎。
          </p>
        </Block>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-5 text-center">
        <p className="text-sm text-stone-600">想知道它具体会怎么影响你？</p>
        <Link
          href="/ask"
          className="mt-3 inline-block rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-medium text-stone-50 transition-colors hover:bg-stone-700"
        >
          直接提问 →
        </Link>
      </div>
    </article>
  );
}
