"use client";

import { motion } from "motion/react";
import { useReducedMotionSafe } from "@/components/ui/use-reduced-motion-safe";
import SectionEyebrow from "@/components/ui/section-eyebrow";
import { Keyboard, TextAa, Eye } from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";

// SECAO RECONSTRUIDA DO ZERO (2a vez) — antes era um hub orbital (aneis
// girando com auto-play, ver historico do arquivo). Trocado por um GRID DE
// RECURSOS: duas colunas de itens (icone + titulo + descricao) flanqueando um
// nucleo central estatico — a leitura vira "tudo aponta pro Jarvis" sem
// depender de animacao continua nem de interacao pra entender a secao.
// Embaixo, dois cartoes largos para as duas capacidades que nao sao um app de
// terceiro (ver a tela, mandar mensagem). Layout inspirado num print de
// referencia trazido pelo usuario.

type Item = { title: string; desc: string; brand?: string; icon?: Icon };

const leftItems: Item[] = [
  {
    title: "Windows",
    desc: "Controla ações, configurações e recursos do sistema com comandos de voz.",
    brand: "/brands/windows.svg",
  },
  {
    title: "YouTube",
    desc: "Pesquisa, abre e reproduz vídeos no YouTube rapidamente para você.",
    brand: "/brands/youtube.svg",
  },
  {
    title: "Chrome",
    desc: "Navega, abre abas, preenche formulários e executa ações no navegador.",
    brand: "/brands/google-chrome.svg",
  },
  {
    title: "Google",
    desc: "Realiza pesquisas, encontra informações e entrega respostas precisas.",
    brand: "/brands/google.svg",
  },
];

const rightItems: Item[] = [
  {
    title: "Spotify",
    desc: "Toca, pausa, pula faixas e controla suas playlists e músicas favoritas.",
    brand: "/brands/spotify.svg",
  },
  {
    title: "Git",
    desc: "Executa comandos Git, gerencia repositórios e auxilia no seu fluxo de trabalho.",
    brand: "/brands/github.svg",
  },
  {
    title: "Digitar por você",
    desc: "Escreve textos, códigos e comandos automaticamente onde você precisar.",
    icon: Keyboard,
  },
  {
    title: "Leitura de tela",
    desc: "Lê e interpreta o que está na tela, trazendo mais acessibilidade e produtividade.",
    icon: TextAa,
  },
];

const ALL_ITEMS = [...leftItems, ...rightItems];

const bigCards: Item[] = [
  {
    title: "Vê o que está na sua tela",
    desc: "Enxerga e entende tudo o que aparece na sua tela em tempo real.",
    icon: Eye,
  },
  {
    title: "Manda mensagem no WhatsApp",
    desc: "Envia mensagens no WhatsApp por você, de forma rápida e prática.",
    brand: "/brands/whatsapp.svg",
  },
];

function ItemGlyph({ item, size = 20 }: { item: Item; size?: number }) {
  if (item.brand) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={item.brand}
        alt=""
        width={size}
        height={size}
        aria-hidden
        className="opacity-80 brightness-0 invert transition-opacity duration-300 group-hover:opacity-100"
        style={{ height: size, width: size }}
      />
    );
  }
  const Glyph = item.icon!;
  return (
    <Glyph
      size={size}
      weight="light"
      aria-hidden
      className="text-white/70 transition-colors duration-300 group-hover:text-white/95"
    />
  );
}

function FeatureRow({ item, delay }: { item: Item; delay: number }) {
  const reduce = useReducedMotionSafe();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.6 }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      className="group flex items-start gap-4 rounded-card border border-transparent px-2 py-2 transition-colors duration-300 hover:border-white/[0.08] hover:bg-white/[0.02]"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/[0.12] bg-ink-800 transition-colors duration-300 group-hover:border-white/25">
        <ItemGlyph item={item} />
      </span>
      <span className="min-w-0 pt-1">
        <span className="block font-display text-[0.95rem] font-semibold tracking-[-0.01em] text-white/90">
          {item.title}
        </span>
        <span className="mt-1 block text-sm leading-relaxed text-white/45">
          {item.desc}
        </span>
      </span>
    </motion.div>
  );
}

function BigCard({ item, delay }: { item: Item; delay: number }) {
  const reduce = useReducedMotionSafe();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      className="glow-ring group relative flex items-center gap-5 overflow-hidden rounded-card border border-white/[0.1] bg-ink-900/60 px-6 py-6 transition-colors duration-300 hover:border-white/20"
    >
      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-chip border border-white/[0.12] bg-ink-800">
        <ItemGlyph item={item} size={24} />
      </span>
      <span className="min-w-0">
        <span className="block font-display text-sm font-semibold uppercase tracking-[0.08em] text-white">
          {item.title}
        </span>
        <span className="mt-1.5 block max-w-[38ch] text-sm leading-relaxed text-white/50">
          {item.desc}
        </span>
      </span>
    </motion.div>
  );
}

// Marca de 4 pontos do Jarvis (mesma do header/footer), como nucleo flutuando
// acima da placa hexagonal.
function CoreMark() {
  return (
    <div className="relative flex h-full w-full items-center justify-center" aria-hidden>
      <span className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 rounded-full bg-white shadow-[0_0_8px_2px_rgba(255,255,255,0.5)]" />
      <span className="absolute left-0 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_8px_2px_rgba(255,255,255,0.5)]" />
      <span className="absolute right-0 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_8px_2px_rgba(255,255,255,0.5)]" />
      <span className="absolute bottom-0 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-white shadow-[0_0_8px_2px_rgba(255,255,255,0.5)]" />
    </div>
  );
}

// Nucleo visual do meio: nucleo de 4 pontos flutuando, um feixe de luz
// descendo e uma placa hexagonal facetada recebendo a luz — estatico (sem
// rotacao continua), so com o ping do nucleo e o brilho da placa "respirando".
// A placa e um <svg> em vez de clip-path porque precisa das linhas de aresta
// (hexagono externo -> hexagono interno) alem do contorno.
function CoreHex() {
  return (
    <div className="relative flex w-56 flex-col items-center sm:w-64 lg:w-72">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-full bg-white/[0.06] blur-[70px]"
      />

      <div className="relative z-10 h-14 w-14 lg:h-16 lg:w-16">
        <div className="absolute inset-0 rounded-full border border-white/25 core-ping" aria-hidden />
        <div
          className="absolute inset-0 rounded-full border border-white/15 core-ping"
          style={{ animationDelay: "1.7s" }}
          aria-hidden
        />
        <CoreMark />
      </div>

      <div className="h-8 w-px bg-gradient-to-b from-white/50 to-transparent lg:h-10" aria-hidden />

      <div className="relative w-full">
        <div
          aria-hidden
          className="absolute left-1/2 top-0 h-6 w-24 -translate-x-1/2 rounded-full bg-white/25 blur-xl animate-pulse"
        />
        <svg viewBox="0 0 260 160" className="relative w-full" aria-hidden>
          <defs>
            <radialGradient id="jarvis-plate-glow" cx="50%" cy="30%" r="75%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.10)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </radialGradient>
          </defs>
          <polygon
            points="65,10 195,10 250,80 195,150 65,150 10,80"
            fill="url(#jarvis-plate-glow)"
            stroke="rgba(255,255,255,0.16)"
            strokeWidth="1"
          />
          <polygon
            points="91,38 169,38 202,80 169,122 91,122 58,80"
            fill="none"
            stroke="rgba(255,255,255,0.24)"
            strokeWidth="1"
          />
          <line x1="65" y1="10" x2="91" y2="38" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
          <line x1="195" y1="10" x2="169" y2="38" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
          <line x1="250" y1="80" x2="202" y2="80" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
          <line x1="195" y1="150" x2="169" y2="122" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
          <line x1="65" y1="150" x2="91" y2="122" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
          <line x1="10" y1="80" x2="58" y2="80" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
        </svg>
      </div>
    </div>
  );
}

export default function Integrations() {
  const reduce = useReducedMotionSafe();

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
            Tudo que você precisa. Em um só lugar.
          </h2>
          <p className="mx-auto mt-5 max-w-[52ch] text-lg font-light leading-relaxed text-white/55">
            O Jarvis conecta, automatiza e executa tarefas para você. Conheça
            tudo o que ele é capaz de fazer.
          </p>
        </motion.div>

        {/* ---- lg+: duas colunas flanqueando o nucleo ---- */}
        <div className="mt-16 hidden lg:grid lg:grid-cols-[1fr_auto_1fr] lg:items-center lg:gap-10 xl:gap-16">
          <div className="flex flex-col gap-2">
            {leftItems.map((item, i) => (
              <FeatureRow key={item.title} item={item} delay={i * 0.07} />
            ))}
          </div>

          <motion.div
            initial={reduce ? false : { opacity: 0, scale: 0.94 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <CoreHex />
          </motion.div>

          <div className="flex flex-col gap-2">
            {rightItems.map((item, i) => (
              <FeatureRow key={item.title} item={item} delay={i * 0.07} />
            ))}
          </div>
        </div>

        {/* ---- abaixo de lg: nucleo em cima, grade de 2 colunas embaixo ---- */}
        <div className="mt-14 lg:hidden">
          <motion.div
            initial={reduce ? false : { opacity: 0, scale: 0.94 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex justify-center"
          >
            <CoreHex />
          </motion.div>

          <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-4">
            {ALL_ITEMS.map((item, i) => (
              <FeatureRow key={item.title} item={item} delay={i * 0.05} />
            ))}
          </div>
        </div>

        {/* ---- cartoes largos: capacidades sem logo de terceiro ---- */}
        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {bigCards.map((item, i) => (
            <BigCard key={item.title} item={item} delay={i * 0.1} />
          ))}
        </div>
      </div>
    </section>
  );
}
