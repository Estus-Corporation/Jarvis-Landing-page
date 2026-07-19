"use client";

import React from "react";
import { motion, useReducedMotion } from "motion/react";

const points = [
  {
    title: "Treinada na sua voz",
    line: "A síntese usa uma amostra da sua própria fala, não uma voz genérica de catálogo.",
  },
  {
    title: "Sem gap entre frases",
    line: "A fala sai contínua, sem aquela pausa robótica entre uma sentença e a outra.",
  },
  {
    title: "Roda no seu Windows",
    line: "O assistente vive na sua máquina, junto dos programas que ele controla.",
  },
];

export default function Voice() {
  const reduce = useReducedMotion();

  return (
    <section className="bg-ink-950 px-6 py-28 sm:py-40">
      <div className="mx-auto max-w-shell">
        <motion.h2
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-[16ch] text-4xl font-semibold leading-[1.08] tracking-[-0.03em] text-[#FAFAFA] sm:text-6xl lg:text-7xl"
        >
          A resposta vem na sua voz.
        </motion.h2>

        <div className="mt-16 grid gap-px sm:mt-24 sm:grid-cols-3">
          {points.map((point, i) => (
            <motion.div
              key={point.title}
              initial={reduce ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{
                duration: 0.55,
                delay: reduce ? 0 : i * 0.09,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="border-t border-white/[0.1] pt-7 sm:pr-10"
            >
              <h3 className="text-base font-medium text-[#FAFAFA]">
                {point.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-white/45">
                {point.line}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
