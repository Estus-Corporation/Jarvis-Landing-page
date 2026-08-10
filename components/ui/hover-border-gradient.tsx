"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";

// Adaptado do "Hover Border Gradient" (Aceternity UI) pro pacote `motion/react`
// ja usado no projeto (nao `framer-motion`). So a camada de brilho foi
// extraida — um gradiente radial que gira pelas 4 bordas quando ocioso e
// acende num aro branco uniforme no hover. O wrapper com estilo proprio do
// componente original (fundo solido, padding, texto) ficou de fora: o botao
// que usa isso ja tem seu proprio visual.
//
// O "aro" (em vez de um brilho lavando o miolo do botao inteiro) vem de
// mask-composite: exclude — duas copias do mesmo box (content-box e
// border-box, a primeira encolhida por `padding`) se cancelam, sobrando so a
// faixa fina entre elas. Como e uma MASCARA (nao uma cor solida cobrindo o
// centro), o miolo do botao continua de verdade transparente por baixo.
type Direction = "TOP" | "RIGHT" | "BOTTOM" | "LEFT";

const movingMap: Record<Direction, string> = {
  TOP: "radial-gradient(20.7% 50% at 50% 0%, hsl(0, 0%, 100%) 0%, rgba(255, 255, 255, 0) 100%)",
  LEFT: "radial-gradient(16.6% 43.1% at 0% 50%, hsl(0, 0%, 100%) 0%, rgba(255, 255, 255, 0) 100%)",
  BOTTOM:
    "radial-gradient(20.7% 50% at 50% 100%, hsl(0, 0%, 100%) 0%, rgba(255, 255, 255, 0) 100%)",
  RIGHT:
    "radial-gradient(16.2% 41.2% at 100% 50%, hsl(0, 0%, 100%) 0%, rgba(255, 255, 255, 0) 100%)",
};

// Destaque branco (o original usa azul #3275F8) pra caber no sistema
// monocromatico do site — mesma escolha ja feita no brilho do botao antes.
const highlight =
  "radial-gradient(75% 181% at 50% 50%, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0) 100%)";

export function HoverBorderGradient({
  hovered,
  duration = 1,
  clockwise = true,
  ringWidth = 1.25,
}: {
  hovered: boolean;
  duration?: number;
  clockwise?: boolean;
  ringWidth?: number;
}) {
  const [direction, setDirection] = useState<Direction>("BOTTOM");

  useEffect(() => {
    if (hovered) return;
    const directions: Direction[] = ["TOP", "LEFT", "BOTTOM", "RIGHT"];
    const interval = setInterval(() => {
      setDirection((prev) => {
        const currentIndex = directions.indexOf(prev);
        const nextIndex = clockwise
          ? (currentIndex - 1 + directions.length) % directions.length
          : (currentIndex + 1) % directions.length;
        return directions[nextIndex];
      });
    }, duration * 1000);
    return () => clearInterval(interval);
  }, [hovered, duration, clockwise]);

  return (
    <motion.div
      aria-hidden
      className="absolute inset-0 rounded-[inherit]"
      style={{
        padding: ringWidth,
        WebkitMask:
          "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
        WebkitMaskComposite: "xor",
        mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
        maskComposite: "exclude",
      }}
      initial={{ background: movingMap[direction] }}
      animate={{
        background: hovered
          ? [movingMap[direction], highlight]
          : movingMap[direction],
      }}
      transition={{ ease: "linear", duration }}
    />
  );
}
