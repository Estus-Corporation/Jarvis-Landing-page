"use client";

import React from "react";
import { motion, useReducedMotion } from "motion/react";

// Fechamento da pagina. Um CTA so, com o mesmo rotulo usado no header, no hero
// e nos planos: uma intencao, um texto, em todo lugar.
export default function CallToAction() {
  const reduce = useReducedMotion();

  return (
    <section className="relative overflow-hidden border-t border-white/[0.08] bg-ink-900 px-6 py-28 sm:py-36">
      <div className="pointer-events-none absolute left-1/2 top-full h-[520px] w-[820px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.05] blur-[120px]" />

      <motion.div
        initial={reduce ? false : { opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative mx-auto flex max-w-2xl flex-col items-center text-center"
      >
        <h2 className="text-3xl font-semibold leading-[1.1] tracking-[-0.025em] text-[#FAFAFA] sm:text-5xl">
          Pare de procurar o ícone.
        </h2>
        <p className="mt-5 max-w-[42ch] text-lg font-light leading-relaxed text-white/55">
          Instale, escolha sua palavra de ativação e comece a falar.
        </p>
        <a
          href="#precos"
          className="mt-10 rounded-full bg-[#FAFAFA] px-8 py-4 text-sm font-semibold text-ink-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_10px_30px_-12px_rgba(255,255,255,0.35)] transition-colors duration-200 hover:bg-white active:scale-[0.98]"
        >
          Começar agora
        </a>
      </motion.div>
    </section>
  );
}
