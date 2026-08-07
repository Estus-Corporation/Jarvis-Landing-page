import React from "react";

// Rotulo padrao das secoes tecnicas: ponto de LED aceso + texto em caixa
// alta, fonte Exo 2. Centraliza o padrao pra "Recursos", "Integracoes",
// "Interface" e "Proximas atualizacoes" nascerem com o mesmo tratamento.
export default function SectionEyebrow({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-2.5 rounded-full border border-white/[0.1] bg-white/[0.03] px-3.5 py-1.5 font-display text-xs font-semibold uppercase tracking-[0.2em] text-white/60 ${className}`}
    >
      <span className="led-dot" aria-hidden />
      {children}
    </span>
  );
}
