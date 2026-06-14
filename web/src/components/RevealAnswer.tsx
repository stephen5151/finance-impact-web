"use client";

import { useEffect, useRef } from "react";

/** 结果就绪后的「被看到」处理：
 * 1. 挂载后平滑滚动到结果区，解决「结果出来了也不知道」；
 * 2. 轻微淡入上浮，把视线引过来。
 * 尊重 prefers-reduced-motion：该系统设置开启时不滚动、不做动画。 */
export function RevealAnswer({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    // 触发淡入（下一帧加上 reveal-on，让 CSS transition 生效）
    const raf = requestAnimationFrame(() => el.classList.add("reveal-on"));

    if (!reduceMotion) {
      // 留一点时间让骨架→结果的切换稳定，再滚动到结果顶部
      const t = setTimeout(() => {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);
      return () => {
        cancelAnimationFrame(raf);
        clearTimeout(t);
      };
    }

    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div ref={ref} className="scroll-mt-6">
      <div className="reveal-step">{children}</div>
    </div>
  );
}
