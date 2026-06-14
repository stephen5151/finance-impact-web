import { ui, type Lang } from "@/i18n/dict";

export function Disclaimer({
  compact = false,
  lang = "zh",
}: {
  compact?: boolean;
  lang?: Lang;
}) {
  const t = ui[lang].disclaimer;
  if (compact) {
    return <p className="text-xs text-amber-700">{t.compact}</p>;
  }
  return (
    <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
      <span className="mt-0.5 text-amber-500">⚠️</span>
      <p className="text-sm leading-relaxed text-amber-800">
        {t.fullPre}
        <strong className="font-semibold">{t.fullStrong}</strong>
        {t.fullPost}
      </p>
    </div>
  );
}
