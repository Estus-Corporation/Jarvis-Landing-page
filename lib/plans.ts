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

// ─────────────────────────────────────────────────────────────────────────
// PRECO DE FUNDADOR DO MENSAL (decidido em 29/09/2026): R$ 79/mes, enquanto a
// assinatura estiver ativa, para os PRIMEIROS 50 assinantes do Mensal. Sem
// data de termino: acaba quando entrarem 50.
//
// Um interruptor so, NEXT_PUBLIC_FOUNDER_OPEN, decide o site E a cobranca:
//   "true" → o site mostra R$ 79 e /api/checkout/mensal usa o plano
//            MP_PREAPPROVAL_PLAN_ID_FOUNDER (R$ 79);
//   outro  → site em R$ 110 e plano MP_PREAPPROVAL_PLAN_ID (R$ 110).
// Fechar = trocar para "false" na Vercel e redeployar (NEXT_PUBLIC_ e embutido
// no build). A contagem dos 50 e MANUAL, no painel do Mercado Pago, de
// proposito: fechar sozinho pela contagem deixaria o site anunciando R$ 79
// enquanto o checkout ja cobra R$ 110. Quem entrar entre o 50º e o
// redeploy fica com R$ 79 — a favor do cliente.
//
// Regras do preco (reajuste, cancelamento): Termos de Uso, secao 13.
// ─────────────────────────────────────────────────────────────────────────
export const MENSAL_FOUNDER = {
  price: 79,
  slots: 50,
} as const;

// Acesso literal a process.env.NEXT_PUBLIC_*: e o que o Next substitui no
// build, inclusive no bundle do cliente.
export function isFounderOpen(): boolean {
  return process.env.NEXT_PUBLIC_FOUNDER_OPEN === "true";
}
