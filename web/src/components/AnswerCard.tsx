import Link from "next/link";
import { AskAnswer } from "@/data/ask";
import { PathFlow } from "./PathFlow";
import { ui, dimLabel, type Lang } from "@/i18n/dict";

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

export function AnswerCard({
  answer,
  lang = "zh",
}: {
  answer: AskAnswer;
  lang?: Lang;
}) {
  const t = ui[lang].answer;
  return (
    <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
      {/* 直接回答 */}
      <div className="bg-stone-900 px-6 py-6 text-stone-50">
        <p className="text-xs text-stone-400">
          {t.about}
          {answer.question}
          {t.aboutClose}
        </p>
        <p className="mt-2 text-lg font-medium leading-relaxed">
          {answer.directAnswer}
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {answer.dimensions.map((d) => (
            <span
              key={d}
              className="rounded-full bg-stone-700 px-2.5 py-1 text-xs"
            >
              {dimLabel(d, lang)}
            </span>
          ))}
        </div>
        {answer.grounded === false && (
          <p className="mt-3 rounded-lg bg-stone-800 px-3 py-2 text-xs leading-relaxed text-stone-300">
            {t.groundedWarn}
          </p>
        )}
      </div>

      <Section title={t.secPath}>
        <PathFlow steps={answer.path} />
      </Section>

      {answer.byDimension.length > 0 && (
        <Section title={t.secByDimension}>
          <div className="grid gap-2.5">
            {answer.byDimension.map((b) => (
              <div
                key={b.dimension}
                className="rounded-xl border border-stone-100 bg-stone-50/70 p-3.5"
              >
                <div className="flex items-center gap-2">
                  <span className="h-3.5 w-1 rounded-full bg-stone-900" />
                  <span className="text-sm font-semibold tracking-tight text-stone-900">
                    {dimLabel(b.dimension, lang)}
                  </span>
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-stone-600">
                  {b.text}
                </p>
              </div>
            ))}
          </div>
        </Section>
      )}

      <Section title={t.secWho}>
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

      <Section title={t.secSignals}>
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

      <Section title={t.secRisk}>
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-800">
          {answer.riskNote}
        </p>
      </Section>

      {answer.matchedEvents.length > 0 && (
        <Section title={t.secMore}>
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
