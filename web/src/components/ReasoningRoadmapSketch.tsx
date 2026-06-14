"use client";

// excalidraw 手绘风格的因果推理 roadmap：
// 手绘方框（SketchyBox）+ 手绘向下箭头 + 手写体字体，纸张质感背景。
// 与 ReasoningRoadmap（规整风格）数据一致，可在事件详情页二选一。

import { Fragment, useEffect, useRef, useState } from "react";
import rough from "roughjs";
import { SketchyBox } from "./SketchyBox";
import type { LifeDimension } from "@/data/events";
import { ui, LANDING_LABEL, type Lang } from "@/i18n/dict";

// 根据事件实际涉及的生活维度，生成「最终落点」文案；不同事件不再千篇一律。
function buildDestText(lang: Lang, dimensions?: LifeDimension[]): string {
  const t = ui[lang].roadmap;
  const dims = (dimensions ?? []).filter((d) => LANDING_LABEL[d]);
  if (dims.length === 0) return t.destFallback;
  const sep = lang === "en" ? ", " : "、";
  const labels = dims.map((d) => LANDING_LABEL[d][lang]).join(sep);
  return t.destTemplate(labels);
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
function SketchyArrow({ label }: { label: string }) {
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
      <span className="font-sketch text-lg text-stone-500">{label}</span>
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
  lang = "zh",
}: {
  title: string;
  steps: string[];
  /** 事件实际涉及的生活维度，用于生成「最终落点」文案 */
  dimensions?: LifeDimension[];
  lang?: Lang;
}) {
  const t = ui[lang].roadmap;
  const nodes: FlowNode[] = [
    { kind: "origin", badge: t.origin, text: title },
    ...steps.map((s, i) => ({
      kind: "step" as const,
      badge: `${t.ringPrefix}${i + 1}${t.ringSuffix}`,
      text: s,
    })),
    {
      kind: "dest",
      badge: t.destination,
      text: buildDestText(lang, dimensions),
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
        {t.caption}
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
                        ? t.origin
                        : node.kind === "dest"
                          ? t.destination
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
                  <SketchyArrow label={t.therefore} />
                </div>
              )}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
