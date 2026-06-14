import type { Metadata } from "next";
import { Suspense } from "react";
import { AskBox } from "@/components/AskBox";
import { AnswerSection } from "@/components/AnswerSection";
import { AnswerSkeleton } from "@/components/AnswerSkeleton";
import { Disclaimer } from "@/components/Disclaimer";

export const metadata: Metadata = {
  title: "直接提问 | 事件影响推演",
  description: "输入你的问题，得到一份按生活维度展开的结构化影响解释。",
};

export default async function AskPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const question = (q ?? "").trim();

  return (
    <div className="mx-auto max-w-2xl px-5 py-10">
      <h1 className="text-2xl font-bold tracking-tight">直接提问</h1>
      <p className="mt-2 text-sm leading-relaxed text-stone-600">
        输入「这会对我有什么影响」，我们会把它映射到相关事件，
        按你的生活维度给一份清晰的回答卡片。
      </p>

      <div className="mt-6">
        <AskBox autoFocus={!question} />
      </div>

      <div className="mt-8">
        {question ? (
          // key={question}：换问题时强制重新 suspend，先显示骨架屏再流式切入结果
          <Suspense
            key={question}
            fallback={<AnswerSkeleton question={question} />}
          >
            <AnswerSection question={question} />
          </Suspense>
        ) : (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-white/50 px-6 py-10 text-center text-sm text-stone-500">
            在上面输入问题，或点一个示例问题试试。
          </div>
        )}
      </div>

      <div className="mt-8">
        <Disclaimer />
      </div>
    </div>
  );
}
