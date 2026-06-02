// 因果推理 roadmap：把「事件如何一步步传导到你的生活」画成一条可视化推理链。
// 起点是事件本身，中间每一环用「因此」连接，终点落到普通人的生活。
// 纯展示组件，无交互，可在服务端渲染。

type NodeKind = "origin" | "step" | "dest";

interface FlowNode {
  kind: NodeKind;
  badge: string;
  text: string;
}

export function ReasoningRoadmap({
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
    <div className="rounded-2xl border border-stone-200 bg-stone-50/60 p-4 sm:p-5">
      <p className="mb-4 text-xs text-stone-500">
        从事件出发，一环扣一环，看它如何一步步影响到你 👇
      </p>
      <ol className="space-y-0">
        {nodes.map((node, i) => {
          const isLast = i === nodes.length - 1;
          return (
            <li key={i} className="relative flex gap-3 pb-6 last:pb-0">
              {/* 左侧轨道：节点圆点 + 连接竖线 */}
              <div className="relative flex w-7 shrink-0 justify-center">
                <span
                  className={[
                    "z-10 flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ring-4 ring-stone-50",
                    node.kind === "origin"
                      ? "bg-stone-900 text-stone-50"
                      : node.kind === "dest"
                        ? "bg-emerald-600 text-white"
                        : "border border-stone-300 bg-white text-stone-700",
                  ].join(" ")}
                >
                  {node.kind === "origin"
                    ? "★"
                    : node.kind === "dest"
                      ? "你"
                      : i}
                </span>
                {!isLast && (
                  <span className="absolute top-7 bottom-0 left-1/2 w-0.5 -translate-x-1/2 bg-gradient-to-b from-stone-300 to-stone-200" />
                )}
              </div>

              {/* 连接处的「因此」标记：覆盖在竖线上 */}
              {!isLast && (
                <span className="absolute bottom-1 left-[14px] z-10 -translate-x-1/2 rounded-full border border-stone-200 bg-white px-1.5 py-0.5 text-[10px] leading-none text-stone-400">
                  因此 ↓
                </span>
              )}

              {/* 右侧卡片 */}
              <div className="min-w-0 flex-1">
                <span
                  className={[
                    "inline-block rounded-full px-2 py-0.5 text-[11px] font-medium",
                    node.kind === "origin"
                      ? "bg-stone-900 text-stone-50"
                      : node.kind === "dest"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-stone-200 text-stone-600",
                  ].join(" ")}
                >
                  {node.badge}
                </span>
                <div
                  className={[
                    "mt-1.5 rounded-xl border px-3.5 py-2.5 text-sm leading-relaxed",
                    node.kind === "dest"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                      : "border-stone-200 bg-white text-stone-700",
                  ].join(" ")}
                >
                  {node.text}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
