"use client";

import React, { useRef } from "react";
import Image from "next/image";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "motion/react";

// "Scroll Expand" reconstruido.
//
// O componente colado sequestra o scroll da pagina: adiciona wheel/scroll
// listeners GLOBAIS com preventDefault e forca window.scrollTo(0,0) ate a midia
// "expandir". Isso so sobrevive como PRIMEIRO bloco da pagina. Montado no meio,
// congela o site inteiro no topo (ninguem chega a rolar ate aqui). Alem disso o
// guia do projeto bane window scroll listener, scroll-jacking, a dica visual
// "Scroll to Expand" e o azul do texto.
//
// Aqui o mesmo efeito (midia cresce do centro enquanto o titulo se abre em duas
// linhas) e dirigido por useScroll sobre uma pista alta com um palco sticky:
// nenhuma escuta global, nada de travar a pagina, monocromatico, e estatico em
// prefers-reduced-motion.

export default function ScrollExpandMedia({
  titleTop,
  titleBottom,
  mediaSrc,
  mediaAlt,
}: {
  titleTop: string;
  titleBottom: string;
  mediaSrc: string;
  mediaAlt: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  // A midia cresce de um retangulo estreito no centro ate quase a largura do
  // palco. O cap por vw/vh nas classes garante que nunca estoure a tela.
  const width = useTransform(
    scrollYProgress,
    [0, 1],
    reduce ? [1180, 1180] : [360, 1180]
  );
  const height = useTransform(
    scrollYProgress,
    [0, 1],
    reduce ? [660, 660] : [460, 680]
  );
  const radius = useTransform(scrollYProgress, [0, 1], [24, 20]);

  // O titulo se abre: a linha de cima desliza para a esquerda, a de baixo para
  // a direita, revelando a midia que alarga entre elas. E some no fim, para nao
  // competir com a captura ja aberta.
  const leftX = useTransform(
    scrollYProgress,
    [0, 1],
    reduce ? ["0vw", "0vw"] : ["0vw", "-24vw"]
  );
  const rightX = useTransform(
    scrollYProgress,
    [0, 1],
    reduce ? ["0vw", "0vw"] : ["0vw", "24vw"]
  );
  // O titulo comeca na FRENTE da midia (nao atras) e sai de cena cedo: assim
  // ele nunca aparece cortado pelo retangulo da captura. Le como "o texto se
  // abre e revela a tela", nao "texto preso atras da imagem".
  const titleOpacity = useTransform(
    scrollYProgress,
    [0.15, 0.5],
    reduce ? [1, 1] : [1, 0]
  );

  // Escurecimento sobre a captura: forte quando pequena, quase limpo quando
  // aberta. A tela "revela" o conteudo conforme cresce.
  const overlay = useTransform(
    scrollYProgress,
    [0, 1],
    reduce ? [0.12, 0.12] : [0.55, 0.08]
  );
  // Halo atras da midia cresce junto: a tela acendendo.
  const glow = useTransform(
    scrollYProgress,
    [0, 1],
    reduce ? [0.55, 0.55] : [0.12, 0.7]
  );

  return (
    // Pista de rolagem. O palco sticky expande a midia ao longo dela; ao chegar
    // ao fim, a midia esta cheia e o fluxo normal (indice de widgets) segue.
    <div ref={ref} className="relative h-[200vh]">
      <div className="sticky top-0 flex h-[100dvh] w-full items-center justify-center overflow-hidden px-6">
        {/* Halo. */}
        <motion.div
          aria-hidden
          style={{ opacity: glow }}
          className="pointer-events-none absolute left-1/2 top-1/2 h-[30rem] w-[54rem] max-w-[92%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] bg-white/[0.14] blur-[130px]"
        />

        {/* Titulo em duas linhas que se abrem. Fica atras da midia (z baixo)
            para a captura passar por cima ao alargar. Semanticamente um h2 so. */}
        <motion.h2
          style={{ opacity: titleOpacity }}
          className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 text-center"
        >
          <motion.span
            style={{ x: leftX }}
            className="block text-balance text-4xl font-semibold tracking-[-0.03em] text-[#FAFAFA] sm:text-6xl lg:text-7xl"
          >
            {titleTop}
          </motion.span>
          <motion.span
            style={{ x: rightX }}
            className="block text-balance text-4xl font-semibold tracking-[-0.03em] text-[#FAFAFA] sm:text-6xl lg:text-7xl"
          >
            {titleBottom}
          </motion.span>
        </motion.h2>

        {/* A midia. width/height animam; o Image em fill sempre recobre. */}
        <motion.div
          style={{ width, height, borderRadius: radius }}
          className="relative z-10 max-h-[82vh] w-full max-w-[94vw] overflow-hidden border border-white/[0.12] bg-ink-900 shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)]"
        >
          <Image
            src={mediaSrc}
            alt={mediaAlt}
            fill
            sizes="94vw"
            quality={90}
            className="object-cover object-top"
            draggable={false}
          />
          {/* Realce especular no topo da moldura. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-8 top-0 z-10 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"
          />
          {/* Escurecimento que abre conforme cresce. */}
          <motion.div
            aria-hidden
            style={{ opacity: overlay }}
            className="pointer-events-none absolute inset-0 bg-black"
          />
        </motion.div>
      </div>
    </div>
  );
}
