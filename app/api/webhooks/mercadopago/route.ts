import { NextResponse, type NextRequest } from "next/server";
import {
  InvalidWebhookSignatureError,
  WebhookSignatureValidator,
} from "mercadopago";
import { requireEnv } from "@/lib/env";
import { fetchPayment, fetchPreApproval } from "@/lib/mercadopago";
import { generateLicenseKey } from "@/lib/license";
import { grantCredits, markSubscriptionCanceled, refundCredits } from "@/lib/credits";
import { sendPurchaseEmail } from "@/lib/email";
import type { PlanId } from "@/lib/plans";

export const dynamic = "force-dynamic";

// Reduz e-mail duplicado quando o Mercado Pago reenvia a mesma notificacao
// (ele reenvia a cada 15 min ate receber um 2xx, e costuma cair na mesma
// instancia quente). NAO resolve o caso geral: a memoria morre junto com a
// instancia serverless. Ainda vale a pena porque agora a licenca NAO e mais
// deterministica (o payload leva `iat`, ver lib/license.ts) — sem isso, um
// reenvio geraria uma segunda licenca (ambas validas, so um pouco confuso
// pro comprador ver dois codigos diferentes por e-mail).
const processed = new Set<string>();

async function deliver(
  email: string | undefined,
  plan: PlanId,
  id: string,
  isRenewal: boolean
) {
  if (!email) {
    // Nada a fazer sem e-mail, e reenviar a notificacao nao vai criar um.
    // Erro alto no log pra alguem entregar a licenca na mao.
    console.error(
      `[webhook] pagamento ${id} (${plan}) aprovado SEM e-mail do comprador — entregar manualmente`
    );
    return;
  }
  if (processed.has(id)) return;

  const licenseKey = generateLicenseKey(email, plan);
  // Credito gerenciado (Jarvis Credits Server) — reseta pro valor do plano;
  // se essa chamada falhar, o catch do POST devolve 500 e o Mercado Pago
  // reenvia (mesma logica de "falha parcial = tentar tudo de novo" do
  // envio de e-mail abaixo).
  // O `id` vai junto como chave de idempotencia: e o que impede um reenvio do
  // Mercado Pago de resetar o saldo de quem ja consumiu parte do mes. A
  // deducao de verdade acontece no servidor de creditos, que tem banco; o
  // `processed` abaixo continua sendo so uma economia de chamada na instancia
  // quente.
  // O token que o grant devolve nao vai mais no e-mail — ver lib/email.ts.
  await grantCredits(email, plan, id);

  await sendPurchaseEmail(email, plan, licenseKey, isRenewal);
  // Marcado so DEPOIS do envio dar certo: marcar antes faria uma falha de
  // e-mail bloquear a propria retentativa do Mercado Pago que existe pra
  // consertar essa falha.
  processed.add(id);
  console.log(
    `[webhook] licenca ${plan} (${isRenewal ? "renovacao" : "nova"}) entregue para ${email} (${id})`
  );
}

// Pagamento que deixou de valer: estorno (`refunded`, inclusive o de 7 dias do
// CDC feito pelo painel) ou contestacao no cartao (`charged_back`). O Mercado
// Pago avisa pelo mesmo tipo da aprovacao, so com outro status. Qualquer outro
// status (pending, rejected...) nao mexe em nada.
const REVOKED_STATUSES = new Set(["refunded", "charged_back"]);

async function revoke(
  status: string | undefined,
  email: string | undefined,
  id: string
) {
  if (!status || !REVOKED_STATUSES.has(status)) return;
  if (!email) {
    console.error(`[webhook] pagamento ${id} ${status} SEM e-mail — zerar saldo manualmente`);
    return;
  }
  await refundCredits(email, id);
}

type Payment = Awaited<ReturnType<typeof fetchPayment>>;

// QUAL PLANO UM PAGAMENTO APROVADO COMPRA.
//
// So o checkout do Anual (Checkout Pro, lib/mercadopago.ts) grava
// `external_reference` ("anual:<uuid>"). A cobranca de uma ASSINATURA — o
// Mensal, criado a partir de um PreApprovalPlan — chega aqui como `payment`
// SEM esse campo. Antes o fallback era `?? "anual"`, e a primeira compra real
// de teste (30/09/2026, R$ 79 de fundador) recebeu saldo de 12 meses, periodo
// de 370 dias e licenca anual. O fallback agora e "mensal": o unico outro
// caminho que gera pagamento nesta aplicacao e a assinatura.
function planOf(payment: Payment): PlanId {
  const prefix = payment.external_reference?.split(":")[0];
  if (prefix === "anual" || prefix === "mensal") return prefix;
  return "mensal";
}

// Id da assinatura (preapproval) que gerou o pagamento. O SDK nao tipa esses
// campos, e o Mercado Pago ja os mandou em lugares diferentes ao longo das
// versoes da API — por isso as duas fontes.
function subscriptionIdOf(payment: Payment): string | undefined {
  const fromMetadata = payment.metadata?.preapproval_id;
  const transactionData = payment.point_of_interaction?.transaction_data as
    | { subscription_id?: string }
    | undefined;
  const id = fromMetadata ?? transactionData?.subscription_id;
  return typeof id === "string" && id ? id : undefined;
}

// Renovacao = cobranca que nao e a primeira da assinatura. Decidido pela
// DISTANCIA entre a criacao da assinatura e a aprovacao do pagamento, nao por
// `summarized.charged_quantity`: nao da pra saber se esse contador ja inclui a
// cobranca que esta sendo notificada agora, e errar nisso trocaria o e-mail
// de boas-vindas pelo de renovacao (ou o contrario). A primeira cobranca sai
// na hora da adesao — 7 dias de folga cobrem retentativa de cartao recusado;
// a renovacao vem ~30 dias depois.
const FIRST_CHARGE_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

async function isRenewalCharge(payment: Payment, id: string): Promise<boolean> {
  const subscriptionId = subscriptionIdOf(payment);
  if (!subscriptionId) {
    console.warn(`[webhook] pagamento ${id} sem id de assinatura — tratado como 1a cobranca`);
    return false;
  }
  try {
    const subscription = await fetchPreApproval(subscriptionId);
    const createdAt = Date.parse(subscription.date_created ?? "");
    const chargedAt = Date.parse(payment.date_approved ?? payment.date_created ?? "");
    if (Number.isNaN(createdAt) || Number.isNaN(chargedAt)) return false;
    return chargedAt - createdAt > FIRST_CHARGE_WINDOW_MS;
  } catch (error) {
    // So muda o texto do e-mail. Nao vale derrubar a entrega por isso.
    console.warn(`[webhook] nao consegui consultar a assinatura ${subscriptionId}:`, error);
    return false;
  }
}

// Tipos que resultam em alguma acao. Tudo que nao for isso — merchant_order
// (rastreio de pedido), etc. — e ignorado antes mesmo de validar assinatura:
// como nenhuma acao e tomada, nao ha nada a proteger, e validar mesmo assim
// so rejeitava notificacoes legitimas (o MP nao assina merchant_order do mesmo
// jeito que payment/subscription_preapproval) e fazia o Mercado Pago reenviar
// em loop.
//
// ENTREGA (licenca + credito + e-mail) SAI SO DE `payment`. Toda cobranca de
// assinatura, a primeira e cada renovacao, vira um pagamento de verdade e
// dispara `payment` — foi o unico evento que chegou na compra real de
// 30/09/2026. Entregar tambem por `subscription_preapproval` (autorizada) e
// por `subscription_authorized_payment` (a fatura da assinatura) mandava ate
// tres e-mails, com tres licencas diferentes, pra mesma compra: cada evento
// tem um id proprio, entao a deduplicacao por id nao os reconhecia como o
// mesmo pagamento.
//
// `subscription_authorized_payment` saiu da lista por isso, e porque o id dele
// e de uma fatura (/authorized_payments), nao de um pagamento: o
// `fetchPayment` que o tratava nao achava o recurso, o webhook respondia 500 e
// o Mercado Pago reenviava em loop. `subscription_preapproval` continua — e
// por ele que chega o cancelamento.
const ACTIONABLE_TYPES = new Set(["payment", "subscription_preapproval"]);

export async function POST(request: NextRequest) {
  const url = new URL(request.url);
  const dataId = url.searchParams.get("data.id") ?? url.searchParams.get("id");
  const queryType =
    url.searchParams.get("type") ?? url.searchParams.get("topic");

  if (queryType && !ACTIONABLE_TYPES.has(queryType)) {
    return NextResponse.json({ ignored: queryType }, { status: 200 });
  }

  try {
    WebhookSignatureValidator.validate({
      xSignature: request.headers.get("x-signature"),
      xRequestId: request.headers.get("x-request-id"),
      dataId,
      secret: requireEnv("MP_WEBHOOK_SECRET"),
      // Janela curta: uma notificacao legitima chega em segundos, entao
      // aceitar assinaturas antigas so abriria espaco pra reenvio de uma
      // requisicao capturada.
      toleranceSeconds: 300,
    });
  } catch (error) {
    if (error instanceof InvalidWebhookSignatureError) {
      console.warn(`[webhook] assinatura invalida (${error.reason})`);
      return new NextResponse(null, { status: 401 });
    }
    throw error;
  }

  const body = await request.json();
  // O corpo so serve pra saber O QUE mudou. O estado real vem sempre da
  // consulta autenticada abaixo — confiar no corpo deixaria qualquer um
  // liberar licenca postando JSON aqui.
  const type: string | undefined = body?.type ?? queryType;
  const id: string | undefined = body?.data?.id ?? dataId ?? undefined;

  if (type && !ACTIONABLE_TYPES.has(type)) {
    return NextResponse.json({ ignored: type }, { status: 200 });
  }

  if (!id) {
    return NextResponse.json({ ignored: "sem id" }, { status: 200 });
  }

  try {
    if (type === "payment") {
      const payment = await fetchPayment(id);
      if (payment.status === "approved") {
        const plan = planOf(payment);
        const isRenewal = plan === "mensal" && (await isRenewalCharge(payment, id));
        await deliver(payment.payer?.email, plan, id, isRenewal);
      } else {
        await revoke(payment.status, payment.payer?.email, id);
      }
    } else if (type === "subscription_preapproval") {
      const subscription = await fetchPreApproval(id);
      if (subscription.status === "authorized") {
        // Nada a entregar aqui: a primeira cobranca chega como `payment` e e
        // entregue la (ver ACTIONABLE_TYPES). Uma assinatura que volta de
        // `paused` se reativa sozinha no Credits Server no proximo pagamento,
        // porque o grant marca a assinatura como ativa.
      } else if (
        subscription.status === "cancelled" ||
        subscription.status === "paused"
      ) {
        // O Mercado Pago avisa o cancelamento por ESTE mesmo tipo, so com
        // outro status — antes isto caia fora do if sem fazer nada, e o churn
        // so aparecia quando o periodo vencia (ate um mes depois).
        //
        // `paused` entra junto de proposito: pro nosso lado o efeito e o
        // mesmo (nao vem cobranca nova, logo nao vem grant), e tratar como
        // ativo faria o painel contar um assinante que parou de pagar. Se a
        // assinatura voltar, o `authorized` acima reativa a linha.
        //
        // Nao mexe em saldo nem em periodo: o cliente pagou o mes corrente e
        // usa ate o fim dele. Ver o endpoint /v1/admin/subscription-canceled.
        //
        // Sem e-mail nao ha linha pra marcar (a PK de `subscriptions` e o
        // e-mail). Loga alto em vez de silenciar: e um cancelamento real que
        // vai ficar contado como ativo no painel ate o periodo vencer.
        if (subscription.payer_email) {
          await markSubscriptionCanceled(subscription.payer_email, id);
        } else {
          console.error(
            `[webhook] assinatura ${id} cancelada SEM e-mail do pagador — marcar manualmente`
          );
        }
      }
    }
    // merchant_order, subscription_authorized_payment e outros tipos sao
    // ignorados de proposito — ver ACTIONABLE_TYPES. A renovacao mensal
    // (reemitir a licenca de ~35 dias e resetar o credito) acontece pelo
    // `payment` da cobranca, acima.
  } catch (error) {
    console.error(`[webhook] falha ao processar ${type} ${id}:`, error);
    // 500 de proposito: o Mercado Pago reenvia, e um erro transitorio (API
    // fora do ar, envio de e-mail falhando) vira uma nova tentativa em vez de
    // uma compra paga sem licenca entregue.
    return new NextResponse(null, { status: 500 });
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
