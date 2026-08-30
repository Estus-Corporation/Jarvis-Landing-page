import type { Metadata } from "next";
import { CheckCircle } from "@phosphor-icons/react/dist/ssr";
import PaymentStatus from "@/components/payment-status";
import OnboardingSteps from "@/components/OnboardingSteps";

export const metadata: Metadata = {
  title: "Pagamento confirmado",
  robots: { index: false, follow: false },
};

export default function ObrigadoPage() {
  return (
    <PaymentStatus
      icon={CheckCircle}
      title="Pagamento confirmado"
      // Nao promete entrega instantanea: o e-mail sai do webhook, que o
      // Mercado Pago dispara em paralelo a este redirecionamento — prometer
      // "ja esta na sua caixa" faria a pessoa achar que deu errado se ela
      // olhar dois segundos depois. Por isso o passo a passo abaixo
      // (OnboardingSteps) tambem NAO mostra a chave/token em si, so explica o
      // que fazer com eles quando chegarem — ver comentario la pro motivo de
      // seguranca (payment_id da URL de retorno nao e assinado).
      description="Em instantes você recebe um e-mail com o link de download, sua chave de licença e seu código de acesso."
      actionLabel="Voltar ao site"
      actionHref="/"
      footnote="Não chegou em alguns minutos? Confira o spam ou responda o e-mail da compra."
    >
      <OnboardingSteps />
    </PaymentStatus>
  );
}
