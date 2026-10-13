import { Bot } from "lucide-react";

export function AppHeader() {
  return (
    <header className="topbar">
      <div className="brand-mark"><Bot size={23} /></div>
      <div className="brand">
        <p className="eyebrow">Operações</p>
        <h1>RPA Control</h1>
      </div>
      <div className="live"><span />Sistema ativo</div>
    </header>
  );
}
