"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { Microphone, Check, Waveform } from "@phosphor-icons/react/dist/ssr";

// Reinvencao da secao: em vez de uma lista de passos que rola, mostramos um
// "trace de execucao" ao vivo. O mesmo pedido falado atravessa o produto e
// cada acao aparece com o seu timestamp em milissegundos — o cronometro no
// topo prova, na pratica, o "em segundos" do titulo. Roda sozinho e cicla
// entre comandos reais; da pra trocar clicando nos comandos a esquerda.
type Step = { t: number; tool: string; action: string };
type Scenario = {
  id: string;
  command: string;
  steps: Step[];
  response: string;
  total: number;
};

const SCENARIOS: Scenario[] = [
  {
    id: "Foco no trabalho",
    command: "Jarvis, pausa o vídeo e abre o VS Code.",
    steps: [
      { t: 0.2, tool: "navegador", action: "vídeo pausado no Chrome" },
      { t: 0.6, tool: "programas", action: "Visual Studio Code aberto" },
    ],
    response: "Pronto. Vídeo pausado e VS Code aberto.",
    total: 0.8,
  },
  {
    id: "Modo concentração",
    command: "Toca meu foco no Spotify e silencia o WhatsApp.",
    steps: [
      { t: 0.3, tool: "spotify", action: 'playlist "Foco" tocando' },
      { t: 0.5, tool: "whatsapp", action: "notificações silenciadas" },
    ],
    response: "Tocando Foco. WhatsApp no silêncio.",
    total: 0.7,
  },
  {
    id: "Fluxo de código",
    command: "Cria a branch feature/login e sobe pro GitHub.",
    steps: [
      { t: 0.4, tool: "git", action: "branch feature/login criada" },
      { t: 0.9, tool: "github", action: "push concluído" },
    ],
    response: "Branch criada e enviada pro GitHub.",
    total: 1.1,
  },
];

const STEP_MS = 640;
const RESP_GAP = 520;
const HOLD_MS = 2600;

export default function InAction() {
  const reduce = useReducedMotion();
  const [sc, setSc] = useState(0);
  const [reveal, setReveal] = useState(0);
  const [showResp, setShowResp] = useState(false);
  const scenario = SCENARIOS[sc];

  useEffect(() => {
    if (reduce) {
      setReveal(scenario.steps.length);
      setShowResp(true);
      return;
    }
    setReveal(0);
    setShowResp(false);
    const timers: ReturnType<typeof setTimeout>[] = [];
    scenario.steps.forEach((_, i) =>
      timers.push(setTimeout(() => setReveal(i + 1), STEP_MS * (i + 1)))
    );
    const afterSteps = STEP_MS * scenario.steps.length + RESP_GAP;
    timers.push(setTimeout(() => setShowResp(true), afterSteps));
    timers.push(
      setTimeout(
        () => setSc((s) => (s + 1) % SCENARIOS.length),
        afterSteps + HOLD_MS
      )
    );
    return () => timers.forEach(clearTimeout);
  }, [sc, reduce, scenario.steps.length]);

  const shownT = showResp
    ? scenario.total
    : reveal > 0
      ? scenario.steps[reveal - 1].t
      : 0;
  const running = !showResp && !reduce;

  return (
    <section id="como-funciona" className="relative bg-ink-900 px-6 py-24 sm:py-32">
      <span id="demo" className="absolute -top-24" aria-hidden />

      <div className="mx-auto grid max-w-shell items-center gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        {/* Coluna narrativa */}
        <div>
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-white/35">
            Como funciona
          </span>
          <motion.h2
            initial={reduce ? false : { opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="mt-4 max-w-[16ch] text-balance text-3xl font-semibold tracking-[-0.02em] text-[#FAFAFA] sm:text-5xl"
          >
            Da sua voz até a ação, em segundos.
          </motion.h2>
          <p className="mt-5 max-w-[46ch] text-lg font-light leading-relaxed text-white/55">
            Você fala uma vez. O Jarvis interpreta, escolhe as ferramentas e
            executa tudo em sequência — e volta falando quando termina.
          </p>

          <div className="mt-9 flex flex-col gap-2" role="tablist" aria-label="Exemplos de comando">
            {SCENARIOS.map((s, i) => {
              const activeChip = i === sc;
              return (
                <button
                  key={s.id}
                  role="tab"
                  aria-selected={activeChip}
                  onClick={() => setSc(i)}
                  className={`group flex items-center gap-3 rounded-chip border px-4 py-3 text-left transition-colors duration-300 ${
                    activeChip
                      ? "border-white/25 bg-ink-800 text-[#FAFAFA]"
                      : "border-white/[0.08] text-white/50 hover:border-white/15 hover:text-white/75"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 shrink-0 rounded-full transition-colors ${
                      activeChip ? "bg-white" : "bg-white/25"
                    }`}
                  />
                  <span className="text-sm font-medium">{s.id}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Console de execucao ao vivo */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden rounded-card border border-white/[0.09] bg-ink-800"
        >
          {/* halo sutil no topo do console */}
          <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-[70%] -translate-x-1/2 rounded-full bg-white/[0.06] blur-[80px]" />

          {/* cabecalho: status + cronometro */}
          <div className="flex items-center justify-between border-b border-white/[0.07] px-6 py-4">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2 w-2">
                {running && (
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/60" />
                )}
                <span className="relative inline-flex h-2 w-2 rounded-full bg-white/80" />
              </span>
              <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-white/45">
                {showResp ? "concluído" : "executando"}
              </span>
            </div>
            <span className="font-mono text-sm tabular-nums text-[#FAFAFA]">
              {shownT.toFixed(1)}s
            </span>
          </div>

          <div className="px-6 py-6 sm:px-8">
            {/* o que foi dito */}
            <div className="flex items-start gap-3">
              <Microphone size={18} weight="light" className="mt-1 shrink-0 text-white/45" aria-hidden />
              <div>
                <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-white/30">
                  você disse
                </span>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={scenario.id}
                    initial={reduce ? false : { opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduce ? undefined : { opacity: 0, y: -6 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="mt-1.5 text-lg leading-snug text-[#FAFAFA]"
                  >
                    &ldquo;{scenario.command}&rdquo;
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>

            {/* trace de acoes */}
            <div className="mt-7 border-t border-white/[0.07] pt-5">
              <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-white/30">
                ele executa
              </span>
              <ul className="mt-3 flex flex-col gap-2.5">
                {scenario.steps.map((step, i) => {
                  const done = reveal > i;
                  return (
                    <motion.li
                      key={`${scenario.id}-${step.action}`}
                      initial={false}
                      animate={{
                        opacity: done ? 1 : 0.18,
                        x: done || reduce ? 0 : -6,
                      }}
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      className="flex items-center gap-3"
                    >
                      <span className="font-mono text-xs tabular-nums text-white/35">
                        {step.t.toFixed(1)}s
                      </span>
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white/15">
                        {done && (
                          <Check size={12} weight="bold" className="text-[#FAFAFA]" aria-hidden />
                        )}
                      </span>
                      <span className="rounded border border-white/10 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-white/45">
                        {step.tool}
                      </span>
                      <span className="text-sm text-white/80">{step.action}</span>
                    </motion.li>
                  );
                })}
              </ul>
            </div>

            {/* resposta falada */}
            <div className="mt-7 min-h-[3.5rem] border-t border-white/[0.07] pt-5">
              <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-white/30">
                jarvis responde
              </span>
              <AnimatePresence>
                {showResp && (
                  <motion.div
                    key={`${scenario.id}-resp`}
                    initial={reduce ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                    className="mt-2 flex items-center gap-3"
                  >
                    <Waveform size={18} weight="light" className="shrink-0 text-white/55" aria-hidden />
                    <p className="text-base leading-snug text-[#FAFAFA]">
                      {scenario.response}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
