import { CheckCircle2, CircleDashed, Clock3, XCircle } from "lucide-react";
import type { ExecutionStatus } from "../types";

const STATUS_LABELS: Record<ExecutionStatus, string> = {
  QUEUED: "Na fila",
  PROCESSING: "Executando",
  SUCCESS: "Sucesso",
  FAILED: "Falhou",
  CANCELLED: "Cancelada",
};

const STATUS_ICONS = {
  QUEUED: Clock3,
  PROCESSING: CircleDashed,
  SUCCESS: CheckCircle2,
  FAILED: XCircle,
  CANCELLED: XCircle,
};

export function ExecutionStatusBadge({ status }: { status: ExecutionStatus }) {
  const Icon = STATUS_ICONS[status];
  return <span className={`status status-${status.toLowerCase()}`}><Icon size={15} aria-hidden />{STATUS_LABELS[status]}</span>;
}
