"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useExecution } from "../use-execution";
import { ExecutionResult } from "./execution-result";
import { ExecutionStatusBadge } from "./execution-status-badge";
import { ExecutionSummary } from "./execution-summary";
import { ExecutionTimeline } from "./execution-timeline";

export function ExecutionDetail({ id }: { id: string }) {
  const { execution, error } = useExecution(id);

  if (!execution) {
    return <main className="shell"><p className="notice">{error || "Carregando execucao..."}</p></main>;
  }

  return (
    <main className="shell">
      <header className="topbar">
        <Link href="/" className="icon-link" aria-label="Voltar"><ArrowLeft size={20} /></Link>
        <div className="brand"><p className="eyebrow">RPA Control</p><h1>Detalhes da execução</h1></div>
        <ExecutionStatusBadge status={execution.status} />
      </header>
      <ExecutionSummary execution={execution} />
      {error && <p className="warning" role="status">{error}</p>}
      <div className="detail-grid">
        <ExecutionTimeline events={execution.events} />
        <ExecutionResult execution={execution} />
      </div>
    </main>
  );
}
