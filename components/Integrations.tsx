"use client";

import React from "react";
import { motion, useReducedMotion } from "motion/react";

// Marcas que o Jarvis realmente aciona, extraidas do contexto do produto.
// Logos em branco puro (filtro) para respeitar o sistema monocromatico.
type Integration = { name: string; label: string; src: string };

const controls: Integration[] = [
  { name: "Spotify", label: "Música em qualquer aparelho", src: "/brands/spotify.svg" },
  { name: "YouTube", label: "Pausa e comanda no Chrome", src: "/brands/youtube.svg" },
  { name: "Google Chrome", label: "Navega e abre abas", src: "/brands/google-chrome.svg" },
  { name: "Google", label: "Pesquisa na web em tempo real", src: "/brands/google.svg" },
  { name: "GitHub", label: "Clona repositórios e roda Git", src: "/brands/github.svg" },
  { name: "WhatsApp", label: "Envia mensagens por você", src: "/brands/whatsapp.svg" },
  { name: "Steam", label: "Detecta o jogo em execução", src: "/brands/steam.svg" },
  { name: "PowerShell", label: "Executa comandos de terminal", src: "/brands/powershell.svg" },
  { name: "Windows", label: "Abre e fecha programas", src: "/brands/windows.svg" },
];

const brains: Integration[] = [
  { name: "OpenAI", label: "Modo rápido, latência mínima", src: "/brands/openai.svg" },
  { name: "Anthropic", label: "Modo inteligente, raciocínio", src: "/brands/anthropic.svg" },
  { name: "ElevenLabs", label: "Voz clonada de alta qualidade", src: "/brands/elevenlabs.svg" },
];

function Tile({ item, delay }: { item: Integration; delay: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.5, delay: reduce ? 0 : delay, ease: [0.16, 1, 0.3, 1] }}
      className="group relative flex flex-col items-center gap-4 overflow-hidden rounded-card border border-white/[0.08] bg-ink-900/70 px-4 py-8 text-center backdrop-blur-sm transition-colors duration-300 hover:border-white/25 hover:bg-ink-800"
    >
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="flex h-11 w-11 items-center justify-center">
        <img
          src={item.src || "/placeholder.svg"}
          alt={item.name}
          width={40}
          height={40}
          className="h-9 w-9 shrink-0 opacity-65 brightness-0 invert transition-all duration-300 group-hover:scale-110 group-hover:opacity-100"
        />
      </div>
      <div>
        <p className="text-sm font-medium text-[#FAFAFA]">{item.name}</p>
        <p className="mx-auto mt-1 max-w-[18ch] text-xs leading-relaxed text-white/40">
          {item.label}
        </p>
      </div>
    </motion.div>
  );
}

export default function Integrations() {
  const reduce = useReducedMotion();

  return (
    <section id="integracoes" className="relative overflow-hidden bg-ink-950 px-6 py-28 sm:py-36">
      {/* Fundo em camadas: grade fina que some nas bordas + halo suave no topo.
          Mascara radial evita a "grade infinita" que parecia bug antes. */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.045) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage:
              "radial-gradient(ellipse 75% 55% at 50% 0%, #000 30%, transparent 100%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 75% 55% at 50% 0%, #000 30%, transparent 100%)",
          }}
        />
        <div className="absolute left-1/2 top-0 h-[440px] w-[880px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-white/[0.05] blur-[130px]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      </div>

      <div className="relative mx-auto max-w-shell">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-white/35">
            Integrações
          </span>
          <h2 className="mt-4 text-balance text-3xl font-semibold tracking-[-0.02em] text-[#FAFAFA] sm:text-5xl">
            Ele já fala com os seus apps.
          </h2>
          <p className="mx-auto mt-5 max-w-[52ch] text-lg font-light leading-relaxed text-white/55">
            Sem clicar, sem caçar janela. Você diz o que quer e o Jarvis aciona
            o app certo, no aparelho certo, na hora.
          </p>
        </motion.div>

        <div className="mt-16">
          <h3 className="text-center text-sm font-medium uppercase tracking-[0.15em] text-white/35">
            Controla os seus apps
          </h3>
          <div className="mx-auto mt-6 grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-3">
            {controls.map((item, i) => (
              <Tile key={item.name} item={item} delay={i * 0.05} />
            ))}
          </div>
        </div>

        <div className="mt-14">
          <h3 className="text-center text-sm font-medium uppercase tracking-[0.15em] text-white/35">
            O cérebro e a voz por trás
          </h3>
          <div className="mx-auto mt-6 grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3">
            {brains.map((item, i) => (
              <Tile key={item.name} item={item} delay={i * 0.05} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
