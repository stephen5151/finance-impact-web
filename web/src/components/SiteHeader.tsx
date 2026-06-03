import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-stone-300/70 bg-[#f7f3e8]/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-5">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-stone-900 text-sm text-stone-50">
            事
          </span>
          <span className="tracking-tight">事件影响推演</span>
        </Link>
        <nav className="flex items-center gap-5 text-base text-stone-600">
          <Link href="/#events" className="hover:text-stone-900">
            最近事件
          </Link>
          <Link href="/ask" className="hover:text-stone-900">
            直接提问
          </Link>
        </nav>
      </div>
    </header>
  );
}
