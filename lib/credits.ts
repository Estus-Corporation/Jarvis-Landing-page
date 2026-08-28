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
export async function grantCredits(email: string, plan: PlanId): Promise<string> {
  const baseUrl = requireEnv("CREDITS_SERVER_URL");
  const res = await fetch(`${baseUrl}/v1/admin/grant`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Admin-Secret": requireEnv("CREDITS_ADMIN_SECRET"),
    },
    body: JSON.stringify({ email, planId: plan }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Falha ao conceder crédito gerenciado (${res.status}): ${detail}`);
  }

  const data = (await res.json()) as { token: string };
  return data.token;
}
