"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  motion,
  useTransform,
  useScroll,
  useSpring,
  type MotionValue,
} from "motion/react";
import { cn } from "@/lib/utils";

// Ponto + trilha SVG de um lado (esquerdo ou direito). Extraido pra nao
// duplicar o JSX inteiro quando a barra aparece dos dois lados espelhada —
// os dois lados compartilham o MESMO progresso de scroll, path e gradiente
// (calculados uma vez em TracingBeam), so a posicao e o espelhamento mudam.
function Beam({
  scrollYProgress,
  pathD,
  y1,
  y2,
  svgHeight,
  positionClassName,
  gradientId,
  mirror = false,
  svgRef,
}: {
  scrollYProgress: MotionValue<number>;
  pathD: string;
  y1: MotionValue<number>;
  y2: MotionValue<number>;
  svgHeight: number;
  positionClassName: string;
  gradientId: string;
  mirror?: boolean;
  svgRef?: React.Ref<SVGSVGElement>;
}) {
  return (
    <div className={cn("absolute top-3 z-10", positionClassName)}>
      {/* Bolinha e trilha dividem o MESMO sistema de coordenadas (este
          wrapper "relative"): `left: NORMAL_X` + `-translate-x-1/2
          -translate-y-1/2` centraliza a bolinha exatamente onde a linha
          comeca (x=NORMAL_X, y=0). `scaleX(-1)` no lado direito espelha o
          conjunto inteiro (bolinha + degraus) em torno do proprio eixo,
          sem precisar recalcular nada. */}
      <div className="relative" style={mirror ? { transform: "scaleX(-1)" } : undefined}>
        <motion.div
          transition={{
            duration: 0.2,
            delay: 0.5,
          }}
          animate={{
            boxShadow:
              scrollYProgress.get() > 0
                ? "none"
                : "rgba(0, 0, 0, 0.24) 0px 3px 8px",
          }}
          style={{ left: 1 }}
          className="absolute top-0 flex h-4 w-4 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 shadow-sm"
        >
          <motion.div
            transition={{
              duration: 0.2,
              delay: 0.5,
            }}
            animate={{
              backgroundColor:
                scrollYProgress.get() > 0
                  ? "rgba(255,255,255,0.15)"
                  : "rgba(250,250,250,0.95)",
              borderColor:
                scrollYProgress.get() > 0
                  ? "rgba(255,255,255,0.25)"
                  : "rgba(250,250,250,0.6)",
            }}
            className="h-2 w-2 rounded-full border bg-white"
          />
        </motion.div>
        <svg
          ref={svgRef}
          viewBox={`0 0 20 ${svgHeight}`}
          width="20"
          height={svgHeight}
          className="block"
          aria-hidden="true"
        >
          <motion.path
            d={pathD}
            fill="none"
            stroke="#FAFAFA"
            strokeOpacity="0.3"
            strokeWidth="1.5"
            transition={{
              duration: 10,
            }}
          ></motion.path>
          <motion.path
            d={pathD}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth="2.5"
            className="motion-reduce:hidden"
            transition={{
              duration: 10,
            }}
          ></motion.path>
          <defs>
            <motion.linearGradient
              id={gradientId}
              gradientUnits="userSpaceOnUse"
              x1="0"
              x2="0"
              y1={y1}
              y2={y2}
            >
              <stop stopColor="#FAFAFA" stopOpacity="0"></stop>
              <stop stopColor="#FAFAFA"></stop>
              <stop offset="0.5" stopColor="#FAFAFA" stopOpacity="0.7"></stop>
              <stop offset="1" stopColor="#FAFAFA" stopOpacity="0"></stop>
            </motion.linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}

// Adaptado do TracingBeam (aceternity ui): mesmo mecanismo (uma trilha SVG do
// tamanho do conteudo inteiro, com um trecho em gradiente que "viaja" por ela
// conforme o scroll), mas:
//  - importa de "motion/react" em vez de "framer-motion" — o projeto ja usa o
//    pacote "motion" em todo lugar (Roadmap.tsx, animacoes de secao etc.), e
//    trazer framer-motion junto so duplicaria a mesma biblioteca.
//  - gradiente e ponto sem cor: o site inteiro segue um sistema monocromatico
//    de proposito (ver comentario em tailwind.config.ts), entao o
//    verde/ciano/roxo originais viraram opacidades de branco.
//  - wrapper sem "max-w-4xl mx-auto": aqui o uso e uma unica barra global
//    cobrindo a largura cheia da pagina, nao uma coluna de blog estreita.
export const TracingBeam = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const contentRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [svgHeight, setSvgHeight] = useState(0);
  // Um degrauzinho a cada troca de secao: a altura de cada filho direto de
  // `children` (Recursos, Integracoes, Showcase, Roadmap...) vira um "y" de
  // corte no caminho do SVG, alternando a trilha entre a posicao normal
  // (x=1) e a deslocada (x=19) a cada corte — volta ao normal na proxima,
  // e assim por diante.
  const [boundaries, setBoundaries] = useState<number[]>([]);

  useEffect(() => {
    if (contentRef.current && svgRef.current) {
      // O wrapper do svg tem "top-3" (12px) — entao o svg comeca uns pixels
      // mais abaixo do que o topo do conteudo (`contentRef`). Como
      // `section.offsetTop` e medido a partir do topo do CONTEUDO (que nao
      // tem esse deslocamento), desenhar os cortes direto nesses valores os
      // jogava sistematicamente mais abaixo do que a divisao real das
      // secoes. Aqui descontamos a diferenca entre os dois topos ANTES de
      // guardar os valores, entao o resto do calculo do caminho nao precisa
      // saber que essa diferenca existe.
      const offset =
        svgRef.current.getBoundingClientRect().top -
        contentRef.current.getBoundingClientRect().top;
      setSvgHeight(contentRef.current.offsetHeight - offset);
      const sections = Array.from(contentRef.current.children) as HTMLElement[];
      // O primeiro filho comeca em y=0 (nao e uma "transicao"), entao so os
      // demais viram pontos de degrau.
      setBoundaries(
        sections.slice(1).map((section) => section.offsetTop - offset)
      );
    }
  }, []);

  // O chanfro diagonal acontece ANTES do vao (termina exatamente onde o vao
  // comeca, ja na posicao alternada) — e nao escondido dentro dele. Do outro
  // lado do vao a linha retoma reta, sem diagonal ali; o proximo chanfro so
  // aparece mais pra frente, perto da fronteira seguinte. E o desenho que
  // foi pedido: desce reto, chanfra, para; vao; retoma reto do outro lado.
  const NORMAL_X = 1;
  const STEP_X = 19;
  const GAP = 15;
  const CHAMFER_HEIGHT = 24;
  const pathD = React.useMemo(() => {
    let x = NORMAL_X;
    let d = `M ${x} 0`;
    for (let i = 0; i < boundaries.length; i++) {
      const nextX = x === NORMAL_X ? STEP_X : NORMAL_X;
      const gapStart = boundaries[i] - GAP;
      d += ` V ${gapStart - CHAMFER_HEIGHT} l ${nextX - x} ${CHAMFER_HEIGHT}`;
      d += ` M ${nextX} ${boundaries[i] + GAP}`;
      x = nextX;
    }
    d += ` V ${svgHeight}`;
    return d;
  }, [boundaries, svgHeight]);

  // y1 e y2 comecavam os DOIS em 50: no scroll 0 (o estado inicial, o que
  // toda visita ve primeiro) o gradiente ficava degenerado (inicio e fim no
  // mesmo ponto), o que o SVG trata como cor solida do ULTIMO stop — que e
  // transparente. Resultado: nenhum trecho colorido visivel ate a pessoa
  // rolar. Com 0 e 140 de folga, ja existe um trecho aceso perto do topo
  // antes mesmo do primeiro scroll.
  const y1 = useSpring(
    useTransform(scrollYProgress, [0, 0.8], [0, svgHeight]),
    {
      stiffness: 500,
      damping: 90,
    }
  );
  const y2 = useSpring(
    useTransform(scrollYProgress, [0, 1], [140, svgHeight - 200]),
    {
      stiffness: 500,
      damping: 90,
    }
  );

  return (
    // isolate: praticamente toda secao da pagina usa position:relative no
    // proprio elemento (sem isolar), entao sem isolar AQUI cada uma delas
    // vira um elemento "posicionado" que, por vir depois no DOM, pinta por
    // cima da trilha (tambem absolute) — a trilha ficava 100% escondida
    // atras de cada secao. Mesmo bug/mesma correcao do fundo da Hero.
    <motion.div
      ref={ref}
      className={cn("relative isolate w-full h-full", className)}
    >
      {/* z-10: dentro do contexto isolado do wrapper, a trilha e cada secao
          (que tambem usa isolate) empatam em z-index:auto — nesse empate,
          quem vem DEPOIS no HTML pinta por cima, e toda secao vem depois da
          trilha. Um z-index explicito tira a trilha desse empate e garante
          que ela fique por cima de qualquer secao, independente da ordem no
          DOM. */}
      <Beam
        scrollYProgress={scrollYProgress}
        pathD={pathD}
        y1={y1}
        y2={y2}
        svgHeight={svgHeight}
        positionClassName="left-3 sm:left-5 lg:left-8"
        gradientId="tracing-beam-gradient-left"
        svgRef={svgRef}
      />
      {/* Segunda trilha, espelhada, do lado direito — mesmo progresso de
          scroll e mesmo caminho da esquerda, so a posicao e o
          espelhamento (scaleX(-1) dentro de Beam) mudam. */}
      <Beam
        scrollYProgress={scrollYProgress}
        pathD={pathD}
        y1={y1}
        y2={y2}
        svgHeight={svgHeight}
        positionClassName="right-3 sm:right-5 lg:right-8"
        gradientId="tracing-beam-gradient-right"
        mirror
      />
      <div ref={contentRef}>{children}</div>
    </motion.div>
  );
};
