import Link from "next/link";
import { answerQuestion } from "@/data/ask";
import { answerQuestionSmart } from "@/data/ask-llm";
import { AnswerCard } from "@/components/AnswerCard";
import { RevealAnswer } from "@/components/RevealAnswer";
import { events } from "@/data/events";
import { ui, type Lang } from "@/i18n/dict";
import { localizeAnswer, localizeEventTitles } from "@/i18n/translate";

/** 异步服务端组件：负责实际的事件匹配 / LLM 推演。
 * 单独抽出来是为了用 <Suspense> 包裹——提交新问题时先显示骨架屏，
 * 结果就绪后再流式切入，由 RevealAnswer 负责滚动到位 + 淡入。 */
export async function AnswerSection({
  question,
  lang = "zh",
}: {
  question: string;
  lang?: Lang;
}) {
  const t = ui[lang].ask;
  // 混合匹配：优先用模型做语义匹配。
  // - 模型匹配到事件 → 用该回答（已按所选语言生成，只翻译命中事件标题）
  // - 模型可用但判定无相关事件（no-match）→ 不降级，直接显示「无法识别」
  // - 模型未配置 / 调用失败（unavailable）→ 降级到关键词匹配（再整卡翻译）
  let answer = null;
  const smart = await answerQuestionSmart(question, lang);
  if (smart.kind === "answer") {
    answer = {
      ...smart.answer,
      matchedEvents: await localizeEventTitles(smart.answer.matchedEvents, lang),
    };
  } else if (smart.kind === "unavailable") {
    const fallback = answerQuestion(question);
    answer = fallback ? await localizeAnswer(fallback, lang) : null;
  }

  if (answer) {
    return (
      <RevealAnswer>
        <AnswerCard answer={answer} lang={lang} />
      </RevealAnswer>
    );
  }

  // no-match：空状态
  const sampleEvents = await localizeEventTitles(events.slice(0, 4), lang);
  return (
    <RevealAnswer>
      <div className="rounded-2xl border border-stone-200 bg-white px-6 py-10 text-center">
        <p className="text-3xl">🤔</p>
        <p className="mt-3 font-medium">
          {t.noMatchTitlePre}
          {question}
          {t.noMatchTitlePost}
        </p>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-stone-500">
          {t.noMatchBody}
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {sampleEvents.map((e) => (
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
