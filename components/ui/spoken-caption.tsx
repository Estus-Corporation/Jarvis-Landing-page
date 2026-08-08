"use client";

import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { useReducedMotionSafe } from "@/components/ui/use-reduced-motion-safe";

// Legenda falada + mixer de onda.
//
// Este bloco nasceu dentro da secao de Voz clonada e foi extraido para ca
// quando o hero passou a precisar do mesmo comportamento. Extrair em vez de
// copiar: uma correcao no ritmo de digitacao ou no desenho das barras vale
// para os dois lugares de uma vez.
//
// As frases NAO vem daqui de proposito. Cada lugar passa as suas, senao a
// pagina repetiria o mesmo texto duas vezes e a segunda ocorrencia perderia
// completamente a graca.

const CHAR_MS = 42;
const HOLD_MS = 2000;
const EXIT_MS = 420;

// Alturas deterministicas: nada de Math.random, senao servidor e cliente
// desenham barras diferentes e a hidratacao quebra.
const BARS = Array.from(
  { length: 28 },
  (_, i) => 0.25 + 0.75 * Math.abs(Math.sin(i * 1.7) * Math.cos(i * 0.55))
);

export function LiveWave({ live }: { live: boolean }) {
  const reduce = useReducedMotionSafe();
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

export function SpokenCaption({
  phrases,
  onSpeakingChange,
  // O hero aparece com a pagina, entao a legenda dele entra por tempo. A secao
  // de voz esta la embaixo e so deve animar quando o visitante chega nela.
  reveal = "inView",
  revealDelay = 0.25,
  className = "",
}: {
  phrases: string[];
  onSpeakingChange: (speaking: boolean) => void;
  reveal?: "inView" | "immediate";
  revealDelay?: number;
  className?: string;
}) {
  const reduce = useReducedMotionSafe();
  const [pi, setPi] = useState(0);
  const [chars, setChars] = useState(0);
  // "exiting" e a fase que faltava: antes a frase pronta era zerada de uma vez
  // e o texto sumia num piscar. Agora ela sai desbotando antes da proxima.
  const [exiting, setExiting] = useState(false);

  const phrase = phrases[pi];
  const typing = chars < phrase.length;

  useEffect(() => {
    if (reduce) {
      setChars(phrase.length);
      return;
    }
    if (exiting) {
      const id = setTimeout(() => {
        setPi((p) => (p + 1) % phrases.length);
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
  }, [chars, pi, exiting, typing, reduce, phrase.length, phrases.length]);

  // A esfera fala enquanto a legenda digita e se acalma quando ela termina.
  const speaking = typing && !exiting && !reduce;
  useEffect(() => {
    onSpeakingChange(speaking);
  }, [speaking, onSpeakingChange]);

  // O alvo da entrada NAO depende de reduce. Antes o branch reduzido devolvia
  // um objeto vazio: sem `animate`, nada tirava o elemento do opacity 0 inicial
  // e a legenda ficava invisivel para quem usa "reduzir movimento".
  // Agora o destino e sempre o estado visivel; quem muda com a preferencia e so
  // a DURACAO, que vai a zero e faz o elemento aparecer instantaneamente.
  const entry =
    reveal === "immediate"
      ? { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } }
      : {
          initial: { opacity: 0, y: 12 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, amount: 0.6 } as const,
        };

  return (
    <motion.div
      {...entry}
      transition={{
        duration: reduce ? 0 : 0.6,
        delay: reduce ? 0 : revealDelay,
        ease: [0.16, 1, 0.3, 1],
      }}
      // Caixa agora encolhe/cresce com o conteudo (w-fit) em vez de ocupar a
      // largura toda: a frase nunca quebra linha, entao nao ha mais motivo
      // para reservar uma largura fixa que sobra vazia na maioria das frases.
      // `max-w-full` trava no pai se algum dia uma frase for grande demais
      // mesmo assim; `overflow-hidden` garante que ela corta em vez de
      // vazar do cartao nesse caso extremo. Onda e divisor somem abaixo de
      // sm: e o espaco que falta pra frase mais longa caber numa linha so no
      // celular, onde a coluna e mais estreita.
      className={`flex w-fit max-w-full items-center overflow-hidden rounded-card border border-white/[0.1] bg-ink-800/80 px-4 py-4 backdrop-blur-sm sm:px-5 ${className}`}
    >
      <motion.p
        animate={{ opacity: exiting ? 0 : 1, y: exiting ? -6 : 0 }}
        transition={{ duration: exiting ? EXIT_MS / 1000 : 0.25, ease: "easeOut" }}
        className="whitespace-nowrap text-left text-xs leading-snug text-[#FAFAFA] sm:text-sm"
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
