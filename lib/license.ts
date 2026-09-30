import { createPrivateKey, sign as edSign } from "node:crypto";
import { requireEnv } from "@/lib/env";
import type { PlanId } from "@/lib/plans";

// Gera uma licença no MESMO formato que o app Windows do Jarvis realmente
// valida — Ed25519, `payload_b64url.assinatura_b64url` — ver
// Jarvis-Developer-Edition/src/main/security/license.ts (verifyLicense) e
// scripts/sign-license.mjs (a implementação de referência que este arquivo
// espelha). A versão anterior deste arquivo gerava um formato HMAC
// determinístico e incompatível: o app rejeitaria essa licença por completo,
// já que `verifyLicense` exige uma assinatura Ed25519 verificável com a
// chave pública embutida no app — não um HMAC.
//
// A chave PRIVADA precisa ser EXATAMENTE o mesmo par cuja chave pública está
// embutida no app hoje (scripts/.license-keys/, gerada por
// gen-license-keys.mjs) — trocar o par invalida licenças já emitidas E exige
// recompilar o app com a chave pública nova. Vem em base64 (LICENSE_PRIVATE_KEY_B64,
// o PEM inteiro codificado) pra evitar o problema de variável de ambiente
// multi-linha em alguns provedores — NUNCA commitar essa chave, só em
// Project Settings > Environment Variables (Vercel).
//
// Diferente da versão HMAC anterior, esta NÃO é determinística (o payload
// inclui `iat`, o timestamp de emissão) — reemitir pro mesmo comprador gera
// um token DIFERENTE a cada vez (ambos válidos). A deduplicação por ID de
// pagamento no webhook continua importante por isso.
function b64url(buf: Buffer): string {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function signLicense(email: string, plan: PlanId, dias: number): string {
  const pem = Buffer.from(requireEnv("LICENSE_PRIVATE_KEY_B64"), "base64").toString("utf8");
  const privateKey = createPrivateKey({ key: pem, format: "pem" });

  const iat = Math.floor(Date.now() / 1000);
  const exp = dias > 0 ? iat + dias * 86400 : 0;
  const payload = { email: email.trim().toLowerCase(), plan, exp, iat };

  const payloadB64 = b64url(Buffer.from(JSON.stringify(payload)));
  const sig = edSign(null, Buffer.from(payloadB64), privateKey);
  return `${payloadB64}.${b64url(sig)}`;
}

export function generateLicenseKey(email: string, plan: PlanId): string {
  // "anual": cobrança única, sem evento de renovação — 12 meses + 5 dias de
  // folga (atraso de processamento não deve derrubar o acesso 1 dia antes da
  // hora). "mensal": expira em ~35 dias e PRECISA ser reemitida a cada
  // cobrança recorrente aprovada (ver app/api/webhooks/mercadopago/route.ts)
  // — sem isso, um assinante que continua pagando perderia acesso depois de
  // um mês, porque a licença (offline, sem revogação/consulta a servidor)
  // simplesmente venceria.
  const dias = plan === "anual" ? 370 : 35;
  return signLicense(email, plan, dias);
}
