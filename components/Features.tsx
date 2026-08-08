"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useReducedMotionSafe } from "@/components/ui/use-reduced-motion-safe";
import {
  Eye,
  Terminal,
  Brain,
  Waveform,
  SlidersHorizontal,
  Microphone,
  ArrowDown,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";
import SectionEyebrow from "@/components/ui/section-eyebrow";

// SECAO RECONSTRUIDA DO ZERO — antes era um bento grid de cartoes estaticos.
//
// Ideia nova: um CONSOLE DE COMANDOS AO VIVO. A esquerda, a lista de
// capacidades vira uma fileira de "comandos" selecionaveis (com indicador de
// LED no ativo, e um auto-play que percorre um por um). A direita, uma janela
// de sistema simulada DEMONSTRA a capacidade selecionada: mostra o comando
// falado ("voce disse") e uma micro-animacao da acao acontecendo (uma tela
// sendo escaneada, um terminal executando, memorias sendo lidas, a onda da
// voz clonada, o controle de tom). E o produto se mostrando funcionando, em
// vez de so descrever — que e o que faz o visitante querer comprar.

type Kind = "scan" | "terminal" | "memory" | "voice" | "tone";
type Cap = {
  id: string;
  tab: string;
  hint: string;
  icon: Icon;
  command: string;
  kind: Kind;
};

const CAPS: Cap[] = [
  {
    id: "tela",
    tab: "Vê a sua tela",
    hint: "Responde sobre o que está no monitor",
    icon: Eye,
    command: "Jarvis, o que esse erro aqui quer dizer?",
    kind: "scan",
  },
  {
    id: "acao",
    tab: "Age no sistema",
    hint: "Abre programas, roda terminal e Git",
    icon: Terminal,
    command: "Sobe o projeto pro GitHub.",
    kind: "terminal",
  },
  {
    id: "memoria",
    tab: "Lembra de tudo",
    hint: "Guarda o que você contou e retoma depois",
    icon: Brain,
    command: "Manda pro cliente daquele projeto.",
    kind: "memory",
  },
  {
    id: "voz",
    tab: "Fala com a sua voz",
    hint: "Responde numa síntese treinada na sua fala",
    icon: Waveform,
    command: "Que horas é minha primeira reunião?",
    kind: "voice",
  },
  {
    id: "tom",
    tab: "Do seu jeito",
    hint: "Formal, seco ou brincalhão — você escolhe",
    icon: SlidersHorizontal,
    command: "Responde mais curto a partir de agora.",
    kind: "tone",
  },
];

const AUTOPLAY_MS = 4200;

// ---- Visualizacoes por capacidade (o "miolo" da tela do console) ----------

function ScanViz() {
  return (
    <div className="relative h-full overflow-hidden rounded-xl border border-white/[0.08] bg-ink-950">
      {/* "janela" generica sendo observada */}
      <div className="space-y-2.5 p-5">
        <div className="h-2 w-1/3 rounded-full bg-white/15" />
        <div className="h-2 w-4/5 rounded-full bg-white/[0.08]" />
        <div className="h-2 w-2/3 rounded-full bg-white/[0.08]" />
        <div className="h-2 w-3/4 rounded-full bg-red-100/20" />
        <div className="h-2 w-1/2 rounded-full bg-white/[0.08]" />
      </div>
      {/* linha de varredura */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-transparent via-white/[0.14] to-transparent scan-y" />
      <div className="absolute inset-x-0 bottom-0 border-t border-white/[0.08] bg-ink-900/70 px-5 py-3 text-sm text-white/70">
        <span className="text-white/40">→ </span>
        Erro de sintaxe na linha 42: falta um ponto e vírgula.
      </div>
    </div>
  );
}

function TerminalViz() {
  return (
    <div className="h-full overflow-hidden rounded-xl border border-white/[0.08] bg-ink-950 p-5 font-mono text-[13px] leading-relaxed">
      <p className="text-white/85">
        <span className="text-white/40">$</span> git add . &amp;&amp; git commit
        -m <span className="text-white/60">&quot;update&quot;</span>
      </p>
      <p className="mt-1 text-white/40">2 files changed, 47 insertions(+)</p>
      <p className="mt-1 text-white/85">
        <span className="text-white/40">$</span> git push origin main
      </p>
      <p className="mt-1 text-white/40">
        To github.com:voce/projeto.git
      </p>
      <p className="text-white/40">
        &nbsp;&nbsp;a1b2c3d..e4f5g6h main → main
      </p>
      <p className="mt-1 text-white/85">
        <span className="text-white/40">$</span>{" "}
        <span className="caret-blink inline-block h-3.5 w-2 translate-y-0.5 bg-white/80" />
      </p>
    </div>
  );
}

function MemoryViz() {
  const memories = [
    "Cliente do projeto → Acme Studio",
    "Prefere respostas curtas e diretas",
    "Fuso: São Paulo (GMT-3)",
    "Stack favorita: Next.js + Tailwind",
  ];
  return (
    <div className="flex h-full flex-col justify-center gap-2.5 rounded-xl border border-white/[0.08] bg-ink-950 p-5">
      {memories.map((m, i) => (
        <motion.div
          key={m}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 + i * 0.12, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center gap-3 rounded-chip border border-white/[0.08] bg-white/[0.02] px-3.5 py-2.5"
        >
          <span className="led-dot" aria-hidden />
          <span className="text-sm text-white/70">{m}</span>
        </motion.div>
      ))}
    </div>
  );
}

function VoiceViz() {
  // 40 barras, cada uma com delay proprio pra onda correr.
  const bars = Array.from({ length: 40 });
  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 rounded-xl border border-white/[0.08] bg-ink-950 p-5">
      <div className="flex h-24 items-center gap-1">
        {bars.map((_, i) => (
          <span
            key={i}
            className="wave-bar w-1 rounded-full bg-gradient-to-t from-white/30 to-white/85"
            style={{
              height: "100%",
              animationDelay: `${(i % 20) * 0.05}s`,
            }}
          />
        ))}
      </div>
      <p className="text-sm text-white/60">
        Reproduzindo na <span className="text-white/85">sua voz clonada</span>…
      </p>
    </div>
  );
}

function ToneViz() {
  const tones = ["Formal", "Neutro", "Seco", "Brincalhão"];
  const active = 2;
  return (
    <div className="flex h-full flex-col justify-center gap-6 rounded-xl border border-white/[0.08] bg-ink-950 p-6">
      <div className="flex items-center justify-between text-xs text-white/40">
        <span>Tom da resposta</span>
        <span className="text-white/70">ajustável a qualquer momento</span>
      </div>
      <div className="flex flex-wrap gap-2.5">
        {tones.map((t, i) => (
          <span
            key={t}
            className={`rounded-full border px-4 py-2 text-sm transition-colors ${
              i === active
                ? "border-white/40 bg-white/[0.06] text-white"
                : "border-white/[0.1] text-white/45"
            }`}
          >
            {t}
          </span>
        ))}
      </div>
      {/* trilho com o knob no ativo */}
      <div className="relative mt-1 h-1 rounded-full bg-white/[0.1]">
        <div className="absolute inset-y-0 left-0 w-2/3 rounded-full bg-white/40" />
        <div className="absolute left-2/3 top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_10px_2px_rgba(255,255,255,0.5)]" />
      </div>
    </div>
  );
}

function ConsoleBody({ cap }: { cap: Cap }) {
  switch (cap.kind) {
    case "scan":
      return <ScanViz />;
    case "terminal":
      return <TerminalViz />;
    case "memory":
      return <MemoryViz />;
    case "voice":
      return <VoiceViz />;
    case "tone":
      return <ToneViz />;
  }
}

export default function Features() {
  const reduce = useReducedMotionSafe();
  const [activeIdx, setActiveIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  // Auto-play: percorre as capacidades sozinho, como uma demo rodando. Para
  // no hover/foco (o visitante assumiu o controle) e em reduced-motion.
  useEffect(() => {
    if (reduce || paused) return;
    const id = setInterval(
      () => setActiveIdx((i) => (i + 1) % CAPS.length),
      AUTOPLAY_MS
    );
    return () => clearInterval(id);
  }, [reduce, paused]);

  const active = CAPS[activeIdx];

  return (
    <section
      id="recursos"
      className="relative overflow-hidden bg-ink-900 px-6 pb-28 pt-14 sm:pb-36 sm:pt-20 lg:px-10 wide:px-16"
    >
      {/* halo suave atras do console */}
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 top-1/3 h-[460px] w-[620px] translate-x-1/4 rounded-full bg-white/[0.04] blur-[140px]"
      />

      <div className="relative mx-auto max-w-6xl wide:max-w-shell">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-3xl"
        >
          <SectionEyebrow>Capacidades</SectionEyebrow>
          <h2 className="mt-5 text-balance font-display text-3xl font-semibold tracking-[-0.025em] text-[#FAFAFA] sm:text-5xl lg:text-6xl">
            Ele age no computador, não só no chat.
          </h2>
          <p className="mt-6 max-w-[54ch] text-lg font-light leading-relaxed text-white/55">
            Não é mais um chat que responde e para por aí. Escolha uma
            capacidade e veja o Jarvis executando de verdade.
          </p>
        </motion.div>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={() => setPaused(false)}
          className="mt-14 grid grid-cols-1 gap-4 lg:grid-cols-[0.9fr_1.35fr] lg:gap-5"
        >
          {/* Coluna esquerda: seletor de capacidades */}
          <div className="flex flex-col gap-2.5">
            {CAPS.map((cap, i) => {
              const Glyph = cap.icon;
              const isActive = i === activeIdx;
              return (
                <button
                  key={cap.id}
                  type="button"
                  onClick={() => setActiveIdx(i)}
                  aria-pressed={isActive}
                  className={`glow-ring group relative flex items-center gap-4 overflow-hidden rounded-card border px-5 py-4 text-left transition-colors duration-300 ${
                    isActive
                      ? "glow-ring--active border-white bg-[#FAFAFA]"
                      : "border-white/[0.08] bg-ink-900/60 hover:border-white/20 hover:bg-ink-800/60"
                  }`}
                >
                  <span
                    aria-hidden
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-chip border transition-colors duration-300 ${
                      isActive
                        ? "border-ink-950 bg-ink-950 text-white"
                        : "border-white/[0.1] text-white/55 group-hover:text-white/80"
                    }`}
                  >
                    <Glyph size={19} weight="light" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className={`block font-display text-[0.95rem] font-semibold tracking-[-0.01em] transition-colors duration-300 ${
                        isActive ? "text-ink-950" : "text-white/75"
                      }`}
                    >
                      {cap.tab}
                    </span>
                    <span
                      className={`mt-0.5 block truncate text-xs transition-colors duration-300 ${
                        isActive ? "text-ink-950/80" : "text-white/40"
                      }`}
                    >
                      {cap.hint}
                    </span>
                  </span>
                  {isActive && (
                    <span
                      className="ml-1 h-1.5 w-1.5 shrink-0 rounded-full bg-ink-950"
                      aria-hidden
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Coluna direita: a janela do console */}
          <div className="glow-ring glow-ring--active relative flex min-h-[420px] flex-col overflow-hidden rounded-card border border-white/[0.12] bg-ink-800/70 shadow-[0_40px_120px_-50px_rgba(0,0,0,0.9)]">
            {/* barra de titulo */}
            <div className="flex items-center gap-3 border-b border-white/[0.08] px-5 py-3.5">
              <span className="flex gap-1.5" aria-hidden>
                <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
              </span>
              <span className="ml-1 font-display text-xs font-semibold uppercase tracking-[0.15em] text-white/45">
                Jarvis Console
              </span>
              <span className="ml-auto flex items-center gap-2 text-xs text-white/40">
                <span className="led-dot" aria-hidden />
                ativo
              </span>
            </div>

            {/* corpo */}
            <div className="flex flex-1 flex-col gap-4 p-5">
              {/* voce disse */}
              <div className="flex items-center gap-3 rounded-chip border border-white/[0.08] bg-ink-950/60 px-4 py-3">
                <Microphone
                  size={18}
                  weight="light"
                  aria-hidden
                  className="shrink-0 text-white/50"
                />
                <span className="text-xs uppercase tracking-[0.14em] text-white/35">
                  Você disse
                </span>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={active.id}
                    initial={reduce ? false : { opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduce ? undefined : { opacity: 0, y: -6 }}
                    transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                    className="truncate text-sm italic text-white/80"
                  >
                    “{active.command}”
                  </motion.span>
                </AnimatePresence>
              </div>

              {/* tela da acao */}
              <div className="relative flex-1">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={active.id}
                    initial={reduce ? false : { opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduce ? undefined : { opacity: 0, y: -12 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute inset-0"
                  >
                    <ConsoleBody cap={active} />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Ponte para Integracoes */}
        <motion.a
          href="#integracoes"
          initial={reduce ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.8 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="group mt-14 flex items-center justify-center gap-2 text-sm font-medium text-white/45 transition-colors duration-300 hover:text-white/85"
        >
          Veja tudo que ele já conecta
          <ArrowDown
            size={15}
            weight="bold"
            aria-hidden
            className="transition-transform duration-300 group-hover:translate-y-0.5"
          />
        </motion.a>
      </div>
    </section>
  );
}
