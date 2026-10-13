import { FormEvent, useState } from "react";
import { ArrowRight, RefreshCw } from "lucide-react";

interface CreateExecutionFormProps {
  submitting: boolean;
  onSubmit: (url: string) => Promise<void>;
}

export function CreateExecutionForm({ submitting, onSubmit }: CreateExecutionFormProps) {
  const [url, setUrl] = useState("");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    void onSubmit(url);
  }

  return (
    <section className="run-band">
      <div>
        <p className="eyebrow">Nova execução</p>
        <h2>Qual página vamos processar?</h2>
        <p>Envie uma URL pública. O worker cuidará do restante em segundo plano.</p>
      </div>
      <form onSubmit={handleSubmit}>
        <label htmlFor="url">URL da página</label>
        <div className="input-action">
          <input id="url" type="url" required placeholder="https://site.com/pagina" value={url} onChange={(event) => setUrl(event.target.value)} />
          <button disabled={submitting}>
            {submitting ? <RefreshCw className="spin" size={18} /> : <ArrowRight size={18} />}
            <span>{submitting ? "Enviando" : "Executar RPA"}</span>
          </button>
        </div>
      </form>
    </section>
  );
}
