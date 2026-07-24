"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";

// Numeros ancorados no que o produto realmente tem: 12 capacidades listadas em
// Features, os 5 estados de JarvisState, as 2 formas de ativacao descritas no
// fluxo. Nada de "99,9%" ou "24/7" inventado.
//
// Apresentacao assimetrica de proposito. Quatro colunas de igual peso fazem a
// fileira ler como widget de dashboard, que e justamente o que esta pagina nao
// e. Aqui o numero que mais prova o produto domina a composicao e os outros
// tres apoiam num bloco menor, com hairline no topo (mesmo idioma dos pilares
// da secao de voz).
const LEAD = {
  value: 12,
  label: "capacidades nativas",
  note: "Visão de tela, memória, terminal, navegador, música e mensagens, entre outras.",
};

const SUPPORT = [
  { value: 5, label: "estados do assistente" },
  { value: 2, label: "formas de ativar" },
  { value: 1, label: "voz clonada, a sua" },
];

// Contagem crescente do zero ate o valor real quando a faixa entra em cena.
// Motivo da animacao: o numero se montando le como capacidade sendo somada, em
// vez de um dado que sempre esteve ali. Quem pediu menos movimento ja recebe o
// valor final, sem frame nenhum.
function useCountUp(
  target: number,
  active: boolean,
  reduce: boolean,
  duration = 1100
) {
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

function SupportStat({
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
  const count = useCountUp(value, active, reduce, 700);
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 14 }}
      animate={active ? { opacity: 1, y: 0 } : undefined}
      transition={{
        duration: 0.55,
        delay: reduce ? 0 : delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="border-t border-white/[0.1] pt-5"
    >
      <span className="font-mono text-3xl font-medium tabular-nums tracking-tight text-[#FAFAFA] sm:text-4xl">
        {count}
      </span>
      <p className="mt-2 text-sm leading-snug text-white/45">{label}</p>
    </motion.div>
  );
}

export default function Signals() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.35 });
  const lead = useCountUp(LEAD.value, inView, !!reduce, 1200);

  return (
    <section className="relative overflow-hidden border-y border-white/[0.07] bg-ink-900 px-6 py-16 sm:py-20">
      <div
        ref={ref}
        className="mx-auto grid max-w-shell gap-y-12 lg:grid-cols-12 lg:items-center lg:gap-x-16"
      >
        {/* Metrica dominante */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-5"
        >
          <span className="block font-mono text-7xl font-medium leading-[0.85] tabular-nums tracking-tight text-[#FAFAFA] sm:text-8xl">
            {lead}
          </span>
          <p className="mt-5 text-base font-medium text-[#FAFAFA]">
            {LEAD.label}
          </p>
          <p className="mt-2 max-w-[38ch] text-sm leading-relaxed text-white/45">
            {LEAD.note}
          </p>
        </motion.div>

        {/* Trio de apoio */}
        <div className="grid gap-x-8 gap-y-8 sm:grid-cols-3 lg:col-span-7">
          {SUPPORT.map((item, i) => (
            <SupportStat
              key={item.label}
              value={item.value}
              label={item.label}
              active={inView}
              reduce={!!reduce}
              delay={0.12 + i * 0.09}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
