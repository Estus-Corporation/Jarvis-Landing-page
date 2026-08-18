import Link from "next/link";
import type { Icon } from "@phosphor-icons/react";

// Moldura compartilhada das tres telas de retorno do Mercado Pago
// (aprovado/pendente/recusado). Elas so diferem em icone, texto e no destino
// do botao — a estrutura e o mesmo cartao centralizado do sistema visual do
// site (ink-800, borda branca a 10%, raio de 20px).
export default function PaymentStatus({
  icon: StatusIcon,
  title,
  description,
  actionLabel,
  actionHref,
  footnote,
}: {
  icon: Icon;
  title: string;
  description: string;
  actionLabel: string;
  actionHref: string;
  footnote?: string;
}) {
  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-ink-950 px-6 py-16">
      <div className="w-full max-w-md rounded-card border border-white/10 bg-ink-800 p-8 text-center sm:p-10">
        <StatusIcon
          size={44}
          weight="light"
          className="mx-auto text-white/70"
          aria-hidden
        />
        <h1 className="mt-6 text-2xl font-semibold tracking-tight text-[#FAFAFA]">
          {title}
        </h1>
        <p className="mt-3 text-base leading-relaxed text-white/55">
          {description}
        </p>

        <Link
          href={actionHref}
          className="mt-8 block rounded-full bg-[#FAFAFA] px-6 py-3.5 text-base font-semibold text-ink-950 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:scale-[1.02] hover:bg-white active:translate-y-0 active:scale-[0.98]"
        >
          {actionLabel}
        </Link>

        {footnote && (
          <p className="mt-5 text-xs leading-relaxed text-white/40">{footnote}</p>
        )}
      </div>
    </main>
  );
}
