"use client";

// FloatingPathsBackground: linhas SVG curvas, cada uma entrando e saindo de
// fase devagar, dando a sensacao de fios de luz correndo por tras do
// conteudo. Adaptado do componente de referencia:
//  - `duration` era Math.random() por linha. Isso nao muda o que vai pro DOM
//    (transition nao vira atributo HTML), mas trocado por uma formula
//    deterministica baseada no indice mesmo assim, pelo mesmo principio que
//    o resto do projeto segue (nada de aleatorio onde nao precisa).
//  - Paleta monocromatica presa ao branco: o site nao tem modo claro, entao
//    o par slate-950/dark:white do original virou so `text-white`.
//  - Respeita reduced motion: em vez do loop infinito, desenha as linhas
//    numa pose parada (sem pathLength/opacity animando).
import React from "react";
import { motion } from "motion/react";
import { useReducedMotionSafe } from "@/components/ui/use-reduced-motion-safe";
import { cn } from "@/lib/utils";

export function FloatingPathsBackground({
  position,
  children,
  className,
}: {
  position: number;
  className?: string;
  children?: React.ReactNode;
}) {
  const reduce = useReducedMotionSafe();

  const paths = Array.from({ length: 36 }, (_, i) => ({
    id: i,
    d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
      380 - i * 5 * position
    } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
      152 - i * 5 * position
    } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
      684 - i * 5 * position
    } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
    width: 0.5 + i * 0.03,
    // 20-30s, espalhado por indice em vez de Math.random().
    duration: 20 + ((i * 7) % 10),
  }));

  return (
    <div className={cn("relative w-full", className)}>
      <div className="pointer-events-none absolute inset-0">
        <svg
          className="h-full w-full text-white"
          viewBox="0 0 696 316"
          fill="none"
          preserveAspectRatio="none"
        >
          {paths.map((path) => (
            <motion.path
              key={path.id}
              d={path.d}
              stroke="currentColor"
              strokeWidth={path.width}
              strokeOpacity={0.1 + path.id * 0.03}
              initial={reduce ? undefined : { pathLength: 0.3, opacity: 0.6 }}
              animate={
                reduce
                  ? undefined
                  : {
                      pathLength: 1,
                      opacity: [0.3, 0.6, 0.3],
                      pathOffset: [0, 1, 0],
                    }
              }
              transition={{
                duration: path.duration,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          ))}
        </svg>
      </div>
      {children}
    </div>
  );
}
