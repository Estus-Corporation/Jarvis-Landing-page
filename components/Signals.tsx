"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";

// Numeros ancorados no que o produto realmente tem: 12 capacidades listadas em
// Features, os 5 estados de JarvisState, as 2 formas de ativacao descritas no
// fluxo. Nada de "99,9%" ou "24/7" inventado.
const signals = [
  { value: 12, label: "capacidades nativas" },
  { value: 5, label: "estados do assistente" },
  { value: 2, label: "formas de ativar" },
  { value: 1, label: "voz clonada, a sua" },
];

// Contagem crescente do zero ate o valor real quando a barra entra em cena.
// Prova o numero "montando" em vez de so aparecer. Respeita reduced-motion:
// quem pediu menos movimento ja recebe o valor final.
function useCountUp(target: number, active: boolean, reduce: boolean, duration = 1100) {
  const [value, setValue] = useState(reduce ? target : 0);
  useEffect(() => {
    if (reduce) {
      setValue(target);
      return;
    }
    if (!active) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      setValue(Math.round(eased * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, target, reduce, duration]);
  return value;
}

function Stat({
  value,
  label,
  active,
  reduce,
  delay,
}: {
  value: number;
  label: string;
  active: boolean;
  reduce: boolean;
  delay: number;
}) {
  const count = useCountUp(value, active, reduce, 900 + delay * 1400);
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 14 }}
      animate={active ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.5, delay: reduce ? 0 : delay, ease: [0.16, 1, 0.3, 1] }}
      // Divisores em hairline separam os quatro numeros no desktop, dando a
      // fileira uma cadencia de painel em vez de quatro blocos soltos.
      className="flex flex-col px-1 md:px-8 md:[&:not(:first-child)]:border-l md:[&:not(:first-child)]:border-white/[0.08]"
    >
      <span className="font-mono text-4xl font-medium tabular-nums tracking-tight text-[#FAFAFA] sm:text-5xl">
        {count}
      </span>
      <span className="mt-2 text-sm text-white/45">{label}</span>
    </motion.div>
  );
}

export default function Signals() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });

  return (
    <section className="border-y border-white/[0.07] bg-ink-900 px-6 py-16">
      <div
        ref={ref}
        className="mx-auto grid max-w-shell grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4 md:gap-y-0"
      >
        {signals.map((signal, i) => (
          <Stat
            key={signal.label}
            value={signal.value}
            label={signal.label}
            active={inView}
            reduce={!!reduce}
            delay={i * 0.09}
          />
        ))}
      </div>
    </section>
  );
}
