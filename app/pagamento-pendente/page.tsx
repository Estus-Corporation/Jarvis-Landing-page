import type { Metadata } from "next";
import { Clock } from "@phosphor-icons/react/dist/ssr";
import PaymentStatus from "@/components/payment-status";

export const metadata: Metadata = {
  title: "Pagamento em análise",
  robots: { index: false, follow: false },
};

export default function PagamentoPendentePage() {
  return (
    <PaymentStatus
      icon={Clock}
      title="Pagamento em análise"
      description="Assim que o pagamento for aprovado, enviamos o link de download e a sua chave de licença por e-mail."
      actionLabel="Voltar ao site"
      actionHref="/"
      footnote="Boleto pode levar até 3 dias úteis para compensar. Pix e cartão costumam sair na hora."
    />
  );
}
