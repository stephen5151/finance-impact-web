"use client";

// 用 rough.js 在内容背后画一个手绘风格（excalidraw 风）的方框。
// 通过 ResizeObserver 跟随内容尺寸自适应，文字换行不会破坏边框。

import { useEffect, useRef } from "react";
import rough from "roughjs";

export function SketchyBox({
  children,
  stroke = "#1c1917",
  fill,
  fillStyle = "solid",
  seed = 42,
  className = "",
}: {
  children: React.ReactNode;
  stroke?: string;
  fill?: string;
  fillStyle?: "solid" | "hachure";
  /** 固定随机种子，避免每次重绘时手绘抖动变化 */
  seed?: number;
  className?: string;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const box = boxRef.current;
    const svg = svgRef.current;
    if (!box || !svg) return;

    const draw = () => {
      const w = box.offsetWidth;
      const h = box.offsetHeight;
      if (w === 0 || h === 0) return;
      svg.setAttribute("width", String(w));
      svg.setAttribute("height", String(h));
      svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      const rc = rough.svg(svg);
      const rect = rc.rectangle(4, 4, w - 8, h - 8, {
        roughness: 1.5,
        bowing: 1.8,
        stroke,
        strokeWidth: 1.8,
        seed,
        ...(fill
          ? { fill, fillStyle, fillWeight: 2, hachureGap: 6 }
          : {}),
      });
      svg.appendChild(rect);
    };

    draw();
    const ro = new ResizeObserver(draw);
    ro.observe(box);
    return () => ro.disconnect();
  }, [stroke, fill, fillStyle, seed]);

  return (
    <div ref={boxRef} className={`relative ${className}`}>
      <svg ref={svgRef} className="pointer-events-none absolute inset-0" aria-hidden />
      <div className="relative">{children}</div>
    </div>
  );
}
