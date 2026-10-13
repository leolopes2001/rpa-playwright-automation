export function formatDuration(milliseconds?: number): string {
  if (milliseconds == null) return "-";
  return milliseconds < 1000
    ? `${milliseconds} ms`
    : `${Math.round(milliseconds / 100) / 10}s`;
}

export function formatDate(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "medium",
  }).format(new Date(value));
}
