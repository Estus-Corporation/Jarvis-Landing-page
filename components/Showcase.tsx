"use client";

import React from "react";
import { motion, useReducedMotion } from "motion/react";

// Prova visual: a dashboard real do app, emoldurada como uma janela, mais um
// plano cinematografico do produto rodando na mesa. Widgets reais listados ao
// lado para ancorar a imagem no que a pessoa vai realmente ver.
const widgets = [
  "Clima e relógio",
  "Spotify com capa do álbum",
  "Timer e pomodoro",
  "Jogo em execução",
  "Tarefas, agenda e lembretes",
  "Chat de texto com imagens",
];

export default function Showcase() {
  const reduce = useReducedMotion();

  return (
    <section className="relative overflow-hidden bg-ink-900 px-6 py-28 sm:py-36">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[900px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-white/[0.04] blur-[130px]" />

      <div className="relative mx-auto max-w-shell">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-2xl"
        >
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-white/35">
            A central de comando
          </span>
          <h2 className="mt-4 text-balance text-3xl font-semibold tracking-[-0.02em] text-[#FAFAFA] sm:text-5xl">
            Uma dashboard viva na sua tela.
          </h2>
          <p className="mt-5 max-w-[52ch] text-lg font-light leading-relaxed text-white/55">
            Esfera geodésica que reage à conversa, widgets que você arrasta e
            reorganiza, e um tema de cores que responde ao seu gosto.
          </p>
        </motion.div>

        {/* Janela emoldurada com a captura real do app. */}
        <motion.figure
          initial={reduce ? false : { opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mt-14 overflow-hidden rounded-card border border-white/10 bg-ink-950 shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)]"
        >
          <div className="flex items-center gap-2 border-b border-white/[0.07] px-5 py-3.5">
            <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
            <span className="ml-3 font-mono text-xs tracking-[0.15em] text-white/30">
              JARVIS — v0.6.1
            </span>
          </div>
          <img
            src="/images/jarvis-dashboard.png"
            alt="Interface do Jarvis: esfera de rede geodésica no centro, widgets de tarefas, clima, relógio e Spotify ao redor."
            width={1918}
            height={1062}
            className="block w-full"
          />
        </motion.figure>

        {/* Segunda linha: cena de contexto + lista de widgets. */}
        <div className="mt-4 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <motion.figure
            initial={reduce ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden rounded-card border border-white/10"
          >
            <img
              src="/images/jarvis-desk.png"
              alt="Monitor exibindo o Jarvis em uma mesa escura à noite."
              width={1280}
              height={720}
              className="block h-full w-full object-cover"
            />
          </motion.figure>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col justify-center rounded-card border border-white/[0.08] bg-ink-950 p-8 sm:p-10"
          >
            <h3 className="text-sm font-medium text-white/50">
              Widgets que vêm de fábrica
            </h3>
            <ul className="mt-6 flex flex-col gap-3.5">
              {widgets.map((w) => (
                <li
                  key={w}
                  className="flex items-center gap-3 text-sm text-white/70"
                >
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-white/50" />
                  {w}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
