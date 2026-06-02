export function PathFlow({ steps }: { steps: string[] }) {
  return (
    <ol className="space-y-0">
      {steps.map((step, i) => (
        <li key={i} className="relative flex gap-3 pb-4 last:pb-0">
          {/* 连接线 */}
          {i < steps.length - 1 && (
            <span className="absolute left-[11px] top-6 h-full w-px bg-stone-200" />
          )}
          <span className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-stone-900 text-xs font-medium text-stone-50">
            {i + 1}
          </span>
          <span className="pt-0.5 text-sm leading-relaxed text-stone-700">
            {step}
          </span>
        </li>
      ))}
    </ol>
  );
}
