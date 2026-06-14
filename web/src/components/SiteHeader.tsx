import Link from "next/link";
import { NavLink } from "./NavLink";
import { HoverSketchUnderline } from "./HoverSketchUnderline";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { getLang } from "@/i18n/lang";
import { ui } from "@/i18n/dict";

export async function SiteHeader() {
  const lang = await getLang();
  const t = ui[lang].header;
  return (
    <header className="sticky top-0 z-30 border-b border-stone-300/70 bg-[#f7f3e8]/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-5">
        <Link
          href="/"
          className="group flex items-center gap-2 text-lg font-semibold"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-stone-900 text-sm text-stone-50">
            {t.brandBadge}
          </span>
          <span className="relative tracking-tight">
            {t.brand}
            <HoverSketchUnderline />
          </span>
        </Link>
        <div className="flex items-center gap-5">
          <nav className="flex items-center gap-5 text-base text-stone-600">
            <NavLink href="/#events">{t.navEvents}</NavLink>
            <NavLink href="/ask">{t.navAsk}</NavLink>
          </nav>
          <LanguageSwitcher lang={lang} />
        </div>
      </div>
    </header>
  );
}
