import { apiRequest } from "@/lib/http-client";
import type { Execution, ExecutionFilters } from "./types";

interface ExecutionListResponse {
  items: Execution[];
  nextCursor: string | null;
}

export async function listExecutions(filters: ExecutionFilters): Promise<Execution[]> {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.search) params.set("search", filters.search);

  const response = await apiRequest<ExecutionListResponse>(`/executions?${params}`);
  return response.items;
}

export function getExecution(id: string): Promise<Execution> {
  return apiRequest<Execution>(`/executions/${id}`);
}

export function createExecution(url: string): Promise<{ id: string }> {
  return apiRequest<{ id: string }>("/executions", {
    method: "POST",
    headers: { "Idempotency-Key": crypto.randomUUID() },
    body: JSON.stringify({ url }),
  });
}
