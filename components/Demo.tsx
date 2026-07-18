"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { JarvisOrb, type JarvisState } from "@/components/ui/jarvis-sphere";

const DEMO_STEPS: {
  state: JarvisState;
  duration: number;
  label: string;
  line: string;
}[] = [
  {
    state: "idle",
    duration: 2600,
    label: "Em espera",
    line: "Diga “Jarvis” para começar.",
  },
  {
    state: "listening",
    duration: 2600,
    label: "Ouvindo",
    line: "“Jarvis, pausa o vídeo e abre o VS Code.”",
  },
  {
    state: "thinking",
    duration: 1800,
    label: "Interpretando",
    line: "Decidindo quais ferramentas usar…",
  },
  {
    state: "speaking",
    duration: 3000,
    label: "Respondendo",
    line: "“Pausado, senhor. Abrindo o Visual Studio Code agora.”",
  },
];

// Tamanho da esfera acompanha a largura da coluna onde ela está (via
// ResizeObserver) — fica sempre o maior possível sem estourar o container.
function useOrbSize() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(360);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const compute = () => {
      const w = el.clientWidth;
      const next = Math.round(Math.min(460, Math.max(200, w - 48)));
      setSize(next);
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return { containerRef, size };
}

export default function Demo() {
  const [step, setStep] = useState(0);
  const { containerRef, size: orbSize } = useOrbSize();

  useEffect(() => {
    const timer = setTimeout(
      () => setStep((s) => (s + 1) % DEMO_STEPS.length),
      DEMO_STEPS[step].duration
    );
    return () => clearTimeout(timer);
  }, [step]);

  const current = DEMO_STEPS[step];

  return (
    <section id="demo" className="relative overflow-hidden bg-black px-6 py-28">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.03] blur-[140px]" />

      <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-16 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-[#333] bg-[rgba(31,31,31,0.62)] px-4 py-1.5 text-xs font-medium tracking-wide text-gray-300">
            Demonstração
          </span>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            A mesma esfera do app,
            <br className="hidden sm:block" /> reagindo em tempo real.
          </h2>
          <p className="mt-4 max-w-md text-base font-light text-white/60 sm:text-lg">
            Em espera, ouvindo, interpretando ou respondendo — o Jarvis muda
            de estado visualmente conforme age, então você sempre sabe o que
            ele está fazendo.
          </p>

          <div className="mt-8 flex w-fit items-center gap-3 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2">
            <span className="relative flex h-2.5 w-2.5">
              <span
                className={`absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-40 ${
                  current.state === "idle" ? "hidden" : ""
                }`}
              />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white" />
            </span>
            <AnimatePresence mode="wait">
              <motion.span
                key={current.label}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
                className="text-xs font-medium uppercase tracking-wider text-white/50"
              >
                {current.label}
              </motion.span>
            </AnimatePresence>
          </div>

          <AnimatePresence mode="wait">
            <motion.p
              key={current.line}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="mt-4 max-w-sm text-sm leading-relaxed text-white/60"
            >
              {current.line}
            </motion.p>
          </AnimatePresence>
        </motion.div>

        <motion.div
          ref={containerRef}
          initial={{ opacity: 0, scale: 0.94 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
          className="relative flex items-center justify-center"
        >
          <div className="pointer-events-none absolute h-[70%] w-[70%] rounded-full bg-white/[0.05] blur-3xl" />
          <JarvisOrb state={current.state} sphereSize={orbSize} color={[255, 255, 255]} />
        </motion.div>
      </div>
    </section>
  );
}
