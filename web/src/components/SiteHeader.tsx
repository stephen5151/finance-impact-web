import Link from "next/link";
import { NavLink } from "./NavLink";
import { HoverSketchUnderline } from "./HoverSketchUnderline";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-stone-300/70 bg-[#f7f3e8]/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-5">
        <Link
          href="/"
          className="group flex items-center gap-2 text-lg font-semibold"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-stone-900 text-sm text-stone-50">
            事
          </span>
          <span className="relative tracking-tight">
            事件影响推演
            <HoverSketchUnderline />
          </span>
        </Link>
        <nav className="flex items-center gap-5 text-base text-stone-600">
          <NavLink href="/#events">最近事件</NavLink>
          <NavLink href="/ask">直接提问</NavLink>
        </nav>
      </div>
    </header>
  );
}
