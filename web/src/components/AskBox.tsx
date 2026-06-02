"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { SAMPLE_QUESTIONS } from "@/data/ask";

export function AskBox({ autoFocus = false }: { autoFocus?: boolean }) {
  const router = useRouter();
  const [value, setValue] = useState("");

  function submit(q: string) {
    const question = q.trim();
    if (!question) return;
    router.push(`/ask?q=${encodeURIComponent(question)}`);
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
          placeholder="例如：美联储加息会影响我找工作吗"
          className="flex-1 rounded-xl border border-stone-300 bg-white px-4 py-3 text-base outline-none transition-colors placeholder:text-stone-400 focus:border-stone-900"
        />
        <button
          type="submit"
          className="rounded-xl bg-stone-900 px-6 py-3 text-base font-medium text-stone-50 transition-colors hover:bg-stone-700"
        >
          看影响
        </button>
      </form>
      <div className="mt-3 flex flex-wrap gap-2">
        {SAMPLE_QUESTIONS.map((q) => (
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
