import Link from "next/link";
import { answerQuestion } from "@/data/ask";
import { answerQuestionSmart } from "@/data/ask-llm";
import { AnswerCard } from "@/components/AnswerCard";
import { RevealAnswer } from "@/components/RevealAnswer";
import { events } from "@/data/events";

/** 异步服务端组件：负责实际的事件匹配 / LLM 推演。
 * 单独抽出来是为了用 <Suspense> 包裹——提交新问题时先显示骨架屏，
 * 结果就绪后再流式切入，由 RevealAnswer 负责滚动到位 + 淡入。 */
export async function AnswerSection({ question }: { question: string }) {
  // 混合匹配：优先用模型做语义匹配。
  // - 模型匹配到事件 → 用该回答
  // - 模型可用但判定无相关事件（no-match）→ 不降级，直接显示「无法识别」
  // - 模型未配置 / 调用失败（unavailable）→ 降级到关键词匹配
  let answer = null;
  const smart = await answerQuestionSmart(question);
  if (smart.kind === "answer") answer = smart.answer;
  else if (smart.kind === "unavailable") answer = answerQuestion(question);

  if (answer) {
    return (
      <RevealAnswer>
        <AnswerCard answer={answer} />
      </RevealAnswer>
    );
  }

  // no-match：空状态
  return (
    <RevealAnswer>
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
    </RevealAnswer>
  );
}
