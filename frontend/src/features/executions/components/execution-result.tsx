import { FileImage, Link2 } from "lucide-react";
import { API_URL } from "@/lib/http-client";
import type { Execution } from "../types";

export function ExecutionResult({ execution }: { execution: Execution }) {
  const result = execution.result;

  return (
    <aside className="result-panel">
      <div className="section-heading"><h2>Resultado</h2></div>
      {execution.error ? (
        <pre className="error-box">{execution.error}</pre>
      ) : result ? (
        <>
          <h3>{result.title || "Página sem título"}</h3>
          <p className="muted">Links encontrados</p>
          <ul className="links-list">
            {result.links?.map((link) => <li key={link.href}><Link2 size={15} /><a href={link.href} target="_blank" rel="noreferrer">{link.text || link.href}</a></li>)}
          </ul>
        </>
      ) : (
        <p className="empty">O resultado aparecerá ao final do processamento.</p>
      )}
      {!!execution.artifacts?.length && (
        <div className="artifacts">
          <h3>Capturas</h3>
          {execution.artifacts.map((artifact) => <a key={artifact.id} href={`${API_URL}/executions/${execution.id}/artifacts/${artifact.id}`} target="_blank"><FileImage size={17} />{artifact.name}</a>)}
        </div>
      )}
    </aside>
  );
}
