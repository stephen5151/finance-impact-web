import Link from "next/link";
import { FinanceEvent } from "@/data/events";
import { SketchyBox } from "./SketchyBox";
import { ui, dirLabel, type Lang } from "@/i18n/dict";

// 从原文链接取出来源网站域名（去掉 www.），用于在卡片上标明信息来源的网站。
function sourceHost(url?: string): string {
  if (!url) return "";
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

// 由 slug 生成稳定随机种子，让每张卡片的手绘描边各有差异但刷新不抖动。
function seedFromSlug(slug: string): number {
  let s = 0;
  for (let i = 0; i < slug.length; i++) s = (s * 31 + slug.charCodeAt(i)) % 9973;
  return s;
}

export function EventCard({
  event,
  lang = "zh",
}: {
  event: FinanceEvent;
  lang?: Lang;
}) {
  return (
    <Link
      href={`/events/${event.slug}`}
      className="group block h-full transition-transform duration-200 hover:-translate-y-1"
    >
      <SketchyBox
        stroke="#1c1917"
        fill="#ffffff"
        seed={seedFromSlug(event.slug)}
        className="h-full"
      >
        <div className="flex h-full flex-col p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-stone-400">{event.date}</span>
            <span className="text-xl text-stone-300 transition-colors group-hover:text-stone-700">
              →
            </span>
          </div>
          <h3 className="mt-2 text-xl font-semibold leading-snug">
            {event.title}
          </h3>
          <p className="mt-2 flex-1 text-base leading-relaxed text-stone-600">
            {event.summary}
          </p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {event.directions.map((d) => (
              <span
                key={d}
                className="rounded-full bg-stone-900 px-2.5 py-1 text-sm text-stone-50"
              >
                {dirLabel(d, lang)}
              </span>
            ))}
            {event.audiences.slice(0, 2).map((a) => (
              <span
                key={a}
                className="rounded-full border border-stone-300 px-2.5 py-1 text-sm text-stone-500"
              >
                {a}
              </span>
            ))}
          </div>
          {event.sourceName && (
            <p className="mt-3 border-t border-stone-100 pt-2.5 text-xs text-stone-400">
              {ui[lang].card.source}
              {event.sourceName}
              {sourceHost(event.sourceUrl) && (
                <span className="text-stone-300"> · {sourceHost(event.sourceUrl)}</span>
              )}
            </p>
          )}
        </div>
      </SketchyBox>
    </Link>
  );
}
