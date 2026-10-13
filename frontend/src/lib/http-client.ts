export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

interface ApiErrorBody {
  message?: string | string[];
}

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({})) as ApiErrorBody;
    const message = Array.isArray(body.message) ? body.message.join(" ") : body.message;
    throw new Error(message || "Nao foi possivel concluir a solicitacao.");
  }

  return response.json() as Promise<T>;
}
