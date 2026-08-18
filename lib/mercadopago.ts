import {
  MercadoPagoConfig,
  Payment,
  PreApproval,
  PreApprovalPlan,
  Preference,
} from "mercadopago";
import { randomUUID } from "node:crypto";
import { requireEnv } from "@/lib/env";
import { CURRENCY, PLANS } from "@/lib/plans";
import { SITE_URL } from "@/lib/site";

// Client criado sob demanda (nao no topo do modulo) — ver o comentario em
// lib/env.ts sobre `next build` rodar sem os segredos de producao.
function client() {
  return new MercadoPagoConfig({
    accessToken: requireEnv("MP_ACCESS_TOKEN"),
    options: { timeout: 8000 },
  });
}

// Onde o Mercado Pago devolve o comprador e para onde ele avisa que algo
// aconteceu. `notification_url` precisa ser publica: em teste local, e a URL
// do tunel (ngrok), nao localhost.
const backUrls = {
  success: `${SITE_URL}/obrigado`,
  pending: `${SITE_URL}/pagamento-pendente`,
  failure: `${SITE_URL}/pagamento-recusado`,
};

const notificationUrl = `${SITE_URL}/api/webhooks/mercadopago`;

// ---- Plano Anual: cobranca unica (Checkout Pro) ---------------------------
// Uma "preference" e criada a cada clique, entao cada compra tem seu proprio
// external_reference e da pra rastrear individualmente no painel.
export async function createAnnualCheckout(): Promise<string> {
  const plan = PLANS.anual;
  const preference = await new Preference(client()).create({
    body: {
      items: [
        {
          id: plan.id,
          title: `Jarvis ${plan.label}`,
          description: "Assistente de voz para Windows — 12 meses de acesso",
          category_id: "services",
          quantity: 1,
          currency_id: CURRENCY,
          unit_price: plan.price,
        },
      ],
      back_urls: backUrls,
      // Devolve o comprador sozinho pro site quando o pagamento e aprovado,
      // em vez de deixar ele parado na tela de confirmacao do Mercado Pago.
      auto_return: "approved",
      notification_url: notificationUrl,
      external_reference: `${plan.id}:${randomUUID()}`,
      // O que aparece na fatura do cartao. Sem isso vira o nome da conta do
      // Mercado Pago, que o comprador nao reconhece e contesta.
      statement_descriptor: "JARVIS",
    },
  });

  const initPoint = preference.init_point;
  if (!initPoint) {
    throw new Error("Mercado Pago nao retornou init_point para a preferencia.");
  }
  return initPoint;
}

// ---- Plano Mensal: assinatura recorrente ---------------------------------
// Usa um PLANO de assinatura criado uma vez (ver scripts/setup-mercadopago.mjs)
// em vez de criar uma assinatura por clique. Motivo: `POST /preapproval` exige
// `payer_email`, que so temos DEPOIS que a pessoa se identifica — pedir o
// e-mail antes obrigaria a digita-lo duas vezes (aqui e na tela do Mercado
// Pago). O link do plano deixa o Mercado Pago coletar o e-mail uma vez so, e
// ele volta pra gente no webhook.
export async function getMonthlyCheckout(): Promise<string> {
  const planId = requireEnv("MP_PREAPPROVAL_PLAN_ID");
  const plan = await new PreApprovalPlan(client()).get({ preApprovalPlanId: planId });

  const initPoint = plan.init_point;
  if (!initPoint) {
    throw new Error(
      `Plano de assinatura ${planId} nao retornou init_point (status: ${plan.status}).`
    );
  }
  return initPoint;
}

// ---- Consultas usadas pelo webhook ---------------------------------------
// O corpo do webhook so traz um ID. O estado real (pago? autorizado? de quem?)
// vem sempre de uma consulta autenticada — nunca do corpo, que qualquer um
// poderia forjar.
export async function fetchPayment(id: string) {
  return new Payment(client()).get({ id });
}

export async function fetchPreApproval(id: string) {
  return new PreApproval(client()).get({ id });
}
