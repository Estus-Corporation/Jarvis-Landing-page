"use client";

import React from "react";
import { motion, useReducedMotion } from "motion/react";

// Numeros ancorados no que o produto realmente tem: 12 capacidades listadas em
// Features, os 5 estados de JarvisState, as 2 formas de ativacao descritas no
// fluxo. Nada de "99,9%" ou "24/7" inventado.
const signals = [
  { value: "12", label: "capacidades nativas" },
  { value: "5", label: "estados do assistente" },
  { value: "2", label: "formas de ativar" },
  { value: "1", label: "voz clonada, a sua" },
];

export default function Signals() {
  const reduce = useReducedMotion();

  return (
    <section className="border-y border-white/[0.07] bg-ink-900 px-6 py-14">
      <div className="mx-auto grid max-w-shell grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4">
        {signals.map((signal, i) => (
          <motion.div
            key={signal.label}
            initial={reduce ? false : { opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{
              duration: 0.5,
              delay: reduce ? 0 : i * 0.07,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="flex flex-col"
          >
            <span className="font-mono text-4xl font-medium tracking-tight text-[#FAFAFA] sm:text-5xl">
              {signal.value}
            </span>
            <span className="mt-2 text-sm text-white/45">{signal.label}</span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
