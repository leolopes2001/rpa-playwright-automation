import { ArrowRight, Bot, RefreshCw, Search } from "lucide-react";
import { formatDate, formatDuration } from "@/lib/formatters";
import type { Execution, ExecutionFilters, ExecutionStatus } from "../types";
import { ExecutionStatusBadge } from "./execution-status-badge";

interface ExecutionsTableProps {
  items: Execution[];
  filters: ExecutionFilters;
  loading: boolean;
  onFiltersChange: (filters: ExecutionFilters) => void;
  onRefresh: () => void;
  onSelect: (id: string) => void;
}

export function ExecutionsTable({ items, filters, loading, onFiltersChange, onRefresh, onSelect }: ExecutionsTableProps) {
  return (
    <section className="executions">
      <div className="section-heading">
        <div><h2>Execuções recentes</h2><p>Acompanhe resultados, tentativas e duração.</p></div>
        <div className="filters">
          <label><Search size={16} /><input aria-label="Buscar URL" placeholder="Buscar URL" value={filters.search} onChange={(event) => onFiltersChange({ ...filters, search: event.target.value })} /></label>
          <select aria-label="Filtrar status" value={filters.status} onChange={(event) => onFiltersChange({ ...filters, status: event.target.value as ExecutionStatus | "" })}>
            <option value="">Todos os status</option><option value="QUEUED">Na fila</option><option value="PROCESSING">Executando</option><option value="SUCCESS">Sucesso</option><option value="FAILED">Falhou</option>
          </select>
          <button className="icon-button" onClick={onRefresh} title="Atualizar"><RefreshCw size={17} /></button>
        </div>
      </div>
      <div className="table-wrap">
        <table><thead><tr><th>URL</th><th>Status</th><th>Progresso</th><th>Criada</th><th>Duração</th><th /></tr></thead>
          <tbody>{items.map((item) => <tr key={item.id} onClick={() => onSelect(item.id)}><td><strong>{new URL(item.url).hostname}</strong><span>{item.url}</span></td><td><ExecutionStatusBadge status={item.status} /></td><td><div className="progress compact"><span style={{ width: `${item.progress}%` }} /></div><small>{item.progress}%</small></td><td>{formatDate(item.createdAt)}</td><td>{formatDuration(item.durationMs)}</td><td><ArrowRight size={17} /></td></tr>)}</tbody>
        </table>
        {!loading && !items.length && <div className="empty"><Bot size={28} /><strong>Nenhuma execução encontrada</strong><span>Envie uma URL para iniciar.</span></div>}
        {loading && <div className="empty">Carregando execuções...</div>}
      </div>
    </section>
  );
}
