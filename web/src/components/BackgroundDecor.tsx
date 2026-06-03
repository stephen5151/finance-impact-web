// 全站背景装饰层：演算纸上几笔缓慢漂浮的手绘「分析涂鸦」
// （涨/跌箭头、趋势波浪线、传导路径、节点圆点）。
// 极低透明度、固定在内容背后、不可交互；动效遵守 prefers-reduced-motion。
// 纯 SVG + CSS，无 JS 运行时开销。

const stroke = "#1c1917";

// 一支手绘风格的笔触集合（viewBox 统一 0 0 100 100，便于缩放摆放）
function RisingArrow() {
  return (
    <svg viewBox="0 0 100 100" fill="none" width="100%" height="100%">
      <path
        d="M8 78 C30 70, 44 50, 62 30 M62 30 L44 34 M62 30 L60 50"
        stroke={stroke}
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
function FallingArrow() {
  return (
    <svg viewBox="0 0 100 100" fill="none" width="100%" height="100%">
      <path
        d="M10 26 C32 36, 48 56, 66 76 M66 76 L48 72 M66 76 L66 56"
        stroke={stroke}
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
function TrendLine() {
  return (
    <svg viewBox="0 0 120 60" fill="none" width="100%" height="100%">
      <path
        d="M4 40 C18 18, 30 50, 46 34 C60 20, 72 46, 88 26 C100 12, 110 30, 118 20"
        stroke={stroke}
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
function PathArrow() {
  return (
    <svg viewBox="0 0 100 100" fill="none" width="100%" height="100%">
      <path
        d="M14 20 C12 44, 40 50, 50 64 C58 76, 78 74, 84 84 M84 84 L70 82 M84 84 L82 70"
        stroke={stroke}
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="2 9"
      />
    </svg>
  );
}
function Nodes() {
  return (
    <svg viewBox="0 0 100 60" fill="none" width="100%" height="100%">
      <circle cx="16" cy="30" r="8" stroke={stroke} strokeWidth="3" />
      <circle cx="52" cy="18" r="6" stroke={stroke} strokeWidth="3" />
      <circle cx="84" cy="40" r="9" stroke={stroke} strokeWidth="3" />
      <path
        d="M24 30 C36 26, 42 22, 47 20 M58 20 C68 26, 74 32, 78 36"
        stroke={stroke}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="2 7"
      />
    </svg>
  );
}
function Percent() {
  return (
    <svg viewBox="0 0 100 100" fill="none" width="100%" height="100%">
      <circle cx="28" cy="30" r="11" stroke={stroke} strokeWidth="3" />
      <circle cx="72" cy="70" r="11" stroke={stroke} strokeWidth="3" />
      <path d="M74 22 L26 78" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

interface Doodle {
  el: React.ReactNode;
  /** 用 inset 定位，避免靠近正文中心 */
  style: React.CSSProperties;
  variant?: "a" | "b";
}

const DOODLES: Doodle[] = [
  {
    el: <RisingArrow />,
    style: { top: "11%", left: "6%", width: 88, height: 88, "--rot": "-6deg", "--dur": "27s" } as React.CSSProperties,
  },
  {
    el: <TrendLine />,
    style: { top: "20%", right: "5%", width: 130, height: 65, "--rot": "5deg", "--dur": "31s", "--o-max": "0.09" } as React.CSSProperties,
    variant: "b",
  },
  {
    el: <PathArrow />,
    style: { top: "48%", left: "3%", width: 92, height: 92, "--rot": "4deg", "--dur": "33s" } as React.CSSProperties,
    variant: "b",
  },
  {
    el: <Nodes />,
    style: { bottom: "16%", right: "7%", width: 120, height: 72, "--rot": "-4deg", "--dur": "29s" } as React.CSSProperties,
  },
  {
    el: <FallingArrow />,
    style: { bottom: "10%", left: "9%", width: 80, height: 80, "--rot": "7deg", "--dur": "25s" } as React.CSSProperties,
    variant: "b",
  },
  {
    el: <Percent />,
    style: { top: "70%", right: "16%", width: 70, height: 70, "--rot": "-8deg", "--dur": "34s", "--o-min": "0.04", "--o-max": "0.08" } as React.CSSProperties,
  },
];

export function BackgroundDecor() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {DOODLES.map((d, i) => (
        <span
          key={i}
          className={`doodle ${d.variant === "b" ? "doodle-b" : ""}`}
          style={{ opacity: 0.06, ...d.style }}
        >
          {d.el}
        </span>
      ))}
    </div>
  );
}
