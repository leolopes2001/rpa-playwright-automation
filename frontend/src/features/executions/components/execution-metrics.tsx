import { Activity } from "lucide-react";
import type { Execution } from "../types";

export function ExecutionMetrics({ executions }: { executions: Execution[] }) {
  const totals = executions.reduce<Record<string, number>>(
    (summary, execution) => ({ ...summary, [execution.status]: (summary[execution.status] ?? 0) + 1 }),
    {},
  );

  return (
    <section className="metrics">
      <div><span>Total recente</span><strong>{executions.length}</strong><Activity size={19} /></div>
      <div><span>Executando</span><strong>{totals.PROCESSING ?? 0}</strong><i className="metric-dot blue" /></div>
      <div><span>Concluídas</span><strong>{totals.SUCCESS ?? 0}</strong><i className="metric-dot green" /></div>
      <div><span>Falhas</span><strong>{totals.FAILED ?? 0}</strong><i className="metric-dot red" /></div>
    </section>
  );
}
