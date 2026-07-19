"use client";

import React from "react";
import { motion, useReducedMotion } from "motion/react";
import { Check } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/utils";

// Valores de exemplo. Ajuste preco, periodo e itens de cada plano livremente.
const plans = [
  {
    name: "Grátis",
    price: "R$ 0",
    period: "para sempre",
    description: "Para experimentar o Jarvis no seu dia a dia.",
    features: [
      "Ativação por voz e atalho global",
      "Controle de navegador e programas",
      "1 palavra de ativação",
      "Histórico de conversas limitado",
    ],
    cta: "Começar agora",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "R$ 29,90",
    period: "por mês",
    description: "O Jarvis completo, rodando o dia inteiro.",
    features: [
      "Tudo do plano Grátis",
      "Terminal, Git e automações de dev",
      "Integração com Spotify e WhatsApp",
      "Visão de tela e detecção de jogos",
      "Memória persistente ilimitada",
      "Voz clonada, a sua própria voz",
      "Suporte prioritário",
    ],
    cta: "Começar agora",
    highlighted: true,
  },
  {
    name: "Vitalício",
    price: "R$ 497",
    period: "pagamento único",
    description: "Pague uma vez, use para sempre.",
    features: [
      "Tudo do plano Pro",
      "Atualizações vitalícias incluídas",
      "Acesso antecipado a novos recursos",
      "Licença válida para 2 dispositivos",
    ],
    cta: "Começar agora",
    highlighted: false,
  },
];

export default function Pricing() {
  const reduce = useReducedMotion();

  return (
    <section id="precos" className="bg-ink-900 px-6 py-28 sm:py-36">
      <div className="mx-auto max-w-shell">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-2xl"
        >
          <h2 className="text-3xl font-semibold tracking-[-0.02em] text-[#FAFAFA] sm:text-5xl">
            Escolha como quer usar.
          </h2>
          <p className="mt-5 text-lg font-light leading-relaxed text-white/55">
            Comece de graça. Suba de plano quando quiser que ele faça mais.
          </p>
        </motion.div>

        {/* Grid assimetrico: o plano recomendado ocupa mais largura, em vez de
            tres colunas identicas empurradas no eixo Y. */}
        <div className="mt-16 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.18fr_1fr]">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={reduce ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: 0.6,
                delay: reduce ? 0 : i * 0.08,
                ease: [0.16, 1, 0.3, 1],
              }}
              className={cn(
                "flex flex-col rounded-card border p-8 sm:p-10",
                plan.highlighted
                  ? "border-white/20 bg-ink-800"
                  : "border-white/[0.08] bg-ink-950"
              )}
            >
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="text-lg font-medium text-[#FAFAFA]">
                  {plan.name}
                </h3>
                {plan.highlighted && (
                  <span className="rounded-chip bg-[#FAFAFA] px-2.5 py-1 text-xs font-semibold text-ink-950">
                    Recomendado
                  </span>
                )}
              </div>

              <p className="mt-2 text-sm text-white/45">{plan.description}</p>

              <div className="mt-8 flex items-baseline gap-2">
                <span className="font-mono text-4xl font-medium tracking-tight text-[#FAFAFA] sm:text-5xl">
                  {plan.price}
                </span>
                <span className="text-sm text-white/40">{plan.period}</span>
              </div>

              <a
                href="#top"
                className={cn(
                  "mt-8 block w-full rounded-full px-6 py-3.5 text-center text-sm font-semibold transition-all duration-200 active:scale-[0.98]",
                  plan.highlighted
                    ? "bg-[#FAFAFA] text-ink-950 hover:bg-white"
                    : "border border-white/15 text-white/80 hover:border-white/40 hover:text-white"
                )}
              >
                {plan.cta}
              </a>

              <ul className="mt-9 flex flex-1 flex-col gap-3.5">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2.5 text-sm text-white/65"
                  >
                    <Check
                      size={15}
                      weight="bold"
                      className="mt-1 shrink-0 text-white/40"
                      aria-hidden
                    />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <p className="mt-10 text-sm text-white/30">
          Preços em reais. Cancele quando quiser, sem multa.
        </p>
      </div>
    </section>
  );
}
