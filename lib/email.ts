import { Resend } from "resend";
import { requireEnv } from "@/lib/env";
import { PLANS, type PlanId } from "@/lib/plans";

// Estilo inline e tabela-menos-possivel: cliente de e-mail nao carrega CSS
// externo nem entende a maior parte de flex/grid. O visual segue o site
// (fundo escuro, texto claro, chave em monoespacada) sem depender de nada
// que o Gmail/Outlook possa jogar fora.
function buildHtml(plan: PlanId, licenseKey: string, downloadUrl: string) {
  const label = PLANS[plan].label;
  const renewal =
    plan === "mensal"
      ? "Sua assinatura renova sozinha todo mês. Para cancelar, é só responder este e-mail."
      : "Seu acesso vale 12 meses e não renova sozinho — avisaremos antes de vencer.";

  return `<!doctype html>
<html lang="pt-BR"><body style="margin:0;padding:32px 16px;background:#0A0A0B;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:520px;margin:0 auto;background:#141417;border:1px solid rgba(255,255,255,0.1);border-radius:20px;padding:32px;">
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:600;color:#FAFAFA;">Pagamento confirmado</h1>
    <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:rgba(255,255,255,0.6);">
      Obrigado por assinar o Jarvis ${label}. Abaixo está tudo que você precisa para começar.
    </p>

    <p style="margin:0 0 8px;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;color:rgba(255,255,255,0.4);">Sua chave de licença</p>
    <p style="margin:0 0 24px;padding:14px 16px;background:#0E0E10;border:1px solid rgba(255,255,255,0.1);border-radius:10px;font-family:ui-monospace,'SF Mono',Menlo,monospace;font-size:16px;color:#FAFAFA;word-break:break-all;">
      ${licenseKey}
    </p>

    <a href="${downloadUrl}" style="display:block;padding:14px 24px;background:#FAFAFA;border-radius:999px;font-size:15px;font-weight:600;color:#0A0A0B;text-align:center;text-decoration:none;">
      Baixar o Jarvis para Windows
    </a>

    <p style="margin:24px 0 0;font-size:13px;line-height:1.6;color:rgba(255,255,255,0.45);">
      ${renewal}
    </p>
    <p style="margin:12px 0 0;font-size:13px;line-height:1.6;color:rgba(255,255,255,0.45);">
      Não gostou? Você tem 7 dias para pedir reembolso de 100% do valor.
    </p>
  </div>
</body></html>`;
}

export async function sendPurchaseEmail(
  to: string,
  plan: PlanId,
  licenseKey: string
) {
  const downloadUrl = requireEnv("DOWNLOAD_URL");
  const resend = new Resend(requireEnv("RESEND_API_KEY"));

  const { error } = await resend.emails.send({
    from: requireEnv("EMAIL_FROM"),
    to,
    subject: `Seu acesso ao Jarvis ${PLANS[plan].label}`,
    html: buildHtml(plan, licenseKey, downloadUrl),
    // Alternativa em texto puro: alguns clientes bloqueiam HTML por padrao, e
    // sem isso a pessoa receberia um e-mail em branco no lugar da licenca.
    text: [
      `Pagamento confirmado — Jarvis ${PLANS[plan].label}`,
      ``,
      `Sua chave de licenca: ${licenseKey}`,
      `Download: ${downloadUrl}`,
      ``,
      `Voce tem 7 dias para pedir reembolso de 100% do valor.`,
    ].join("\n"),
  });

  // O Resend devolve o erro no corpo em vez de lancar. Sem este check, uma
  // falha de envio passaria batida e o webhook responderia 200 pro Mercado
  // Pago — que entao nunca reenviaria a notificacao, e o cliente ficaria sem
  // a licenca sem ninguem perceber.
  if (error) {
    throw new Error(`Falha ao enviar e-mail de compra: ${error.message}`);
  }
}
