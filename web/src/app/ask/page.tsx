import type { Metadata } from "next";
import { Suspense } from "react";
import { AskBox } from "@/components/AskBox";
import { AnswerSection } from "@/components/AnswerSection";
import { AnswerSkeleton } from "@/components/AnswerSkeleton";
import { Disclaimer } from "@/components/Disclaimer";
import { getLang } from "@/i18n/lang";
import { ui } from "@/i18n/dict";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  return {
    title: ui[lang].ask.metaTitle,
    description: ui[lang].ask.metaDesc,
  };
}

export default async function AskPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const lang = await getLang();
  const t = ui[lang].ask;
  const { q } = await searchParams;
  const question = (q ?? "").trim();

  return (
    <div className="mx-auto max-w-2xl px-5 py-10">
      <h1 className="text-2xl font-bold tracking-tight">{t.title}</h1>
      <p className="mt-2 text-sm leading-relaxed text-stone-600">{t.intro}</p>

      <div className="mt-6">
        <AskBox autoFocus={!question} lang={lang} />
      </div>

      <div className="mt-8">
        {question ? (
          // key={question}：换问题时强制重新 suspend，先显示骨架屏再流式切入结果
          <Suspense
            key={question}
            fallback={<AnswerSkeleton question={question} lang={lang} />}
          >
            <AnswerSection question={question} lang={lang} />
          </Suspense>
        ) : (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-white/50 px-6 py-10 text-center text-sm text-stone-500">
            {t.emptyPrompt}
          </div>
        )}
      </div>

      <div className="mt-8">
        <Disclaimer lang={lang} />
      </div>
    </div>
  );
}
