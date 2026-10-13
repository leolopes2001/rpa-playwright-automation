"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/lib/http-client";
import { getExecution } from "./executions.api";
import type { Execution } from "./types";

export function useExecution(id: string) {
  const [execution, setExecution] = useState<Execution>();
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const current = await getExecution(id);
        if (active) {
          setExecution(current);
          setError("");
        }
      } catch (value) {
        if (active) setError((value as Error).message);
      }
    };

    const initial = window.setTimeout(() => void load(), 0);
    const source = new EventSource(`${API_URL}/executions/${id}/stream`);
    source.addEventListener("execution", () => void load());
    source.onerror = () => setError("Conexao em tempo real interrompida. Tentando reconectar...");

    return () => {
      active = false;
      clearTimeout(initial);
      source.close();
    };
  }, [id]);

  return { execution, error };
}
