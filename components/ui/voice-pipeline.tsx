"use client";

import React from "react";
import { motion, useReducedMotion, AnimatePresence } from "motion/react";
import { Check, CircleNotch } from "@phosphor-icons/react/dist/ssr";

// Alturas deterministicas: valor calculado a partir do indice, nunca Math.random,
// senao servidor e cliente desenham barras diferentes e a hidratacao quebra.
const BARS = Array.from(
  { length: 44 },
  (_, i) => 0.22 + 0.78 * Math.abs(Math.sin(i * 1.7) * Math.cos(i * 0.6))
);

const TRANSCRIPT = "Jarvis, pausa o vídeo e abre o VS Code.";
const RESPONSE = "Pausado. Abrindo o Visual Studio Code.";

const INTENTS = [
  { tool: "navegador", action: "pausar vídeo" },
  { tool: "programas", action: "abrir VS Code" },
];

function Waveform({ live }: { live: boolean }) {
  const reduce = useReducedMotion();

  return (
    <div className="flex h-12 items-center gap-[3px]" aria-hidden>
      {BARS.map((base, i) => (
        <motion.span
          key={i}
          className="w-[3px] flex-1 origin-center rounded-full bg-white"
          style={{ height: `${base * 100}%` }}
          initial={false}
          animate={
            reduce
              ? { opacity: live ? 0.5 : 0.16 }
              : live
                ? { scaleY: [0.35, 1, 0.35], opacity: 0.62 }
                : { scaleY: 0.16, opacity: 0.14 }
          }
          transition={
            reduce || !live
              ? { duration: 0.4 }
              : {
                  duration: 0.7 + (i % 6) * 0.11,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: (i % 9) * 0.05,
                }
          }
        />
      ))}
    </div>
  );
}

export default function VoicePipeline({ step }: { step: number }) {
  const reduce = useReducedMotion();

  const listening = step === 0;
  const speaking = step === 3;
  const showTranscript = step >= 1;
  const showIntents = step >= 1;
  const intentsDone = step >= 2;
  const showResponse = step >= 3;

  const fade = {
    initial: reduce ? false : { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] as const },
  };

  return (
    <div className="w-full rounded-card border border-white/[0.09] bg-ink-800 p-7 sm:p-8">
      <Waveform live={listening || speaking} />

      {/* O que foi dito */}
      <div className="mt-7 min-h-[4.5rem]">
        <span className="text-xs text-white/30">você diz</span>
        <div className="mt-2">
          <AnimatePresence mode="wait">
            {showTranscript ? (
              <motion.p
                key="transcript"
                {...fade}
                className="text-lg leading-snug text-[#FAFAFA]"
              >
                {TRANSCRIPT}
              </motion.p>
            ) : (
              <motion.span
                key="waiting"
                {...fade}
                className="inline-block h-[1.4rem] w-[2px] animate-pulse bg-white/60 align-middle"
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* O que ele entendeu que precisa fazer */}
      <div className="mt-7 border-t border-white/[0.07] pt-6">
        <span className="text-xs text-white/30">ele resolve</span>
        <ul className="mt-3 flex flex-col gap-2.5">
          {INTENTS.map((intent, i) => (
            <motion.li
              key={intent.action}
              initial={false}
              animate={{ opacity: showIntents ? 1 : 0.12 }}
              transition={{
                duration: 0.4,
                delay: reduce || !showIntents ? 0 : i * 0.12,
              }}
              className="flex items-center gap-3"
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                {intentsDone ? (
                  <Check size={14} weight="bold" className="text-white/80" />
                ) : (
                  <CircleNotch
                    size={14}
                    weight="bold"
                    className={`text-white/35 ${
                      showIntents && !reduce ? "animate-spin" : ""
                    }`}
                  />
                )}
              </span>
              <span className="font-mono text-xs text-white/40">
                {intent.tool}
              </span>
              <span className="text-sm text-white/75">{intent.action}</span>
            </motion.li>
          ))}
        </ul>
      </div>

      {/* A resposta falada */}
      <div className="mt-7 min-h-[4rem] border-t border-white/[0.07] pt-6">
        <span className="text-xs text-white/30">ele responde</span>
        <div className="mt-2">
          <AnimatePresence>
            {showResponse && (
              <motion.p
                key="response"
                {...fade}
                className="text-base leading-snug text-[#FAFAFA]"
              >
                {RESPONSE}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
