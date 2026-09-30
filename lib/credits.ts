import { requireEnv } from "@/lib/env";
import type { PlanId } from "@/lib/plans";

// Concede/reseta o saldo de crédito gerenciado (Jarvis Credits Server, repo
// separado Estus-Corporation/Jarvis-Credits-Server) pra um comprador
// aprovado. Chama POST /v1/admin/grant, protegido por um segredo
// compartilhado (CREDITS_ADMIN_SECRET aqui = ADMIN_SECRET lá — precisa ser o
// MESMO valor nos dois lados) — esse endpoint nunca é exposto ao app do
// usuário final, só a este webhook.
//
// Devolve o token de sessão (o "código de acesso" que a pessoa cola no app,
// no lugar de criar as próprias chaves OpenAI/ElevenLabs) — incluído no
// e-mail de compra junto da chave de licença.
// `eventId` e o id do pagamento/assinatura no Mercado Pago. Ele viaja junto
// porque a deduplicacao do lado de ca (o `Set` em memoria no route.ts) morre
// com a instancia serverless — e o Mercado Pago reenvia a mesma notificacao a
// cada 15 min ate receber um 2xx. Como /v1/admin/grant RESETA o saldo (nao
// soma), um reenvio atrasado devolveria o saldo cheio pra quem ja gastou
// metade do mes. Com o eventId, o servidor de creditos reconhece a repeticao e
// responde o estado atual sem tocar em nada (tabela `processed_events` la).
export async function grantCredits(
  email: string,
  plan: PlanId,
  eventId?: string
): Promise<string> {
  const baseUrl = requireEnv("CREDITS_SERVER_URL");
  const res = await fetch(`${baseUrl}/v1/admin/grant`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Admin-Secret": requireEnv("CREDITS_ADMIN_SECRET"),
    },
    body: JSON.stringify({ email, planId: plan, eventId }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Falha ao conceder crédito gerenciado (${res.status}): ${detail}`);
  }

  const data = (await res.json()) as { token: string };
  return data.token;
}

// Avisa o servidor de creditos que a assinatura foi cancelada no Mercado Pago.
//
// **Nao tira o acesso na hora** — quem cancelou no dia 3 pagou o mes inteiro. O
// periodo corrente continua valendo ate `current_period_end`, e o que o
// cancelamento faz e impedir a renovacao (que ja nao aconteceria sozinha, por
// falta de cobranca nova). O ganho real e de VISIBILIDADE: sem isto, um
// cancelamento so aparecia quando o periodo vencia — ate um mes depois no
// mensal, um ano no anual —, ou seja, o churn ficava invisivel exatamente no
// periodo em que da pra reagir a ele.
//
// Diferente de `grantCredits`, aqui um erro NAO e propagado: o cancelamento e
// um registro de gestao, nao a entrega de algo que o cliente pagou. Derrubar o
// webhook com 500 por causa disto faria o Mercado Pago reenviar a notificacao
// em loop sem nada pra consertar. Loga alto e segue.
export async function markSubscriptionCanceled(
  email: string,
  eventId?: string
): Promise<void> {
  try {
    const baseUrl = requireEnv("CREDITS_SERVER_URL");
    const res = await fetch(`${baseUrl}/v1/admin/subscription-canceled`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Admin-Secret": requireEnv("CREDITS_ADMIN_SECRET"),
      },
      body: JSON.stringify({ email, eventId }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error(
        `[credits] falha ao marcar cancelamento de ${email} (${res.status}): ${detail}`
      );
      return;
    }
    console.log(`[credits] cancelamento registrado para ${email}`);
  } catch (error) {
    console.error(`[credits] erro ao marcar cancelamento de ${email}:`, error);
  }
}
