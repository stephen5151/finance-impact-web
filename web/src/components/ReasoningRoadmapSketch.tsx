"use client";

// excalidraw 手绘风格的因果推理 roadmap：
// 手绘方框（SketchyBox）+ 手绘向下箭头 + 手写体字体，纸张质感背景。
// 与 ReasoningRoadmap（规整风格）数据一致，可在事件详情页二选一。

import { Fragment, useEffect, useRef } from "react";
import rough from "roughjs";
import { SketchyBox } from "./SketchyBox";

type NodeKind = "origin" | "step" | "dest";

interface FlowNode {
  kind: NodeKind;
  badge: string;
  text: string;
}

// 手绘向下箭头 + 「因此」标注
function SketchyArrow() {
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const svg = ref.current;
    if (!svg) return;
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    const rc = rough.svg(svg);
    const opts = {
      roughness: 1.8,
      stroke: "#57534e",
      strokeWidth: 1.8,
      seed: 7,
    };
    svg.appendChild(rc.line(20, 2, 20, 34, opts)); // 竖杆
    svg.appendChild(rc.line(20, 34, 12, 24, opts)); // 左箭羽
    svg.appendChild(rc.line(20, 34, 28, 24, opts)); // 右箭羽
  }, []);
  return (
    <div className="flex items-center justify-center gap-2 py-1.5">
      <svg ref={ref} width={40} height={38} viewBox="0 0 40 38" aria-hidden />
      <span className="font-sketch text-lg text-stone-500">因此……</span>
    </div>
  );
}

const STYLE: Record<
  NodeKind,
  { stroke: string; fill: string; fillStyle: "solid" | "hachure"; badge: string }
> = {
  origin: { stroke: "#1c1917", fill: "#ffec99", fillStyle: "solid", badge: "text-stone-700" },
  step: { stroke: "#1c1917", fill: "#ffffff", fillStyle: "solid", badge: "text-stone-500" },
  dest: { stroke: "#2b8a3e", fill: "#b2f2bb", fillStyle: "solid", badge: "text-emerald-700" },
};

export function ReasoningRoadmapSketch({
  title,
  steps,
}: {
  title: string;
  steps: string[];
}) {
  const nodes: FlowNode[] = [
    { kind: "origin", badge: "起点", text: title },
    ...steps.map((s, i) => ({
      kind: "step" as const,
      badge: `第 ${i + 1} 环`,
      text: s,
    })),
    {
      kind: "dest",
      badge: "落点",
      text: "最终传导到你的找工作、工资、租房、消费和存钱",
    },
  ];

  return (
    <div className="rounded-2xl border border-stone-200 bg-[#fffef9] p-4 sm:p-6">
      <p className="font-sketch mb-4 text-center text-xl text-stone-500">
        从事件出发，一环扣一环，看它如何一步步影响到你 ✎
      </p>
      <div className="mx-auto flex max-w-md flex-col">
        {nodes.map((node, i) => {
          const s = STYLE[node.kind];
          const isLast = i === nodes.length - 1;
          return (
            <Fragment key={i}>
              <SketchyBox
                stroke={s.stroke}
                fill={s.fill}
                fillStyle={s.fillStyle}
                seed={i * 13 + 3}
              >
                <div className="px-5 py-3.5">
                  <span className={`font-sketch text-base ${s.badge}`}>
                    {node.kind === "origin"
                      ? "★ 起点"
                      : node.kind === "dest"
                        ? "🙋 你（落点）"
                        : node.badge}
                  </span>
                  <p className="font-sketch mt-0.5 text-xl leading-snug text-stone-800">
                    {node.text}
                  </p>
                </div>
              </SketchyBox>
              {!isLast && <SketchyArrow />}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
