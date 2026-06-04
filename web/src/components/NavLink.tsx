import Link from "next/link";
import { HoverSketchUnderline } from "./HoverSketchUnderline";

// 顶栏导航项：悬停时浮现一条手绘风格的波浪下划线（手绘白板风）。
export function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group relative inline-flex items-center px-1 py-1 hover:text-stone-900"
    >
      <span className="relative z-10">{children}</span>
      <HoverSketchUnderline />
    </Link>
  );
}
