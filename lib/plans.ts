// Valor NUMERICO dos planos, que e o que o Mercado Pago cobra de verdade.
//
// Os mesmos precos aparecem como texto em components/Pricing.tsx
// (`plans[].price`) e no JSON-LD de app/page.tsx. Sao tres leitores
// diferentes — visitante, buscador e gateway — e se divergirem o cliente e
// cobrado num valor diferente do anunciado. Mudou aqui, mude nos outros dois.
export type PlanId = "mensal" | "anual";

export const PLANS = {
  mensal: {
    id: "mensal",
    label: "Mensal",
    price: 79,
    // Assinatura recorrente: o cartao e cobrado sozinho todo mes ate o
    // cliente cancelar.
    billing: "recorrente",
  },
  anual: {
    id: "anual",
    label: "Anual",
    price: 650,
    // Cobranca unica que da direito a 12 meses. Nao renova sozinha.
    billing: "unico",
  },
} as const satisfies Record<PlanId, { id: PlanId; label: string; price: number; billing: string }>;

export const CURRENCY = "BRL";
