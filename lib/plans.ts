// Valor NUMERICO dos planos, que e o que o Mercado Pago cobra de verdade.
//
// ─────────────────────────────────────────────────────────────────────────
// OS CINCO LUGARES ONDE O PREÇO DE UM PLANO VIVE. Divergência entre eles não é
// bug de UI: é cobrar um valor diferente do anunciado, o que o CDC trata como
// publicidade enganosa. Mudou um, varra os cinco na mesma passada:
//
//   1. Jarvis-Landing-page/lib/plans.ts        → o que o Mercado Pago cobra
//   2. Jarvis-Landing-page/components/Pricing.tsx → o texto que o visitante lê
//   3. Jarvis-Landing-page/app/page.tsx        → o JSON-LD que o Google indexa
//   4. Jarvis-Credits-Server/src/pricing.ts    → PLAN_ALLOTMENT_MICRO e PLAN_DIAS
//                                                (quanto de uso o preço compra)
//   5. Project-Jarvis/legal/termos-de-uso.md   → seção 13, o valor contratado
// ─────────────────────────────────────────────────────────────────────────
export type PlanId = "mensal" | "anual";

export const PLANS = {
  mensal: {
    id: "mensal",
    label: "Mensal",
    price: 110,
    // Assinatura recorrente: o cartao e cobrado sozinho todo mes ate o
    // cliente cancelar.
    billing: "recorrente",
  },
  anual: {
    id: "anual",
    label: "Anual",
    price: 899,
    // Cobranca unica que da direito a 12 meses. Nao renova sozinha.
    billing: "unico",
  },
} as const satisfies Record<PlanId, { id: PlanId; label: string; price: number; billing: string }>;

export const CURRENCY = "BRL";
