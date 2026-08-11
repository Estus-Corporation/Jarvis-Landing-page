"use client";

import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { useReducedMotionSafe } from "@/components/ui/use-reduced-motion-safe";
import {
  Microphone,
  AppWindow,
  Terminal,
  ChatCircleText,
  Eye,
  Brain,
  Waveform,
  Headset,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";

// Esteira de recursos, movida da secao de Precos pra servir de divisoria logo
// abaixo da Hero: primeiro contato com a lista de recursos, antes mesmo da
// secao de Recursos em si. So icone + rotulo, sem cartao — mesmo espirito das
// faixas de "frete gratis" que lojas rodam no topo/rodape.
const included: { icon: Icon; label: string }[] = [
  { icon: Microphone, label: "Ativação por voz e atalho global" },
  { icon: AppWindow, label: "Controle de navegador e programas" },
  { icon: Terminal, label: "Terminal, Git e automações de dev" },
  { icon: ChatCircleText, label: "Integração com Spotify e WhatsApp" },
  { icon: Eye, label: "Visão de tela e detecção de jogos" },
  { icon: Brain, label: "Memória persistente ilimitada" },
  { icon: Waveform, label: "Voz clonada, a sua própria voz" },
  { icon: Headset, label: "Suporte prioritário" },
];

function TickerItem({
  item,
  clone = false,
}: {
  item: { icon: Icon; label: string };
  clone?: boolean;
}) {
  const Glyph = item.icon;
  return (
    <div
      aria-hidden={clone || undefined}
      className="flex shrink-0 items-center gap-2.5 px-6"
    >
      <Glyph size={13} weight="bold" className="shrink-0 text-white/30" aria-hidden />
      <span className="whitespace-nowrap text-xs font-medium uppercase tracking-[0.12em] text-white/55">
        {item.label}
      </span>
      <span className="text-[0.7rem] text-white/20" aria-hidden>
        ◆
      </span>
    </div>
  );
}

// Esteira continua: duas copias identicas lado a lado, anda -50%, o corte do
// loop fica invisivel.
function IncludedTrack() {
  const REPEAT = 4;
  const half = Array.from({ length: REPEAT }, (_, r) =>
    included.map((item) => ({ ...item, key: `${r}-${item.label}` }))
  ).flat();

  return (
    <div
      className="relative flex overflow-hidden"
      style={{
        maskImage:
          "linear-gradient(to right, transparent, #000 6%, #000 94%, transparent)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent, #000 6%, #000 94%, transparent)",
      }}
    >
      <div className="group/track flex shrink-0 animate-ticker hover:[animation-play-state:paused]">
        {half.map((item) => (
          <TickerItem key={item.key} item={item} />
        ))}
        {half.map((item) => (
          <TickerItem key={`dup-${item.key}`} item={item} clone />
        ))}
      </div>
    </div>
  );
}

export default function FeatureTicker() {
  const reduce = useReducedMotionSafe();

  // Gate igual ao de Organization.tsx: a esteira troca a ARVORE renderizada
  // (chips duplicados pra loop vs. lista unica), entao so decide qual versao
  // mostrar depois de montar no cliente.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const staticList = mounted && reduce;

  return (
    <div className="relative overflow-hidden border-y border-white/[0.08] bg-ink-950 py-4">
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        {staticList ? (
          <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-x-2 gap-y-3 px-6">
            {included.map((item) => (
              <TickerItem key={item.label} item={item} />
            ))}
          </div>
        ) : (
          <IncludedTrack />
        )}
      </motion.div>
    </div>
  );
}
