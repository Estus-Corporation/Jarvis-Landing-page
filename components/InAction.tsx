"use client";

import React, { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import VoicePipeline from "@/components/ui/voice-pipeline";

// Cada passo do texto avanca o painel da direita, que mostra o mesmo pedido
// atravessando o produto: fala captada, intencao resolvida, acao executada,
// resposta falada. A animacao narra o fluxo, nao decora a secao.
const steps = [
  {
    title: "Ative",
    line: 'Diga "Jarvis" ou pressione o atalho global. Não precisa decorar comandos: fale como falaria com uma pessoa.',
  },
  {
    title: "Ele interpreta",
    line: "O pedido vira intenção. O Jarvis decide sozinho quais ferramentas aquilo exige, e quantas.",
  },
  {
    title: "Ele executa",
    line: "Aciona o navegador, o terminal, seus programas, o Spotify, o WhatsApp ou a memória.",
  },
  {
    title: "Ele responde",
    line: "A resposta chega falada, na sua própria voz clonada. Curta e sem enrolação.",
  },
];

export default function InAction() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);

  return (
    <section
      id="como-funciona"
      className="relative bg-ink-900 px-6 py-24 sm:py-32"
    >
      {/* Ancora preservada: "Demonstração" no menu e no rodape aponta para #demo,
          que antes era uma secao propria. */}
      <span id="demo" className="absolute -top-24" aria-hidden />

      <div className="mx-auto max-w-shell">
        <motion.h2
          initial={reduce ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-[20ch] text-3xl font-semibold tracking-[-0.02em] text-[#FAFAFA] sm:text-5xl"
        >
          Da sua voz até a ação, em segundos.
        </motion.h2>

        <div className="mt-14 grid gap-10 lg:mt-20 lg:grid-cols-[1fr_1fr] lg:gap-20">
          <ol className="order-2 lg:order-1">
            {steps.map((step, i) => (
              <motion.li
                key={step.title}
                onViewportEnter={() => setActive(i)}
                viewport={{ amount: 0.7, margin: "-20% 0px -20% 0px" }}
                className="flex min-h-[44vh] flex-col justify-center border-t border-white/[0.07] py-10 first:border-t-0 lg:min-h-[58vh]"
              >
                <motion.div
                  animate={reduce ? {} : { opacity: active === i ? 1 : 0.3 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="flex items-center gap-3">
                    {/* Trilha de progresso: marca onde a pessoa esta nos 4 passos. */}
                    <span className="h-px w-8 bg-white/25" />
                    <h3 className="text-2xl font-medium tracking-[-0.01em] text-[#FAFAFA] sm:text-3xl">
                      {step.title}
                    </h3>
                  </div>
                  <p className="mt-4 max-w-[46ch] pl-11 text-base leading-relaxed text-white/55 sm:text-lg">
                    {step.line}
                  </p>
                </motion.div>
              </motion.li>
            ))}
          </ol>

          <div className="order-1 lg:order-2">
            <div className="sticky top-24 lg:top-1/2 lg:-translate-y-1/2">
              <VoicePipeline step={active} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
