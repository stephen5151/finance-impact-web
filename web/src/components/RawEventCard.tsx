import type { RawNewsItem } from "@/lib/news-sources";
import { SketchyBox } from "./SketchyBox";
import { ui, type Lang } from "@/i18n/dict";

// 由链接生成稳定随机种子，让每张卡片的手绘描边各有差异但刷新不抖动。
function seedFromLink(link: string): number {
  let s = 0;
  for (let i = 0; i < link.length; i++) s = (s * 31 + link.charCodeAt(i)) % 9973;
  return s;
}

// 从原文链接取出来源网站域名（去掉 www.），用于在卡片上标明信息来源的网站。
function sourceHost(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function formatDate(raw: string): string {
  const d = new Date(raw);
  if (isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

// 直接来自 RSS 的真实新闻卡片：没有 LLM 推演分析，但带真实来源网站，
// 整卡片点开即跳转原文，让用户能核对事件真伪。
export function RawEventCard({
  item,
  lang = "zh",
}: {
  item: RawNewsItem;
  lang?: Lang;
}) {
  const host = sourceHost(item.link);
  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      className="group block h-full transition-transform duration-200 hover:-translate-y-1"
    >
      <SketchyBox
        stroke="#1c1917"
        fill="#ffffff"
        seed={seedFromLink(item.link)}
        className="h-full"
      >
        <div className="flex h-full flex-col p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-stone-400">
              {formatDate(item.publishedAt)}
            </span>
            <span className="text-xl text-stone-300 transition-colors group-hover:text-stone-700">
              ↗
            </span>
          </div>
          <h3 className="mt-2 text-xl font-semibold leading-snug">
            {item.title}
          </h3>
          {item.description && (
            <p className="mt-2 flex-1 text-base leading-relaxed text-stone-600">
              {item.description.slice(0, 120)}
              {item.description.length > 120 ? "…" : ""}
            </p>
          )}
          <p className="mt-4 border-t border-stone-100 pt-2.5 text-xs text-stone-400">
            {ui[lang].card.source}
            {item.source}
            {host && <span className="text-stone-300"> · {host}</span>}
          </p>
        </div>
      </SketchyBox>
    </a>
  );
}
