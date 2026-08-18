import { createHmac } from "node:crypto";
import { requireEnv } from "@/lib/env";
import type { PlanId } from "@/lib/plans";

// Chave de licenca derivada, nao sorteada: e o HMAC do proprio par
// (e-mail, plano). Isso e o que permite nao ter banco de dados nesta fase —
// para conferir se uma chave e valida basta recalcular o HMAC a partir do
// e-mail e comparar, sem precisar guardar nada. Reemitir a chave do mesmo
// comprador sempre devolve o mesmo valor, entao um webhook reentregue pelo
// Mercado Pago nao gera uma segunda licenca diferente.
//
// O e-mail e normalizado porque o comprador pode escrever com maiuscula ou
// espaco sobrando, e a chave precisa bater igual na hora de validar.
//
// EM ABERTO: o app Windows do Jarvis ainda nao valida licenca nenhuma. Quando
// for implementar, ele precisa repetir exatamente este calculo (mesmo segredo,
// mesmo formato de payload) — ou este formato muda junto.
export function generateLicenseKey(email: string, plan: PlanId): string {
  const payload = `${email.trim().toLowerCase()}|${plan}`;
  const digest = createHmac("sha256", requireEnv("LICENSE_SIGNING_SECRET"))
    .update(payload)
    .digest("hex")
    .toUpperCase();

  // 16 caracteres em 4 blocos: curto o bastante pra alguem digitar a mao,
  // longo o bastante (64 bits) pra nao dar pra adivinhar por tentativa.
  const blocks = digest.slice(0, 16).match(/.{4}/g) ?? [];
  return `JARVIS-${blocks.join("-")}`;
}
