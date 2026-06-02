import Link from "next/link";
import { AskAnswer } from "@/data/ask";
import { PathFlow } from "./PathFlow";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-stone-100 px-6 py-5 first:border-t-0">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-stone-400">
        {title}
      </h3>
      {children}
    </section>
  );
}

export function AnswerCard({ answer }: { answer: AskAnswer }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
      {/* 直接回答 */}
      <div className="bg-stone-900 px-6 py-6 text-stone-50">
        <p className="text-xs text-stone-400">关于「{answer.question}」</p>
        <p className="mt-2 text-lg font-medium leading-relaxed">
          {answer.directAnswer}
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {answer.dimensions.map((d) => (
            <span
              key={d}
              className="rounded-full bg-stone-700 px-2.5 py-1 text-xs"
            >
              {d}
            </span>
          ))}
        </div>
      </div>

      <Section title="影响路径">
        <PathFlow steps={answer.path} />
      </Section>

      {answer.byDimension.length > 0 && (
        <Section title="按生活维度展开">
          <ul className="space-y-3">
            {answer.byDimension.map((b) => (
              <li key={b.dimension} className="flex gap-3">
                <span className="mt-0.5 shrink-0 rounded-md bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-600">
                  {b.dimension}
                </span>
                <span className="text-sm leading-relaxed text-stone-700">
                  {b.text}
                </span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section title="哪类年轻人更受影响">
        <ul className="space-y-1.5">
          {answer.whoAffected.map((w) => (
            <li
              key={w}
              className="text-sm leading-relaxed text-stone-700 before:mr-2 before:text-stone-400 before:content-['·']"
            >
              {w}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="当前更值得关注的信号">
        <ul className="space-y-1.5">
          {answer.signals.map((s) => (
            <li
              key={s}
              className="text-sm leading-relaxed text-stone-700 before:mr-2 before:text-stone-400 before:content-['·']"
            >
              {s}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="风险提示">
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-800">
          {answer.riskNote}
        </p>
      </Section>

      {answer.matchedEvents.length > 0 && (
        <Section title="想看完整推演">
          <div className="flex flex-wrap gap-2">
            {answer.matchedEvents.map((e) => (
              <Link
                key={e.slug}
                href={`/events/${e.slug}`}
                className="rounded-full border border-stone-300 px-3 py-1.5 text-sm text-stone-700 transition-colors hover:border-stone-900 hover:text-stone-900"
              >
                {e.title} →
              </Link>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}
