"use client";

// excalidraw 手绘风格的因果推理 roadmap：
// 手绘方框（SketchyBox）+ 手绘向下箭头 + 手写体字体，纸张质感背景。
// 与 ReasoningRoadmap（规整风格）数据一致，可在事件详情页二选一。

import { Fragment, useEffect, useRef, useState } from "react";
import rough from "roughjs";
import { SketchyBox } from "./SketchyBox";

// 当元素滚动进入视口时返回 true（只触发一次），用于驱动「逐环画出来」的入场动效。
function useRevealOnce<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || shown) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [shown]);
  return { ref, shown };
}

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

  const { ref, shown } = useRevealOnce<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={`rounded-2xl border border-stone-200 bg-[#fffef9] p-4 sm:p-6 ${
        shown ? "reveal-on" : ""
      }`}
    >
      <p className="font-sketch mb-4 text-center text-xl text-stone-500">
        从事件出发，一环扣一环，看它如何一步步影响到你 ✎
      </p>
      <div className="mx-auto flex max-w-md flex-col">
        {nodes.map((node, i) => {
          const s = STYLE[node.kind];
          const isLast = i === nodes.length - 1;
          // 逐环错峰入场：每个节点 + 其后的箭头共用一个序号的 delay。
          const delay = `${i * 140}ms`;
          return (
            <Fragment key={i}>
              <div className="reveal-step" style={{ transitionDelay: delay }}>
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
              </div>
              {!isLast && (
                <div
                  className="reveal-step"
                  style={{ transitionDelay: `calc(${delay} + 70ms)` }}
                >
                  <SketchyArrow />
                </div>
              )}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
