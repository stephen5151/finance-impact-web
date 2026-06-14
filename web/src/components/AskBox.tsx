"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ui, type Lang } from "@/i18n/dict";

export function AskBox({
  autoFocus = false,
  lang = "zh",
}: {
  autoFocus?: boolean;
  lang?: Lang;
}) {
  const router = useRouter();
  const t = ui[lang].ask;
  const [value, setValue] = useState("");
  // isPending：导航 + 服务端推演进行中。用它给按钮一个即时的「分析中」反馈，
  // 避免点完看似没反应（真正的结果占位由 /ask 页的骨架屏负责）。
  const [isPending, startTransition] = useTransition();

  function submit(q: string) {
    const question = q.trim();
    if (!question || isPending) return;
    startTransition(() => {
      router.push(`/ask?q=${encodeURIComponent(question)}`);
    });
  }

  return (
    <div className="w-full">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(value);
        }}
        className="flex flex-col gap-3 sm:flex-row"
      >
        <input
          autoFocus={autoFocus}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={isPending}
          placeholder={t.placeholder}
          className="flex-1 rounded-xl border border-stone-300 bg-white px-4 py-3 text-base outline-none transition-colors placeholder:text-stone-400 focus:border-stone-900 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={isPending}
          aria-busy={isPending}
          className="flex items-center justify-center gap-2 rounded-xl bg-stone-900 px-6 py-3 text-base font-medium text-stone-50 transition-colors hover:bg-stone-700 disabled:cursor-not-allowed disabled:bg-stone-700"
        >
          {isPending && (
            <span
              className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-stone-400 border-t-stone-50"
              aria-hidden="true"
            />
          )}
          {isPending ? t.analyzing : t.submit}
        </button>
      </form>
      <div className="mt-3 flex flex-wrap gap-2">
        {t.samples.map((q) => (
          <button
            key={q}
            onClick={() => submit(q)}
            className="rounded-full border border-stone-200 bg-white px-3 py-1.5 text-sm text-stone-600 transition-colors hover:border-stone-400 hover:text-stone-900"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}
