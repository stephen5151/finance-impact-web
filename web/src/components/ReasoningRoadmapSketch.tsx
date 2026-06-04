"use client";

// excalidraw 手绘风格的因果推理 roadmap：
// 手绘方框（SketchyBox）+ 手绘向下箭头 + 手写体字体，纸张质感背景。
// 与 ReasoningRoadmap（规整风格）数据一致，可在事件详情页二选一。

import { Fragment, useEffect, useRef, useState } from "react";
import rough from "roughjs";
import { SketchyBox } from "./SketchyBox";
import type { LifeDimension } from "@/data/events";

// 各生活维度在「最终落点」里的措辞
const LANDING_LABEL: Record<LifeDimension, string> = {
  找工作: "找工作",
  工资收入: "工资收入",
  租房成本: "租房成本",
  日常消费: "日常消费",
  存钱现金流: "存钱和现金流",
  理财认知: "理财选择",
};

// 根据事件实际涉及的生活维度，生成「最终落点」文案；不同事件不再千篇一律。
function buildDestText(dimensions?: LifeDimension[]): string {
  const dims = (dimensions ?? []).filter((d) => LANDING_LABEL[d]);
  if (dims.length === 0) {
    return "最终一步步传导到你的日常生活";
  }
  const labels = dims.map((d) => LANDING_LABEL[d]);
  return `最终更可能影响到你的${labels.join("、")}`;
}

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
  dimensions,
}: {
  title: string;
  steps: string[];
  /** 事件实际涉及的生活维度，用于生成「最终落点」文案 */
  dimensions?: LifeDimension[];
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
      badge: "最终落点",
      text: buildDestText(dimensions),
    },
  ];

  const { ref, shown } = useRevealOnce<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={`rounded-2xl border border-stone-200 bg-[#fdfaf2] p-4 sm:p-6 ${
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
                          ? "★ 最终落点"
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
