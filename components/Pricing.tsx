"use client";

import React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

// Preços de exemplo — ajuste os valores e recursos de cada plano livremente.
const plans = [
  {
    name: "Grátis",
    price: "R$ 0",
    period: "para sempre",
    description: "Para experimentar o Jarvis no seu dia a dia.",
    features: [
      "Ativação por voz e atalho global",
      "Controle de navegador e apps",
      "1 palavra de ativação",
      "Histórico de conversas limitado",
    ],
    cta: "Começar grátis",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "R$ 29,90",
    period: "/mês",
    description: "O Jarvis completo, rodando o dia inteiro.",
    features: [
      "Tudo do plano Grátis",
      "Terminal, Git e automações de dev",
      "Integração com Spotify e WhatsApp",
      "Visão de tela e detecção de jogos",
      "Memória persistente ilimitada",
      "Voz clonada — a sua própria voz",
      "Suporte prioritário",
    ],
    cta: "Assinar o Pro",
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
    cta: "Comprar licença vitalícia",
    highlighted: false,
  },
];

export default function Pricing() {
  return (
    <section id="precos" className="relative bg-black px-6 py-28">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-[#333] bg-[rgba(31,31,31,0.62)] px-4 py-1.5 text-xs font-medium tracking-wide text-gray-300">
            Preços
          </span>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Escolha como quer usar o Jarvis.
          </h2>
          <p className="mt-4 text-base font-light text-white/60 sm:text-lg">
            Comece de graça. Faça upgrade quando quiser que ele faça mais por
            você.
          </p>
        </motion.div>

        <div className="mt-16 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.1 }}
              className={cn(
                "relative flex flex-col rounded-2xl border p-8",
                plan.highlighted
                  ? "border-white/30 bg-white/[0.06] lg:-translate-y-3"
                  : "border-white/10 bg-white/[0.02]"
              )}
            >
              {plan.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-black">
                  Mais popular
                </span>
              )}

              <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
              <p className="mt-1 text-sm text-white/50">{plan.description}</p>

              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-bold tracking-tight text-white">
                  {plan.price}
                </span>
                <span className="text-sm text-white/40">{plan.period}</span>
              </div>

              <a href="#top" className="group relative mt-6 block w-full">
                {plan.highlighted && (
                  <div className="pointer-events-none absolute inset-0 -m-2 hidden rounded-full bg-gray-100 opacity-40 blur-lg transition-all duration-300 ease-out group-hover:-m-3 group-hover:opacity-60 group-hover:blur-xl sm:block" />
                )}
                <button
                  className={cn(
                    "relative z-10 w-full rounded-full px-6 py-3 text-sm font-semibold transition-all duration-200",
                    plan.highlighted
                      ? "bg-gradient-to-br from-gray-100 to-gray-300 text-black hover:from-gray-200 hover:to-gray-400"
                      : "border border-[#333] bg-[rgba(31,31,31,0.62)] text-gray-200 hover:border-white/50 hover:text-white"
                  )}
                >
                  {plan.cta}
                </button>
              </a>

              <ul className="mt-8 flex flex-1 flex-col gap-3">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2.5 text-sm text-white/70"
                  >
                    <Check
                      className="mt-0.5 h-4 w-4 shrink-0 text-white/50"
                      strokeWidth={2}
                    />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <p className="mt-10 text-center text-xs text-white/30">
          Preços em reais (BRL). Cancele quando quiser, sem multa.
        </p>
      </div>
    </section>
  );
}
