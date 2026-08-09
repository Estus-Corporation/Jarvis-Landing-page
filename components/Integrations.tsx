"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useReducedMotionSafe } from "@/components/ui/use-reduced-motion-safe";
import SectionEyebrow from "@/components/ui/section-eyebrow";

// SECAO RECONSTRUIDA DO ZERO — antes eram duas esteiras de chips correndo.
//
// Ideia nova: um HUB ORBITAL. No centro, o nucleo do Jarvis (a marca de 4
// pontos, pulsando como um radar). Em volta, dois aneis giram devagar em
// sentidos opostos, com os logos dos apps orbitando o nucleo. Cada logo se
// liga ao centro por um "raio" — a leitura e literal: tudo gira em torno do
// Jarvis, tudo se conecta a ele. Um app fica ativo por vez (auto-play), seu
// raio acende e a legenda embaixo conta o que ele faz.
//
// Em telas pequenas a orbita nao cabe: abaixo de lg cai numa grade simples de
// chips, com a mesma legenda viva. (Mobile ganha tratamento proprio depois.)

type Integration = { name: string; label: string; src: string };

// Anel interno (mais perto do nucleo) e externo. Divididos pra dar duas
// velocidades e sentidos, criando profundidade.
const innerRing: Integration[] = [
  { name: "Chrome", label: "navega, abre abas e busca por você", src: "/brands/google-chrome.svg" },
  { name: "Spotify", label: "toca no aparelho que você pedir", src: "/brands/spotify.svg" },
  { name: "WhatsApp", label: "envia mensagens ditadas por você", src: "/brands/whatsapp.svg" },
  { name: "PowerShell", label: "executa comandos de terminal", src: "/brands/powershell.svg" },
];

const outerRing: Integration[] = [
  { name: "GitHub", label: "clona repositórios e roda Git", src: "/brands/github.svg" },
  { name: "YouTube", label: "pausa e comanda o vídeo no Chrome", src: "/brands/youtube.svg" },
  { name: "Windows", label: "abre e fecha programas", src: "/brands/windows.svg" },
  { name: "Steam", label: "detecta o jogo em execução", src: "/brands/steam.svg" },
  { name: "Google", label: "pesquisa na web em tempo real", src: "/brands/google.svg" },
];

const ALL = [...innerRing, ...outerRing];

const AUTOPLAY_MS = 2600;

// Marca de 4 pontos do Jarvis (mesma do header/footer), ampliada como nucleo.
function CoreMark() {
  return (
    <div className="relative flex h-11 w-11 items-center justify-center" aria-hidden>
      <span className="absolute left-1/2 top-0 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-white shadow-[0_0_8px_2px_rgba(255,255,255,0.5)]" />
      <span className="absolute left-0 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-white shadow-[0_0_8px_2px_rgba(255,255,255,0.5)]" />
      <span className="absolute right-0 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-white shadow-[0_0_8px_2px_rgba(255,255,255,0.5)]" />
      <span className="absolute bottom-0 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-white shadow-[0_0_8px_2px_rgba(255,255,255,0.5)]" />
    </div>
  );
}

// Um logo posicionado na orbita. Tres camadas, cada uma com UMA
// responsabilidade de transform, pra nenhuma pisar na outra:
//  - wrapper (0x0, ancorado no centro): rotate(angle) translateX(R) posiciona
//    o node no anel. Herda a rotacao continua do anel → o node revoluciona.
//  - counter: translate(-50%,-50%) centra o node no ponto + rotate(-angle)
//    cancela a inclinacao estatica do wrapper.
//  - spinner (spinClass): contra-gira a rotacao CONTINUA do anel, entao o
//    logo fica sempre em pe enquanto tudo gira. Duracao igual a do anel.
// O raio (spoke) mora no wrapper (nao contra-gira): aponta sempre pro centro.
function OrbitNode({
  item,
  angle,
  radius,
  spinClass,
  active,
  onActivate,
}: {
  item: Integration;
  angle: number;
  radius: number;
  spinClass: string;
  active: boolean;
  onActivate: (i: Integration) => void;
}) {
  return (
    <div
      className="absolute left-1/2 top-1/2 h-0 w-0"
      style={{
        transform: `rotate(${angle}deg) translateX(${radius}px)`,
        transformOrigin: "0 0",
      }}
    >
      {/* Raio do node ate o centro. */}
      <span
        aria-hidden
        className={`absolute right-0 top-0 h-px transition-all duration-500 ${
          active
            ? "bg-gradient-to-l from-white/70 to-transparent"
            : "bg-gradient-to-l from-white/15 to-transparent"
        }`}
        style={{ width: radius }}
      />
      {/* Pulso de luz viajando pelo raio, so no ativo. */}
      {active && (
        <span
          aria-hidden
          className="beam-sweep absolute right-0 top-0 h-px w-8 -translate-y-px bg-gradient-to-l from-white to-transparent"
          style={{ width: radius * 0.4 }}
        />
      )}

      <div
        className="absolute left-0 top-0"
        style={{ transform: `translate(-50%, -50%) rotate(${-angle}deg)` }}
      >
        <div className={`${spinClass} group-hover:[animation-play-state:paused]`}>
          <button
            type="button"
            onMouseEnter={() => onActivate(item)}
            onFocus={() => onActivate(item)}
            aria-label={`${item.name}: ${item.label}`}
            className={`glow-ring flex h-16 w-16 items-center justify-center rounded-full border transition-colors duration-300 ${
              active
                ? "glow-ring--active border-white/35 bg-ink-700"
                : "border-white/[0.12] bg-ink-800 hover:border-white/25"
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.src}
              alt=""
              width={26}
              height={26}
              aria-hidden
              className={`h-6 w-6 brightness-0 invert transition-opacity duration-300 ${
                active ? "opacity-100" : "opacity-60 hover:opacity-100"
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Integrations() {
  const reduce = useReducedMotionSafe();
  const [active, setActive] = useState<Integration>(ALL[0]);
  const [paused, setPaused] = useState(false);

  // Auto-play: destaca um app por vez, girando pela lista toda. Para no hover.
  useEffect(() => {
    if (reduce || paused) return;
    const id = setInterval(() => {
      setActive((cur) => {
        const idx = ALL.findIndex((a) => a.name === cur.name);
        return ALL[(idx + 1) % ALL.length];
      });
    }, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [reduce, paused]);

  const handleActivate = React.useCallback((i: Integration) => setActive(i), []);

  const INNER_R = 118;
  const OUTER_R = 210;

  return (
    <section
      id="integracoes"
      // bg-[#0C0C0E]: bg-ink-900 (#0E0E10) escurecido de leve — bg-ink-950
      // (#0A0A0B) e o proximo tom da escala, mas o salto direto ate la ficava
      // forte demais (a secao ficava identica ao fundo puro da pagina), e um
      // ajuste de so ~25% do caminho (#0D0D0F) ficou leve demais no sentido
      // oposto. Este tom fica a ~40% do caminho ate ink-950.
      className="relative overflow-hidden bg-[#0C0C0E] px-6 pb-28 pt-20 sm:pb-36 sm:pt-28 lg:px-10 wide:px-16"
    >
      {/* fundo: grade + halo */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.045) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage:
              "radial-gradient(ellipse 60% 60% at 50% 45%, #000 25%, transparent 100%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 60% 60% at 50% 45%, #000 25%, transparent 100%)",
          }}
        />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-px overflow-hidden">
          <div className="beam-sweep h-full w-32 bg-gradient-to-r from-transparent via-white/80 to-transparent" />
        </div>
      </div>

      <div className="relative mx-auto max-w-6xl wide:max-w-shell">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto max-w-2xl text-center"
        >
          <SectionEyebrow>Integrações</SectionEyebrow>
          <h2 className="mt-5 text-balance font-display text-3xl font-semibold tracking-[-0.02em] text-[#FAFAFA] sm:text-5xl">
            Tudo gira em torno do Jarvis.
          </h2>
          <p className="mx-auto mt-5 max-w-[52ch] text-lg font-light leading-relaxed text-white/55">
            Seus apps não ficam soltos. Eles orbitam um só cérebro — você diz o
            que quer e o Jarvis aciona o certo, na hora.
          </p>
        </motion.div>

        {/* ---- HUB ORBITAL (lg+) ---- */}
        <motion.div
          initial={reduce ? false : { opacity: 0, scale: 0.94 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          className="group relative mx-auto mt-16 hidden h-[520px] w-[520px] lg:block"
        >
          {/* trilhas dos aneis (circulos guia) */}
          <div
            aria-hidden
            className="absolute left-1/2 top-1/2 rounded-full border border-white/[0.06]"
            style={{
              width: INNER_R * 2,
              height: INNER_R * 2,
              transform: "translate(-50%, -50%)",
            }}
          />
          <div
            aria-hidden
            className="absolute left-1/2 top-1/2 rounded-full border border-white/[0.05]"
            style={{
              width: OUTER_R * 2,
              height: OUTER_R * 2,
              transform: "translate(-50%, -50%)",
            }}
          />

          {/* nucleo */}
          <div className="absolute left-1/2 top-1/2 z-10 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-ink-800 shadow-[0_0_50px_-8px_rgba(255,255,255,0.35)]">
            <div className="absolute inset-0 rounded-full border border-white/30 core-ping" aria-hidden />
            <div className="absolute inset-0 rounded-full border border-white/20 core-ping" style={{ animationDelay: "1.7s" }} aria-hidden />
            <CoreMark />
          </div>

          {/* anel interno */}
          <div className="orbit-spin absolute inset-0 group-hover:[animation-play-state:paused]">
            {innerRing.map((item, i) => (
              <OrbitNode
                key={item.name}
                item={item}
                angle={(360 / innerRing.length) * i}
                radius={INNER_R}
                spinClass="orbit-spin-rev"
                active={active.name === item.name}
                onActivate={handleActivate}
              />
            ))}
          </div>

          {/* anel externo */}
          <div className="orbit-spin-2 absolute inset-0 group-hover:[animation-play-state:paused]">
            {outerRing.map((item, i) => (
              <OrbitNode
                key={item.name}
                item={item}
                angle={(360 / outerRing.length) * i + 36}
                radius={OUTER_R}
                spinClass="orbit-spin-2-rev"
                active={active.name === item.name}
                onActivate={handleActivate}
              />
            ))}
          </div>
        </motion.div>

        {/* ---- GRADE (abaixo de lg) ---- */}
        <div className="mt-14 flex flex-wrap justify-center gap-3 lg:hidden">
          {ALL.map((item) => (
            <button
              key={item.name}
              type="button"
              onMouseEnter={() => handleActivate(item)}
              onFocus={() => handleActivate(item)}
              aria-label={`${item.name}: ${item.label}`}
              className={`glow-ring flex h-16 w-16 items-center justify-center rounded-full border transition-colors duration-300 ${
                active.name === item.name
                  ? "glow-ring--active border-white/35 bg-ink-700"
                  : "border-white/[0.12] bg-ink-800"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.src}
                alt=""
                width={26}
                height={26}
                aria-hidden
                className="h-6 w-6 brightness-0 invert"
              />
            </button>
          ))}
        </div>

        {/* legenda viva */}
        <div className="mt-10 flex min-h-[3.25rem] items-center justify-center px-4">
          <AnimatePresence mode="wait">
            <motion.p
              key={active.name}
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
              className="text-center text-lg font-light text-white/60"
              aria-live="polite"
            >
              <span className="font-display font-semibold text-[#FAFAFA]">
                {active.name}
              </span>{" "}
              {active.label}
            </motion.p>
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
}
