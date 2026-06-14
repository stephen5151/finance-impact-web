import { Disclaimer } from "./Disclaimer";
import { getLang } from "@/i18n/lang";
import { ui } from "@/i18n/dict";

export async function SiteFooter() {
  const lang = await getLang();
  const t = ui[lang].footer;
  return (
    <footer className="border-t border-stone-200 bg-white">
      <div className="mx-auto max-w-5xl px-5 py-8">
        <Disclaimer lang={lang} />
        <div className="mt-6 space-y-1 text-xs leading-relaxed text-stone-500">
          {t.lines.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
        <p className="mt-6 text-xs text-stone-400">
          © {new Date().getFullYear()} {t.copyright}
        </p>
      </div>
    </footer>
  );
}
