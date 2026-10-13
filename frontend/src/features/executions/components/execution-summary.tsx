import { ExternalLink } from "lucide-react";
import { formatDate, formatDuration } from "@/lib/formatters";
import type { Execution } from "../types";

export function ExecutionSummary({ execution }: { execution: Execution }) {
  return (
    <>
      <section className="summary-band">
        <div><span>Execução</span><strong className="mono">{execution.id}</strong></div>
        <div><span>Criada</span><strong>{formatDate(execution.createdAt)}</strong></div>
        <div><span>Duração</span><strong>{formatDuration(execution.durationMs)}</strong></div>
        <div><span>Tentativas</span><strong>{execution.attemptCount || 1}</strong></div>
      </section>
      <section className="url-row">
        <div><span>URL processada</span><a href={execution.url} target="_blank" rel="noreferrer">{execution.url}<ExternalLink size={14} /></a></div>
        <div className="progress"><span style={{ width: `${execution.progress}%` }} /></div>
      </section>
    </>
  );
}
