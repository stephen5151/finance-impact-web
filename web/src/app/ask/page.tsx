import type { Metadata } from "next";
import Link from "next/link";
import { answerQuestion } from "@/data/ask";
import { answerQuestionSmart } from "@/data/ask-llm";
import { AskBox } from "@/components/AskBox";
import { AnswerCard } from "@/components/AnswerCard";
import { Disclaimer } from "@/components/Disclaimer";
import { events } from "@/data/events";

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
  // 混合：优先用模型做语义匹配（配置了 API key 时），失败/未配置则降级到关键词匹配。
  const answer = question
    ? (await answerQuestionSmart(question)) ?? answerQuestion(question)
    : null;

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
        {question && answer && <AnswerCard answer={answer} />}

        {question && !answer && (
          <div className="rounded-2xl border border-stone-200 bg-white px-6 py-10 text-center">
            <p className="text-3xl">🤔</p>
            <p className="mt-3 font-medium">
              暂时没识别出和「{question}」相关的事件
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-stone-500">
              第一版基于一批结构化事件来回答。可以换个说法，
              或者直接从下面这些最近事件里挑一个看完整推演。
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {events.slice(0, 4).map((e) => (
                <Link
                  key={e.slug}
                  href={`/events/${e.slug}`}
                  className="rounded-full border border-stone-300 px-3 py-1.5 text-sm text-stone-700 transition-colors hover:border-stone-900"
                >
                  {e.title}
                </Link>
              ))}
            </div>
          </div>
        )}

        {!question && (
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
