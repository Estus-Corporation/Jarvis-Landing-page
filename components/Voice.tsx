"use client";

import React, { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { LockKey, HardDrives, Brain, Waveform as WaveIcon } from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";
import { JarvisOrb } from "@/components/ui/jarvis-sphere";
import { useOrbSize } from "@/components/ui/use-orb-size";

const points: { icon: Icon; title: string; line: string }[] = [
  {
    icon: WaveIcon,
    title: "Treinada na sua voz",
    line: "A síntese usa uma amostra da sua própria fala, não uma voz de catálogo.",
  },
  {
    icon: HardDrives,
    title: "Roda no seu Windows",
    line: "O assistente vive na sua máquina, junto dos programas que controla.",
  },
  {
    icon: LockKey,
    title: "Privacidade por padrão",
    line: "Suas chaves de API ficam criptografadas em AES-256, no seu computador.",
  },
  {
    icon: Brain,
    title: "Memória persistente",
    line: "Lembra de você entre sessões, em banco local. Nada sai da máquina.",
  },
];

// Frases que o Jarvis "fala", datilografadas em tempo real para dar a sensacao
// de que ele esta respondendo agora, na sua voz.
const PHRASES = [
  "Bom dia, Senhor. Sua agenda está livre até as 14h.",
  "Vídeo pausado. Abrindo o Visual Studio Code agora.",
  "Tocando sua playlist de foco no Spotify.",
  "Tudo certo. Mensagem enviada no WhatsApp.",
];

const CHAR_MS = 42;
const HOLD_MS = 2000;
const EXIT_MS = 420;

// Alturas deterministicas: nada de Math.random, senao servidor e cliente
// desenham barras diferentes e a hidratacao quebra.
const BARS = Array.from(
  { length: 28 },
  (_, i) => 0.25 + 0.75 * Math.abs(Math.sin(i * 1.7) * Math.cos(i * 0.55))
);

function LiveWave({ live }: { live: boolean }) {
  const reduce = useReducedMotion();
  return (
    <div className="flex h-6 items-center gap-[2px]" aria-hidden>
      {BARS.map((base, i) => (
        <motion.span
          key={i}
          className="w-[2px] origin-center rounded-full bg-white"
          style={{ height: `${base * 100}%` }}
          initial={false}
          animate={
            reduce
              ? { opacity: live ? 0.55 : 0.2 }
              : live
                ? { scaleY: [0.3, 1, 0.3], opacity: 0.7 }
                : { scaleY: 0.2, opacity: 0.2 }
          }
          transition={
            reduce || !live
              ? { duration: 0.3 }
              : {
                  duration: 0.6 + (i % 5) * 0.12,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: (i % 7) * 0.05,
                }
          }
        />
      ))}
    </div>
  );
}

function SpokenCaption({
  onSpeakingChange,
}: {
  onSpeakingChange: (speaking: boolean) => void;
}) {
  const reduce = useReducedMotion();
  const [pi, setPi] = useState(0);
  const [chars, setChars] = useState(0);
  // "exiting" e a fase que faltava: antes a frase pronta era zerada de uma vez
  // e o texto sumia num piscar. Agora ela sai desbotando antes da proxima.
  const [exiting, setExiting] = useState(false);

  const phrase = PHRASES[pi];
  const typing = chars < phrase.length;

  useEffect(() => {
    if (reduce) {
      setChars(phrase.length);
      return;
    }
    if (exiting) {
      const id = setTimeout(() => {
        setPi((p) => (p + 1) % PHRASES.length);
        setChars(0);
        setExiting(false);
      }, EXIT_MS);
      return () => clearTimeout(id);
    }
    if (typing) {
      const id = setTimeout(() => setChars((c) => c + 1), CHAR_MS);
      return () => clearTimeout(id);
    }
    const id = setTimeout(() => setExiting(true), HOLD_MS);
    return () => clearTimeout(id);
  }, [chars, pi, exiting, typing, reduce, phrase.length]);

  // A esfera fala enquanto a legenda digita e se acalma quando ela termina.
  const speaking = typing && !exiting && !reduce;
  useEffect(() => {
    onSpeakingChange(speaking);
  }, [speaking, onSpeakingChange]);

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.6 }}
      transition={{ duration: 0.6, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
      // min-h fixo comporta duas linhas: sem isso a caixa pula de altura toda
      // vez que uma frase mais longa quebra a linha.
      className="flex min-h-[4.75rem] w-full max-w-xl items-center gap-4 rounded-card border border-white/[0.1] bg-ink-800/80 px-5 py-4 backdrop-blur-sm"
    >
      <span className="shrink-0">
        <LiveWave live={speaking} />
      </span>
      <span className="h-8 w-px shrink-0 bg-white/10" />
      <motion.p
        animate={{ opacity: exiting ? 0 : 1, y: exiting ? -6 : 0 }}
        transition={{ duration: exiting ? EXIT_MS / 1000 : 0.25, ease: "easeOut" }}
        className="text-left text-sm leading-snug text-[#FAFAFA] sm:text-base"
        aria-live="polite"
      >
        {phrase.slice(0, chars)}
        {typing && !exiting && !reduce && (
          <span className="ml-0.5 inline-block h-[1.05em] w-[2px] translate-y-[2px] animate-pulse bg-white/70 align-middle" />
        )}
      </motion.p>
    </motion.div>
  );
}

export default function Voice() {
  const reduce = useReducedMotion();
  const [speaking, setSpeaking] = useState(false);
  // Esfera maior e responsiva. O componente desenha uma caixa de
  // (sphereSize + 144) por causa do padding dos aneis, e o hook ja desconta
  // isso da largura disponivel, entao ela cresce sem estourar no mobile.
  const { containerRef, size } = useOrbSize({ min: 170, max: 400 });

  const handleSpeakingChange = React.useCallback(
    (value: boolean) => setSpeaking(value),
    []
  );

  return (
    <section className="relative overflow-hidden bg-ink-950 px-6 py-28 sm:py-40">
      {/* halo central sob a esfera */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.05] blur-[140px]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-shell">
        <div className="flex flex-col items-center text-center">
          <motion.span
            initial={reduce ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.5 }}
            className="text-xs font-medium uppercase tracking-[0.2em] text-white/35"
          >
            Voz clonada
          </motion.span>
          <motion.h2
            initial={reduce ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="mt-4 max-w-[16ch] text-balance text-4xl font-semibold leading-[1.08] tracking-[-0.03em] text-[#FAFAFA] sm:text-6xl"
          >
            A resposta vem na sua voz.
          </motion.h2>
          <p className="mt-5 max-w-[48ch] text-lg font-light leading-relaxed text-white/55">
            Ele não lê em voz de robô. Responde com uma síntese treinada na sua
            própria fala, como se você conversasse com outra versão de si.
          </p>

          {/* Palco: esfera viva + legenda datilografada */}
          <motion.div
            initial={reduce ? false : { opacity: 0, scale: 0.94 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="mt-10 flex w-full flex-col items-center"
          >
            <div ref={containerRef} className="flex w-full justify-center">
              <JarvisOrb
                state={speaking ? "speaking" : "idle"}
                sphereSize={size}
                paused={!!reduce}
              />
            </div>

            {/* Sem margem negativa aqui. O orb ja traz 72px de padding
                transparente embaixo, entao esta margem soma a ele: o respiro
                real entre a esfera e a legenda fica em ~88px no mobile e
                ~96px no desktop. */}
            <div className="mt-4 flex w-full justify-center sm:mt-6">
              <SpokenCaption onSpeakingChange={handleSpeakingChange} />
            </div>
          </motion.div>
        </div>

        {/* Pilares de privacidade */}
        <div className="mx-auto mt-16 grid max-w-4xl gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
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
                className="border-t border-white/[0.1] pt-6 text-left"
              >
                <Glyph size={22} weight="light" className="text-white/70" aria-hidden />
                <h3 className="mt-4 text-base font-medium text-[#FAFAFA]">
                  {point.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/45">
                  {point.line}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
