"use client";

import React from "react";
import { motion, useReducedMotion } from "motion/react";
import { LockKey, HardDrives, Brain, Waveform } from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";
import { JarvisOrb } from "@/components/ui/jarvis-sphere";

const points: { icon: Icon; title: string; line: string }[] = [
  {
    icon: Waveform,
    title: "Treinada na sua voz",
    line: "A síntese usa uma amostra da sua própria fala, não uma voz genérica de catálogo.",
  },
  {
    icon: HardDrives,
    title: "Roda no seu Windows",
    line: "O assistente vive na sua máquina, junto dos programas que ele controla.",
  },
  {
    icon: LockKey,
    title: "Privacidade por padrão",
    line: "Suas chaves de API ficam criptografadas em AES-256, no seu computador.",
  },
  {
    icon: Brain,
    title: "Memória persistente",
    line: "Lembra de você entre sessões, em banco local — nada sai da sua máquina.",
  },
];

export default function Voice() {
  const reduce = useReducedMotion();

  return (
    <section className="relative overflow-hidden bg-ink-950 px-6 py-28 sm:py-40">
      <div className="mx-auto max-w-shell">
        <div className="grid items-center gap-16 lg:grid-cols-[1fr_auto] lg:gap-10">
          <div>
            <motion.h2
              initial={reduce ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-[14ch] text-balance text-4xl font-semibold leading-[1.08] tracking-[-0.03em] text-[#FAFAFA] sm:text-6xl lg:text-7xl"
            >
              A resposta vem na sua voz.
            </motion.h2>

            <div className="mt-14 grid gap-x-10 gap-y-10 sm:grid-cols-2">
              {points.map((point, i) => {
                const Glyph = point.icon;
                return (
                  <motion.div
                    key={point.title}
                    initial={reduce ? false : { opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{
                      duration: 0.55,
                      delay: reduce ? 0 : i * 0.08,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="border-t border-white/[0.1] pt-6"
                  >
                    <Glyph
                      size={22}
                      weight="light"
                      className="text-white/70"
                      aria-hidden
                    />
                    <h3 className="mt-4 text-base font-medium text-[#FAFAFA]">
                      {point.title}
                    </h3>
                    <p className="mt-2 max-w-[34ch] text-sm leading-relaxed text-white/45">
                      {point.line}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <motion.div
            initial={reduce ? false : { opacity: 0, scale: 0.92 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="hidden justify-center lg:flex"
          >
            <JarvisOrb state="speaking" sphereSize={300} paused />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
