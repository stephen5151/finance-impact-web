import Link from "next/link";
import { FinanceEvent } from "@/data/events";

export function EventCard({ event }: { event: FinanceEvent }) {
  return (
    <Link
      href={`/events/${event.slug}`}
      className="group flex h-full flex-col rounded-2xl border border-stone-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-md"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-stone-400">{event.date}</span>
        <span className="text-stone-300 transition-colors group-hover:text-stone-600">
          →
        </span>
      </div>
      <h3 className="mt-2 text-lg font-semibold leading-snug tracking-tight">
        {event.title}
      </h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-stone-600">
        {event.summary}
      </p>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {event.directions.map((d) => (
          <span
            key={d}
            className="rounded-full bg-stone-900 px-2.5 py-1 text-xs text-stone-50"
          >
            {d}
          </span>
        ))}
        {event.audiences.slice(0, 2).map((a) => (
          <span
            key={a}
            className="rounded-full border border-stone-200 px-2.5 py-1 text-xs text-stone-500"
          >
            {a}
          </span>
        ))}
      </div>
    </Link>
  );
}
