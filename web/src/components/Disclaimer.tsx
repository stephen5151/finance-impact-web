export function Disclaimer({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <p className="text-xs text-amber-700">
        ⚠️ 本网站仅用于信息理解与生活影响分析，不构成投资建议。投资需谨慎。
      </p>
    );
  }
  return (
    <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
      <span className="mt-0.5 text-amber-500">⚠️</span>
      <p className="text-sm leading-relaxed text-amber-800">
        本网站仅用于信息理解与生活影响分析，
        <strong className="font-semibold">不构成投资建议</strong>。投资需谨慎。
      </p>
    </div>
  );
}
