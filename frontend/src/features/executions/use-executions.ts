"use client";

import { useEffect, useState } from "react";
import { listExecutions } from "./executions.api";
import type { Execution, ExecutionFilters } from "./types";

const INITIAL_FILTERS: ExecutionFilters = { status: "", search: "" };

export function useExecutions() {
  const [items, setItems] = useState<Execution[]>([]);
  const [filters, setFilters] = useState<ExecutionFilters>(INITIAL_FILTERS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function refresh() {
    try {
      setItems(await listExecutions(filters));
      setError("");
    } catch (value) {
      setError((value as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const executions = await listExecutions(filters);
        if (active) {
          setItems(executions);
          setError("");
          setLoading(false);
        }
      } catch (value) {
        if (active) {
          setError((value as Error).message);
          setLoading(false);
        }
      }
    };

    const initial = window.setTimeout(() => void load(), 0);
    const polling = window.setInterval(() => void load(), 10_000);
    return () => {
      active = false;
      clearTimeout(initial);
      clearInterval(polling);
    };
  }, [filters]);

  return { items, filters, setFilters, loading, error, setError, refresh };
}
