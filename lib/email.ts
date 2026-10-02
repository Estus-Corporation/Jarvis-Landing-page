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
//
// Cada passo e { title, body }: o title vai em negrito (no texto puro vira
// "Title:"), pra quem so passa o olho achar o verbo de cada passo.
function steps(email: string, isRenewal: boolean) {
  if (isRenewal) {
    return [
      {
        title: "Nada a fazer",
        body: "se o Jarvis já está ativo no seu computador. O saldo do mês já foi renovado.",
      },
      {
        title: "Licença vencida?",
        body: "Cole a chave acima em Configurações → Licença.",
      },
    ];
  }
  return [
    { title: "Baixe e instale", body: "o Jarvis pelo botão abaixo." },
    {
      title: "Entre com este e-mail",
      body: `(${email}). Você recebe um código de 6 dígitos para confirmar.`,
    },
    {
      title: "Cole a chave",
      body: "acima, depois de entrar no app: abra Configurações → Licença (ou use a tela de assinatura, se ela aparecer).",
    },
    { title: "Pronto.", body: "Diga \"Jarvis\" e peça o que precisar." },
  ];
}

function cancelText(plan: PlanId) {
  return plan === "mensal"
    ? "Sua assinatura renova sozinha todo mês, e a cada renovação você recebe um e-mail como este. Para cancelar, use Mercado Pago → Assinaturas ou responda este e-mail."
    : "Seu acesso vale 12 meses e não renova sozinho.";
}

const REFUND_TEXT =
  "Não gostou? Você tem 7 dias para pedir reembolso de 100% do valor. É só responder este e-mail.";

// Logo servido pela propria landing (public/email/jarvis-sphere.png). URL
// absoluta porque o e-mail abre fora do site; data: URI o Gmail bloqueia.
const SITE_URL = "https://www.primejarvis.com.br";
const LOGO_URL = `${SITE_URL}/email/jarvis-sphere.png`;

// Fundo claro, card branco, esfera no topo. Mesmo layout do e-mail de codigo
// (Jarvis-Credits-Server/src/email.ts). Tabelas e estilo inline porque o
// Outlook ignora flex/margin auto e nenhum cliente carrega CSS externo.
export function buildHtml(
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
  const stepRows = steps(escapeHtml(to), isRenewal)
    .map(
      (s, i) => `<tr>
          <td valign="top" width="40" style="padding:0 0 16px;">
            <div style="width:28px;height:28px;line-height:28px;border-radius:999px;background:#18181B;color:#FFFFFF;font-size:14px;font-weight:600;text-align:center;">${i + 1}</div>
          </td>
          <td valign="top" style="padding:3px 0 16px;font-size:15px;line-height:1.55;color:#3F3F46;">
            <strong style="color:#18181B;">${s.title}</strong> ${s.body}
          </td>
        </tr>`
    )
    .join("");
  const footnotes = [cancelText(plan), ...(isRenewal ? [] : [REFUND_TEXT])]
    .map(
      (t) =>
        `<p style="margin:12px 0 0;font-size:13px;line-height:1.6;color:#71717A;">${t}</p>`
    )
    .join("");

  return `<!doctype html>
<html lang="pt-BR"><body style="margin:0;padding:0;background:#F4F4F5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F4F4F5;">
  <tr><td align="center" style="padding:40px 16px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#FFFFFF;border:1px solid #E4E4E7;border-radius:20px;">
      <tr><td align="center" style="padding:36px 32px 8px;">
        <img src="${LOGO_URL}" width="48" height="48" alt="Jarvis" style="display:block;border:0;width:48px;height:48px;">
        <p style="margin:12px 0 0;font-size:12px;font-weight:600;letter-spacing:0.4em;color:#18181B;">JARVIS</p>
      </td></tr>
      <tr><td style="padding:24px 32px 32px;">
        <h1 style="margin:0 0 8px;font-size:22px;font-weight:600;color:#18181B;text-align:center;">${heading}</h1>
        <p style="margin:0 0 28px;font-size:15px;line-height:1.6;color:#52525B;text-align:center;">${intro}</p>

        <p style="margin:0 0 8px;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:#71717A;">Sua chave de licença</p>
        <p style="margin:0 0 28px;padding:14px 16px;background:#F4F4F5;border:1px solid #E4E4E7;border-radius:12px;font-family:ui-monospace,'SF Mono',Menlo,Consolas,monospace;font-size:14px;color:#18181B;word-break:break-all;">${licenseKey}</p>

        <p style="margin:0 0 16px;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:#71717A;">Como ativar</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        ${stepRows}
        </table>

        <a href="${downloadUrl}" style="display:block;margin:8px 0 0;padding:15px 24px;background:#18181B;border-radius:999px;font-size:15px;font-weight:600;color:#FFFFFF;text-align:center;text-decoration:none;">Baixar o Jarvis para Windows</a>

        <div style="margin:28px 0 0;padding:4px 0 0;border-top:1px solid #E4E4E7;">${footnotes}</div>
      </td></tr>
    </table>
    <p style="margin:20px 0 0;font-size:12px;color:#A1A1AA;">Estus Corporation · <a href="${SITE_URL}" style="color:#A1A1AA;">primejarvis.com.br</a></p>
  </td></tr>
</table>
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
    `${isRenewal ? "Assinatura renovada" : "Pagamento confirmado"}: Jarvis ${PLANS[plan].label}`,
    "",
    `Sua chave de licença: ${licenseKey}`,
    "",
    "Como ativar:",
    ...steps(to, isRenewal).map((s, i) => `${i + 1}. ${s.title} ${s.body}`),
    "",
    `Download: ${downloadUrl}`,
    "",
    cancelText(plan),
    ...(isRenewal ? [] : [REFUND_TEXT]),
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
