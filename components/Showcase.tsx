"use client";

import React from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { useReducedMotionSafe } from "@/components/ui/use-reduced-motion-safe";
import {
  CloudSun,
  MusicNotes,
  Timer,
  GameController,
  ListChecks,
  ChatCircleText,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";
import SectionEyebrow from "@/components/ui/section-eyebrow";

// SECAO RECONSTRUIDA DO ZERO — antes era um scroll-expand que crescia a
// imagem enquanto a pagina rolava (sequestrava a rolagem visualmente) + uma
// grade de cartoes de widgets embaixo.
//
// Ideia nova: uma VITRINE ANOTADA, no espirito de pagina de produto premium.
// A dashboard aparece dentro de uma janela de app de verdade (barra de
// titulo, cantos de mira HUD, brilho embaixo). Em telas grandes, callouts
// flutuam nas laterais e se ligam a imagem por fios finos de luz — cada um
// aponta um recurso da tela. Em telas menores os callouts viram uma grade
// embaixo. Sem sequestrar scroll, sem imagem gigante crescendo: um "hero
// shot" do produto com anotacoes, que e o formato que mais vende software.

type Widget = { icon: Icon; title: string; note: string };

// 3 a esquerda, 3 a direita: a ordem aqui e a ordem visual de cima pra baixo
// em cada lado.
const leftWidgets: Widget[] = [
  { icon: CloudSun, title: "Clima e relógio", note: "Previsão e hora local sempre à vista." },
  { icon: MusicNotes, title: "Spotify", note: "Faixa atual com a capa do álbum." },
  { icon: Timer, title: "Timer e pomodoro", note: "Ciclos de foco controlados por voz." },
];

const rightWidgets: Widget[] = [
  { icon: GameController, title: "Jogo em execução", note: "Ele reconhece o que você está jogando." },
  { icon: ListChecks, title: "Tarefas e agenda", note: "Lembretes e compromissos do dia." },
  { icon: ChatCircleText, title: "Chat com imagens", note: "Conversa por texto quando falar não dá." },
];

const allWidgets = [...leftWidgets, ...rightWidgets];

function Callout({
  widget,
  side,
  delay,
}: {
  widget: Widget;
  side: "left" | "right";
  delay: number;
}) {
  const reduce = useReducedMotionSafe();
  const Glyph = widget.icon;
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, x: side === "left" ? -20 : 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.6, delay: reduce ? 0 : delay, ease: [0.16, 1, 0.3, 1] }}
      className={`glow-ring group relative flex items-start gap-4 rounded-card border border-white/[0.1] bg-ink-800/70 p-5 backdrop-blur-sm transition-colors duration-300 hover:border-white/25 sm:p-6 ${
        side === "left" ? "text-left" : "flex-row-reverse text-right"
      }`}
    >
      {/* Fio de luz saindo em direcao a imagem (so no lado que aponta pra
          dentro). Fica na borda interna do callout. */}
      <span
        aria-hidden
        className={`absolute top-1/2 hidden h-px w-8 -translate-y-1/2 lg:block ${
          side === "left"
            ? "left-full bg-gradient-to-r from-white/40 to-transparent"
            : "right-full bg-gradient-to-l from-white/40 to-transparent"
        }`}
      />
      <span
        aria-hidden
        className={`absolute top-1/2 hidden h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-white/70 shadow-[0_0_6px_1px_rgba(255,255,255,0.5)] lg:block ${
          side === "left" ? "left-full ml-8" : "right-full mr-8"
        }`}
      />

      <span
        aria-hidden
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-chip border border-white/[0.12] bg-white/[0.04] text-white/65 transition-colors duration-300 group-hover:text-white"
      >
        <Glyph size={22} weight="light" />
      </span>
      <span className="min-w-0">
        <span className="block font-display text-base font-semibold text-[#FAFAFA] sm:text-lg">
          {widget.title}
        </span>
        <span className="mt-1 block text-sm leading-relaxed text-white/50">
          {widget.note}
        </span>
      </span>
    </motion.div>
  );
}

export default function Showcase() {
  const reduce = useReducedMotionSafe();

  return (
    <section
      id="interface"
      className="relative overflow-hidden border-t border-white/[0.07] bg-ink-900 px-6 pb-28 pt-20 sm:pb-36 sm:pt-28 lg:px-10 wide:px-16"
    >
      {/* fundo: grade + halo, costurando com Integracoes */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute left-1/2 top-1/3 h-[460px] w-[720px] -translate-x-1/2 rounded-full bg-white/[0.05] blur-[150px]" />
      </div>

      <div className="relative mx-auto max-w-6xl wide:max-w-shell">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto max-w-2xl text-center"
        >
          <SectionEyebrow>Interface</SectionEyebrow>
          <h2 className="mt-5 text-balance font-display text-3xl font-semibold tracking-[-0.02em] text-[#FAFAFA] sm:text-5xl">
            Uma dashboard viva na sua tela.
          </h2>
          <p className="mx-auto mt-5 max-w-[54ch] text-lg font-light leading-relaxed text-white/55">
            A esfera reage à conversa no centro. Em volta, widgets que você
            arrasta, reorganiza e tinge com o seu tema de cor.
          </p>
        </motion.div>

        {/* Palco: 3 colunas em lg (callouts | janela | callouts). A janela e a
            coluna dominante (a dashboard e o heroi da secao); os callouts
            ocupam faixas mais estreitas dos lados. */}
        <div className="mt-16 grid grid-cols-1 items-center gap-6 lg:grid-cols-[0.8fr_1.75fr_0.8fr] lg:gap-8">
          {/* callouts esquerda (lg) */}
          <div className="hidden flex-col gap-4 lg:flex">
            {leftWidgets.map((w, i) => (
              <Callout key={w.title} widget={w} side="left" delay={0.15 + i * 0.1} />
            ))}
          </div>

          {/* janela do app */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 24, scale: 0.97 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            // glow-ring SEM --active: ver comentario equivalente em
            // Features.tsx — o anel girando repinta a cada frame pra
            // sempre (nao e compositor-only), caro demais pra deixar ligado
            // sem interacao numa janela grande e sempre visivel.
            className="glow-ring relative mx-auto w-full max-w-[640px] overflow-hidden rounded-card border border-white/[0.12] bg-ink-950 shadow-[0_50px_140px_-40px_rgba(0,0,0,0.9)] lg:max-w-none"
          >
            {/* barra de titulo */}
            <div className="flex items-center gap-3 border-b border-white/[0.08] bg-ink-900/80 px-4 py-3">
              <span className="flex gap-1.5" aria-hidden>
                <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
              </span>
              <span className="ml-1 font-display text-xs font-semibold uppercase tracking-[0.15em] text-white/45">
                Jarvis
              </span>
              <span className="ml-auto flex items-center gap-2 text-xs text-white/40">
                <span className="led-dot" aria-hidden />
                ao vivo
              </span>
            </div>

            {/* a imagem */}
            <div className="relative aspect-[16/10] w-full">
              <Image
                src="/images/jarvis-dashboard.webp"
                alt="Interface do Jarvis: esfera de rede geodésica no centro, com widgets de tarefas, clima, relógio e Spotify ao redor."
                fill
                sizes="(max-width: 1024px) 100vw, 720px"
                quality={90}
                className="object-cover object-top"
                draggable={false}
              />
              {/* realce especular no topo */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"
              />
              {/* cantos de mira HUD */}
              {(
                ["left-3 top-3", "right-3 top-3", "left-3 bottom-3", "right-3 bottom-3"] as const
              ).map((pos) => {
                const [x, y] = pos.split(" ");
                return (
                  <span
                    key={pos}
                    aria-hidden
                    className={`pointer-events-none absolute h-5 w-5 ${x} ${y} ${
                      x.startsWith("left") ? "border-l" : "border-r"
                    } ${y.startsWith("top") ? "border-t" : "border-b"} border-white/40`}
                  />
                );
              })}
            </div>
          </motion.div>

          {/* callouts direita (lg) */}
          <div className="hidden flex-col gap-4 lg:flex">
            {rightWidgets.map((w, i) => (
              <Callout key={w.title} widget={w} side="right" delay={0.15 + i * 0.1} />
            ))}
          </div>
        </div>

        {/* callouts em grade (abaixo de lg) */}
        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:hidden">
          {allWidgets.map((w, i) => (
            <Callout key={w.title} widget={w} side="left" delay={i * 0.06} />
          ))}
        </div>
      </div>
    </section>
  );
}
