"use client";

// 语言切换：写 lang cookie 后 router.refresh()，让服务端按所选语言重渲染当前页。
// 放在顶栏右上角，中 / EN 两段可点。

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { LANG_COOKIE, type Lang } from "@/i18n/dict";

const OPTIONS: { value: Lang; label: string }[] = [
  { value: "zh", label: "中" },
  { value: "en", label: "EN" },
];

export function LanguageSwitcher({ lang }: { lang: Lang }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function setLang(next: Lang) {
    if (next === lang) return;
    // 一年有效期，根路径全站生效
    document.cookie = `${LANG_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    startTransition(() => router.refresh());
  }

  return (
    <div
      className="flex items-center rounded-full border border-stone-300 bg-white/70 p-0.5 text-xs"
      role="group"
      aria-label="Language"
    >
      {OPTIONS.map((opt) => {
        const active = opt.value === lang;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => setLang(opt.value)}
            disabled={pending}
            aria-pressed={active}
            className={`rounded-full px-2 py-0.5 font-medium transition-colors ${
              active
                ? "bg-stone-900 text-stone-50"
                : "text-stone-500 hover:text-stone-900"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
