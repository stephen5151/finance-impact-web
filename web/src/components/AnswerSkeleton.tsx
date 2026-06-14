import { ui, type Lang } from "@/i18n/dict";

/** 「看影响」提交后立刻显示的占位骨架卡。
 * 作用是给用户即时反馈——结果正在这个位置生成，避免「点完没反应」。
 * 结构上刻意呼应 AnswerCard：深色顶部 + 若干分区，让真结果切入时不跳动。 */
export function AnswerSkeleton({
  question,
  lang = "zh",
}: {
  question?: string;
  lang?: Lang;
}) {
  const t = ui[lang];
  return (
    <div
      className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm"
      aria-busy="true"
      aria-live="polite"
    >
      {/* 顶部深色区：回声标题 + 正在分析的状态行 */}
      <div className="bg-stone-900 px-6 py-6 text-stone-50">
        {question && (
          <p className="text-xs text-stone-400">
            {t.answer.about}
            {question}
            {t.answer.aboutClose}
          </p>
        )}
        <div className="mt-3 flex items-center gap-2 text-sm text-stone-300">
          <Spinner />
          <span>{t.ask.thinking}</span>
        </div>
        <div className="mt-4 space-y-2">
          <Bar className="w-11/12 bg-stone-700" />
          <Bar className="w-4/5 bg-stone-700" />
        </div>
        <div className="mt-4 flex gap-1.5">
          <Pill className="w-16 bg-stone-700" />
          <Pill className="w-20 bg-stone-700" />
          <Pill className="w-14 bg-stone-700" />
        </div>
      </div>

      {/* 下方几个内容分区的灰条占位 */}
      {[0, 1, 2].map((i) => (
        <div key={i} className="border-t border-stone-100 px-6 py-5 first:border-t-0">
          <Bar className="mb-3 h-2.5 w-24 bg-stone-200" />
          <div className="space-y-2">
            <Bar className="w-full bg-stone-100" />
            <Bar className="w-10/12 bg-stone-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

function Bar({ className = "" }: { className?: string }) {
  return <div className={`h-3 animate-pulse rounded ${className}`} />;
}

function Pill({ className = "" }: { className?: string }) {
  return <div className={`h-6 animate-pulse rounded-full ${className}`} />;
}

function Spinner() {
  return (
    <span
      className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-stone-500 border-t-stone-50"
      aria-hidden="true"
    />
  );
}
