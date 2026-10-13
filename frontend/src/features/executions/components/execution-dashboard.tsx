"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createExecution } from "../executions.api";
import { useExecutions } from "../use-executions";
import { AppHeader } from "./app-header";
import { CreateExecutionForm } from "./create-execution-form";
import { ExecutionMetrics } from "./execution-metrics";
import { ExecutionsTable } from "./executions-table";

export function ExecutionDashboard() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const { items, filters, setFilters, loading, error, setError, refresh } = useExecutions();

  async function handleCreate(url: string) {
    setSubmitting(true);
    setError("");
    try {
      const execution = await createExecution(url);
      router.push(`/executions/${execution.id}`);
    } catch (value) {
      setError((value as Error).message);
      setSubmitting(false);
    }
  }

  return (
    <main className="shell">
      <AppHeader />
      <CreateExecutionForm submitting={submitting} onSubmit={handleCreate} />
      {error && <p className="warning" role="alert">{error}</p>}
      <ExecutionMetrics executions={items} />
      <ExecutionsTable
        items={items}
        filters={filters}
        loading={loading}
        onFiltersChange={setFilters}
        onRefresh={() => void refresh()}
        onSelect={(id) => router.push(`/executions/${id}`)}
      />
    </main>
  );
}
