import {
  EnvelopeSimple,
  DownloadSimple,
  Key,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";

// Passo a passo visual de "como configurar no app", só na tela /obrigado.
// Deliberadamente NÃO mostra a chave de licença nem o código de acesso aqui —
// o redirect do Mercado Pago pra esta página carrega um payment_id na URL sem
// assinatura nenhuma, então qualquer segredo mostrado nesta tela poderia
// vazar pra quem adivinhar/enumerar o payment_id de outra pessoa. O e-mail
// continua sendo o único canal que entrega os segredos de verdade (ver
// lib/email.ts) — isto aqui só explica o que fazer com eles.
const steps: { icon: Icon; title: string; description: string }[] = [
  {
    icon: EnvelopeSimple,
    title: "Confira seu e-mail",
    description:
      "Enviamos o link de download, sua chave de licença e seu código de acesso.",
  },
  {
    icon: DownloadSimple,
    title: "Baixe e instale o Jarvis",
    description: "O link do e-mail leva direto ao instalador para Windows.",
  },
  {
    icon: Key,
    title: "Cole as duas chaves na primeira tela",
    description:
      "A chave de licença ativa o app. O código de acesso libera o uso sem precisar criar contas na OpenAI/ElevenLabs.",
  },
];

export default function OnboardingSteps() {
  return (
    <div className="w-full max-w-md rounded-card border border-white/10 bg-ink-900 p-6 sm:p-7">
      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-white/40">
        Como configurar
      </p>
      <ol className="mt-4 flex flex-col gap-4">
        {steps.map((step, i) => (
          <li key={step.title} className="flex items-start gap-3.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-ink-950">
              <step.icon size={16} weight="light" className="text-white/60" aria-hidden />
            </span>
            <div className="pt-1">
              <p className="text-sm font-medium text-[#FAFAFA]">
                <span className="mr-1.5 text-white/35">{i + 1}.</span>
                {step.title}
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-white/50">
                {step.description}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
