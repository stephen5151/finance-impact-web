// 悬停时淡入的手绘波浪下划线。需放在带 `group relative` 的父元素内。
export function HoverSketchUnderline() {
  return (
    <span className="pointer-events-none absolute -bottom-0.5 left-0 right-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
      <svg
        viewBox="0 0 100 8"
        preserveAspectRatio="none"
        aria-hidden
        className="block h-[7px] w-full"
      >
        <path
          d="M1 4.5 C15 1.8, 31 6.8, 49 4 C65 1.6, 83 6.8, 99 3.6"
          fill="none"
          stroke="#1c1917"
          strokeWidth="2"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </span>
  );
}
