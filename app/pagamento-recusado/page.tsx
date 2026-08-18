import type { Metadata } from "next";
import { XCircle } from "@phosphor-icons/react/dist/ssr";
import PaymentStatus from "@/components/payment-status";

export const metadata: Metadata = {
  title: "Pagamento não concluído",
  robots: { index: false, follow: false },
};

export default function PagamentoRecusadoPage() {
  return (
    <PaymentStatus
      icon={XCircle}
      title="Pagamento não concluído"
      description="Nada foi cobrado. Você pode tentar de novo com outro cartão ou pagar via Pix."
      actionLabel="Escolher plano de novo"
      actionHref="/#precos"
      footnote="O motivo mais comum é limite ou dados do cartão. Pix costuma passar na hora."
    />
  );
}
