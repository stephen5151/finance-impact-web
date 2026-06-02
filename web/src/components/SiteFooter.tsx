import { Disclaimer } from "./Disclaimer";

export function SiteFooter() {
  return (
    <footer className="border-t border-stone-200 bg-white">
      <div className="mx-auto max-w-5xl px-5 py-8">
        <Disclaimer />
        <div className="mt-6 space-y-1 text-xs leading-relaxed text-stone-500">
          <p>· 这是基于公开事件的生活影响解释，不是对未来的保证。</p>
          <p>· 不同行业、地区、收入状态，感受到的影响会不同。</p>
          <p>· 短期市场波动不等于生活层面的立即变化。</p>
          <p>· 内容只能帮助理解趋势，不能替代个人投资或重大财务决策。</p>
        </div>
        <p className="mt-6 text-xs text-stone-400">
          © {new Date().getFullYear()} 事件影响推演 · 仅供信息理解与学习
        </p>
      </div>
    </footer>
  );
}
