"use client";

// 手绘风格的下划线 / 高亮笔触，用 rough.js 画，呼应全站演算纸推演风。
// 放在文字下方做强调，不抢正文。

import { useEffect, useRef } from "react";
import rough from "roughjs";

export function SketchUnderline({
  color = "#1c1917",
  strokeWidth = 3,
  seed = 11,
  className = "",
}: {
  color?: string;
  strokeWidth?: number;
  seed?: number;
  className?: string;
}) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    const rc = rough.svg(svg);
    // 一条略微起伏的手绘横线
    svg.appendChild(
      rc.line(4, 9, 196, 7, {
        roughness: 2,
        bowing: 2.5,
        stroke: color,
        strokeWidth,
        seed,
      }),
    );
  }, [color, strokeWidth, seed]);

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 200 16"
      preserveAspectRatio="none"
      aria-hidden
      className={`pointer-events-none block w-full ${className}`}
    />
  );
}
