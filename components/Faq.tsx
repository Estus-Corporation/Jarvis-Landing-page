"use client";

import React from "react";
import { motion, useReducedMotion } from "motion/react";
import { Plus } from "@phosphor-icons/react/dist/ssr";
import { faqs } from "@/lib/faqs";

export default function Faq() {
  const reduce = useReducedMotion();

  return (
    <section className="bg-ink-950 px-6 py-28 sm:py-36">
      <div className="mx-auto max-w-shell">
        <motion.h2
          initial={reduce ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-[18ch] text-3xl font-semibold tracking-[-0.02em] text-[#FAFAFA] sm:text-5xl"
        >
          Perguntas que sempre chegam.
        </motion.h2>

        {/* <details> nativo: abre sem JavaScript, ja vem com semantica de
            disclosure e navegacao por teclado de graca. */}
        <div className="mt-14 max-w-3xl">
          {faqs.map((faq, i) => (
            <motion.div
              key={faq.q}
              initial={reduce ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{
                duration: 0.5,
                delay: reduce ? 0 : i * 0.05,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <details className="group border-t border-white/[0.09] last:border-b">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 text-left [&::-webkit-details-marker]:hidden">
                  <h3 className="text-base font-medium text-[#FAFAFA] sm:text-lg">
                    {faq.q}
                  </h3>
                  <Plus
                    size={18}
                    weight="light"
                    className="shrink-0 text-white/40 transition-transform duration-300 group-open:rotate-45"
                    aria-hidden
                  />
                </summary>
                <p className="max-w-[62ch] pb-7 text-sm leading-relaxed text-white/55 sm:text-base">
                  {faq.a}
                </p>
              </details>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
