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
// PRECO DE LANCAMENTO DO MENSAL (pedido do usuario em 28/09/2026): R$ 79 no
// PRIMEIRO mes pra quem assinar entre 28/09 e 05/10/2026 (ja no ar; sai
// sozinho depois do dia 5, a pedido do usuario); as renovacoes
// seguem a R$ 110 (`PLANS.mensal.price`, que continua sendo o preco normal).
// Fora da janela o site volta sozinho pro preco normal — ver
// useLaunchPromo() em components/Pricing.tsx.
//
// ⚠ O que o Mercado Pago COBRA nao sai daqui: sai do plano de assinatura
// configurado em MP_PREAPPROVAL_PLAN_ID (ver scripts/setup-mercadopago.mjs).
// Anunciar "R$ 79 no 1º mes, depois R$ 110" exige que a cobranca faca
// exatamente isso — ver o CLAUDE.md, secao "Preco de lancamento".
// ─────────────────────────────────────────────────────────────────────────
export const MENSAL_LAUNCH = {
  price: 79,
  startsAt: "2026-09-28T00:00:00-03:00",
  endsAt: "2026-10-05T23:59:59-03:00",
  // Como a data aparece no texto do site.
  endsLabel: "05/10",
} as const;

export function isLaunchActive(now: number = Date.now()): boolean {
  return (
    now >= new Date(MENSAL_LAUNCH.startsAt).getTime() &&
    now <= new Date(MENSAL_LAUNCH.endsAt).getTime()
  );
}
