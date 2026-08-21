import { NextResponse, type NextRequest } from "next/server";
import {
  InvalidWebhookSignatureError,
  WebhookSignatureValidator,
} from "mercadopago";
import { requireEnv } from "@/lib/env";
import { fetchPayment, fetchPreApproval } from "@/lib/mercadopago";
import { generateLicenseKey } from "@/lib/license";
import { sendPurchaseEmail } from "@/lib/email";
import type { PlanId } from "@/lib/plans";

export const dynamic = "force-dynamic";

// Reduz e-mail duplicado quando o Mercado Pago reenvia a mesma notificacao
// (ele reenvia a cada 15 min ate receber um 2xx, e costuma cair na mesma
// instancia quente). NAO resolve o caso geral: a memoria morre junto com a
// instancia serverless. So vale a pena porque o dano de um duplicado e
// pequeno — a chave e deterministica (ver lib/license.ts), entao o cliente
// receberia o mesmo e-mail duas vezes, nunca duas licencas diferentes.
const processed = new Set<string>();

async function deliver(email: string | undefined, plan: PlanId, id: string) {
  if (!email) {
    // Nada a fazer sem e-mail, e reenviar a notificacao nao vai criar um.
    // Erro alto no log pra alguem entregar a licenca na mao.
    console.error(
      `[webhook] pagamento ${id} (${plan}) aprovado SEM e-mail do comprador — entregar manualmente`
    );
    return;
  }
  if (processed.has(id)) return;

  await sendPurchaseEmail(email, plan, generateLicenseKey(email, plan));
  // Marcado so DEPOIS do envio dar certo: marcar antes faria uma falha de
  // e-mail bloquear a propria retentativa do Mercado Pago que existe pra
  // consertar essa falha.
  processed.add(id);
  console.log(`[webhook] licenca ${plan} entregue para ${email} (${id})`);
}

// Tipos que resultam em alguma acao (entrega de licenca). Tudo que nao for
// isso — merchant_order (rastreio de pedido), etc. — e ignorado antes mesmo
// de validar assinatura: como nenhuma acao e tomada, nao ha nada a proteger,
// e validar mesmo assim so rejeitava notificacoes legitimas (o MP nao assina
// merchant_order do mesmo jeito que payment/subscription_preapproval) e
// fazia o Mercado Pago reenviar em loop.
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
        // external_reference sai como "anual:<uuid>" (ver lib/mercadopago.ts).
        const plan = (payment.external_reference?.split(":")[0] ??
          "anual") as PlanId;
        await deliver(payment.payer?.email, plan, id);
      }
    } else if (type === "subscription_preapproval") {
      const subscription = await fetchPreApproval(id);
      if (subscription.status === "authorized") {
        await deliver(subscription.payer_email, "mensal", id);
      }
    }
    // Os demais tipos (subscription_authorized_payment das renovacoes,
    // merchant_order, etc.) sao ignorados de proposito: a licenca ja foi
    // entregue na autorizacao e reenviar a cada mes so viraria spam.
  } catch (error) {
    console.error(`[webhook] falha ao processar ${type} ${id}:`, error);
    // 500 de proposito: o Mercado Pago reenvia, e um erro transitorio (API
    // fora do ar, envio de e-mail falhando) vira uma nova tentativa em vez de
    // uma compra paga sem licenca entregue.
    return new NextResponse(null, { status: 500 });
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
