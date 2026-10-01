import { Resend } from "resend";
import { requireEnv } from "@/lib/env";
import { PLANS, type PlanId } from "@/lib/plans";

// Para onde vai a resposta do cliente. O remetente (EMAIL_FROM) e um
// no-reply@ do dominio do Jarvis, que nao tem caixa de entrada — sem isto, o
// "e so responder este e-mail" do texto cairia no vazio. Mesmo endereco que a
// secao de Precos anuncia pra pedir o reembolso de 7 dias.
const REPLY_TO = "contato@estuscorporation.com.br";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// O e-mail NAO leva mais o "codigo de acesso" (token de sessao do Credits
// Server). Ele era sobra de quando o app nao tinha login: hoje a pessoa entra
// com e-mail + codigo de 6 digitos e o app obtem esse mesmo token sozinho. No
// e-mail ele so confundia ("qual das duas chaves eu colo?") e ainda era uma
// credencial valida por 90 dias trafegando em texto puro.
//
// O que importa dizer e QUAL e-mail usar no login: o saldo pago fica preso ao
// e-mail do comprador no Mercado Pago. Entrar no app com outro e-mail cai numa
// conta sem o plano.
function steps(email: string, isRenewal: boolean) {
  if (isRenewal) {
    return [
      "Se o Jarvis já está ativo no seu computador, o saldo do mês já foi renovado — não precisa fazer nada.",
      "Se a licença aparecer como vencida, cole a chave acima em Configurações → Licença.",
    ];
  }
  return [
    "Baixe e instale o Jarvis pelo botão abaixo.",
    `Na primeira tela, entre com este mesmo e-mail (${email}). Você vai receber um código de 6 dígitos para confirmar.`,
    "Depois, cole a chave de licença acima em Configurações → Licença (ou na tela de assinatura, se ela aparecer).",
  ];
}

function cancelText(plan: PlanId) {
  return plan === "mensal"
    ? "Sua assinatura renova sozinha todo mês — a cada renovação, você recebe um e-mail como este. Para cancelar, use Mercado Pago → Assinaturas, ou responda este e-mail."
    : "Seu acesso vale 12 meses e não renova sozinho — avisaremos antes de vencer.";
}

function buildHtml(
  to: string,
  plan: PlanId,
  licenseKey: string,
  downloadUrl: string,
  isRenewal: boolean
) {
  const label = PLANS[plan].label;
  const heading = isRenewal ? "Assinatura renovada" : "Pagamento confirmado";
  const intro = isRenewal
    ? `Sua assinatura do Jarvis ${label} foi renovada. Sua chave de licença foi atualizada abaixo.`
    : `Obrigado por assinar o Jarvis ${label}. Abaixo está tudo que você precisa para começar.`;
  const stepItems = steps(escapeHtml(to), isRenewal)
    .map(
      (s) =>
        `<li style="margin:0 0 8px;font-size:14px;line-height:1.6;color:rgba(255,255,255,0.7);">${s}</li>`
    )
    .join("");

  return `<!doctype html>
<html lang="pt-BR"><body style="margin:0;padding:32px 16px;background:#0A0A0B;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:520px;margin:0 auto;background:#141417;border:1px solid rgba(255,255,255,0.1);border-radius:20px;padding:32px;">
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:600;color:#FAFAFA;">${heading}</h1>
    <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:rgba(255,255,255,0.6);">
      ${intro}
    </p>

    <p style="margin:0 0 8px;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;color:rgba(255,255,255,0.4);">Sua chave de licença</p>
    <p style="margin:0 0 24px;padding:14px 16px;background:#0E0E10;border:1px solid rgba(255,255,255,0.1);border-radius:10px;font-family:ui-monospace,'SF Mono',Menlo,monospace;font-size:14px;color:#FAFAFA;word-break:break-all;">
      ${licenseKey}
    </p>

    <p style="margin:0 0 8px;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;color:rgba(255,255,255,0.4);">Como ativar</p>
    <ol style="margin:0 0 24px;padding-left:20px;">
      ${stepItems}
    </ol>

    <a href="${downloadUrl}" style="display:block;padding:14px 24px;background:#FAFAFA;border-radius:999px;font-size:15px;font-weight:600;color:#0A0A0B;text-align:center;text-decoration:none;">
      Baixar o Jarvis para Windows
    </a>

    <p style="margin:24px 0 0;font-size:13px;line-height:1.6;color:rgba(255,255,255,0.45);">
      ${cancelText(plan)}
    </p>
    ${
      isRenewal
        ? ""
        : `<p style="margin:12px 0 0;font-size:13px;line-height:1.6;color:rgba(255,255,255,0.45);">
      Não gostou? Você tem 7 dias para pedir reembolso de 100% do valor — é só responder este e-mail.
    </p>`
    }
  </div>
</body></html>`;
}

export async function sendPurchaseEmail(
  to: string,
  plan: PlanId,
  licenseKey: string,
  isRenewal: boolean = false
) {
  const downloadUrl = requireEnv("DOWNLOAD_URL");
  const resend = new Resend(requireEnv("RESEND_API_KEY"));

  const subject = isRenewal
    ? `Sua assinatura do Jarvis ${PLANS[plan].label} foi renovada`
    : `Seu acesso ao Jarvis ${PLANS[plan].label}`;

  const text = [
    `${isRenewal ? "Assinatura renovada" : "Pagamento confirmado"} — Jarvis ${PLANS[plan].label}`,
    "",
    `Sua chave de licenca: ${licenseKey}`,
    "",
    "Como ativar:",
    ...steps(to, isRenewal).map((s, i) => `${i + 1}. ${s}`),
    "",
    `Download: ${downloadUrl}`,
    "",
    cancelText(plan),
    ...(isRenewal
      ? []
      : ["Voce tem 7 dias para pedir reembolso de 100% do valor — e so responder este e-mail."]),
  ].join("\n");

  const { error } = await resend.emails.send({
    from: requireEnv("EMAIL_FROM"),
    to,
    replyTo: REPLY_TO,
    subject,
    html: buildHtml(to, plan, licenseKey, downloadUrl, isRenewal),
    // Alternativa em texto puro: alguns clientes bloqueiam HTML por padrao, e
    // sem isso a pessoa receberia um e-mail em branco no lugar da licenca.
    text,
  });

  // O Resend devolve o erro no corpo em vez de lancar. Sem este check, uma
  // falha de envio passaria batida e o webhook responderia 200 pro Mercado
  // Pago — que entao nunca reenviaria a notificacao, e o cliente ficaria sem
  // a licenca sem ninguem perceber.
  if (error) {
    throw new Error(`Falha ao enviar e-mail de compra: ${error.message}`);
  }
}
