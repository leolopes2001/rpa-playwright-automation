import { formatDate } from "@/lib/formatters";
import type { ExecutionEvent } from "../types";

export function ExecutionTimeline({ events = [] }: { events?: ExecutionEvent[] }) {
  return (
    <section>
      <div className="section-heading"><h2>Timeline</h2><span>{events.length} eventos</span></div>
      <ol className="timeline">
        {events.map((event) => (
          <li key={event.id}>
            <span className="timeline-dot" />
            <div><strong>{event.message}</strong><p>{event.type.replaceAll("_", " ")} · {formatDate(event.createdAt)}</p></div>
            <b>{event.progress ?? ""}{event.progress != null ? "%" : ""}</b>
          </li>
        ))}
      </ol>
    </section>
  );
}
