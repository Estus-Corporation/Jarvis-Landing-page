import type { Metadata } from "next";
import { CheckCircle } from "@phosphor-icons/react/dist/ssr";
import PaymentStatus from "@/components/payment-status";

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
      // olhar dois segundos depois.
      description="Em instantes você recebe um e-mail com o link de download e a sua chave de licença."
      actionLabel="Voltar ao site"
      actionHref="/"
      footnote="Não chegou em alguns minutos? Confira o spam ou responda o e-mail da compra."
    />
  );
}
