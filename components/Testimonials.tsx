"use client";

// PLACEHOLDER: nenhum depoimento aqui e real. O produto ainda nao lancou, e
// inventar nomes e falas de "clientes" seria prova social falsa — exatamente
// o que o conselho de IA (rodado nesta mesma sessao, sobre esta mesma pagina)
// apontou como o maior risco de credibilidade do site. Cada item abaixo tem
// um tema sugerido (pra saber que tipo de fala procurar) e o texto entre
// colchetes precisa ser trocado por uma fala real, com nome e contexto reais,
// antes de publicar. Ate la, o carrossel em si funciona de verdade (setas,
// indicadores, autoplay, gate de reduced motion) — so o conteudo e
// provisorio.
import React, { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useReducedMotionSafe } from "@/components/ui/use-reduced-motion-safe";
import {
  Quotes,
  CaretLeft,
  CaretRight,
} from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/utils";

const testimonials = [
  {
    quote:
      "[Espaço reservado — depoimento sobre a primeira impressão ao usar o Jarvis.]",
    name: "[Nome do cliente]",
    role: "[Cargo ou contexto]",
  },
  {
    quote:
      "[Espaço reservado — depoimento sobre economia de tempo no dia a dia.]",
    name: "[Nome do cliente]",
    role: "[Cargo ou contexto]",
  },
  {
    quote: "[Espaço reservado — depoimento sobre a voz clonada.]",
    name: "[Nome do cliente]",
    role: "[Cargo ou contexto]",
  },
  {
    quote: "[Espaço reservado — depoimento sobre suporte e confiança.]",
    name: "[Nome do cliente]",
    role: "[Cargo ou contexto]",
  },
];

const AUTOPLAY_MS = 6000;

const variants = {
  enter: (direction: number) => ({ x: direction > 0 ? 32 : -32, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction > 0 ? -32 : 32, opacity: 0 }),
};

export default function Testimonials() {
  const reduce = useReducedMotionSafe();
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const next = useCallback(() => {
    setDirection(1);
    setIndex((i) => (i + 1) % testimonials.length);
  }, []);

  const prev = useCallback(() => {
    setDirection(-1);
    setIndex((i) => (i - 1 + testimonials.length) % testimonials.length);
  }, []);

  const goTo = useCallback(
    (i: number) => {
      setDirection(i > index ? 1 : -1);
      setIndex(i);
    },
    [index]
  );

  // Autoplay para sozinho em reduced motion: um carrossel trocando slide sem
  // aviso e exatamente o tipo de movimento que essa preferencia pede pra
  // evitar.
  useEffect(() => {
    if (reduce) return;
    const id = setInterval(next, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [reduce, next]);

  const current = testimonials[index];

  return (
    // ink-900, nao ink-950: a secao anterior (Interface) ja e ink-900, e a
    // seguinte (Precos) e ink-950. Se esta ficasse ink-950 tambem, ela e
    // Precos ficariam identicas lado a lado, sem nenhuma costura visivel
    // entre as duas. Com ink-900, a troca de cor acontece bem na virada pra
    // Precos, exatamente onde ja acontecia antes desta secao existir.
    <section
      id="depoimentos"
      className="relative overflow-hidden border-t border-white/[0.07] bg-ink-900 px-6 py-28 sm:py-36"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/3 h-[420px] w-[620px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.04] blur-[130px]"
      />

      <div className="relative mx-auto max-w-shell">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="text-balance text-3xl font-semibold tracking-[-0.02em] text-[#FAFAFA] sm:text-5xl">
            O que dizem sobre o Jarvis.
          </h2>
        </motion.div>

        <div className="relative mx-auto mt-14 max-w-2xl">
          <Quotes
            size={32}
            weight="fill"
            className="mx-auto text-white/15"
            aria-hidden
          />

          <div className="relative mt-6 min-h-[168px] sm:min-h-[144px]">
            <AnimatePresence mode="wait" custom={direction} initial={false}>
              <motion.div
                key={index}
                custom={direction}
                variants={variants}
                initial={reduce ? undefined : "enter"}
                animate="center"
                exit={reduce ? undefined : "exit"}
                transition={{ duration: reduce ? 0 : 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="text-center"
              >
                <p className="text-lg italic leading-relaxed text-white/80 sm:text-xl">
                  “{current.quote}”
                </p>
                <p className="mt-6 text-sm font-medium text-[#FAFAFA]">
                  {current.name}
                </p>
                <p className="text-xs text-white/45">{current.role}</p>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-8 flex items-center justify-center gap-6">
            <button
              type="button"
              onClick={prev}
              aria-label="Depoimento anterior"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 text-white/60 transition-colors duration-200 hover:border-white/35 hover:text-white"
            >
              <CaretLeft size={16} weight="bold" aria-hidden />
            </button>

            <div className="flex items-center gap-2">
              {testimonials.map((item, i) => (
                <button
                  key={item.name + i}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Ir para o depoimento ${i + 1}`}
                  aria-current={i === index}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    i === index ? "w-6 bg-white/70" : "w-1.5 bg-white/20 hover:bg-white/35"
                  )}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={next}
              aria-label="Próximo depoimento"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 text-white/60 transition-colors duration-200 hover:border-white/35 hover:text-white"
            >
              <CaretRight size={16} weight="bold" aria-hidden />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
