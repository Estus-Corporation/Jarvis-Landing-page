"use client";

import React from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  Globe,
  AppWindow,
  Terminal,
  GithubLogo,
  Eye,
  Brain,
  GameController,
  SlidersHorizontal,
  Microphone,
  Waveform,
  Keyboard,
  CloudSun,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";
import { JarvisOrb } from "@/components/ui/jarvis-sphere";

type Capability = { icon: Icon; title: string; line: string };

// As 12 capacidades agrupadas por intencao, nao despejadas em grid. Um grupo
// responde "o que ele mexe", outro "o que ele sabe", outro "como ele fala".
const machine: Capability[] = [
  { icon: Globe, title: "Navegador", line: "Navega, pausa e comanda o Chrome, inclusive o YouTube." },
  { icon: AppWindow, title: "Programas", line: "Abre, fecha e troca de aplicativo sem procurar o ícone." },
  { icon: Terminal, title: "Terminal", line: "Executa PowerShell e tarefas de desenvolvimento." },
  { icon: GithubLogo, title: "GitHub", line: "Clona repositórios e roda ações Git por voz." },
];

const context: Capability[] = [
  { icon: Eye, title: "Visão de tela", line: "Entende o que está na sua tela e responde sobre aquilo." },
  { icon: Brain, title: "Memória", line: "Lembra do que você contou e usa depois." },
  { icon: GameController, title: "Jogos", line: "Sabe qual jogo está rodando, via Steam ou processo." },
  { icon: SlidersHorizontal, title: "Personalidade", line: "Formal, direto ou do seu jeito, nas configurações." },
];

const voice: Capability[] = [
  { icon: Microphone, title: "Ativação por voz", line: "Palavra de ativação e atalho global configuráveis." },
  { icon: Waveform, title: "Voz clonada", line: "Responde com uma síntese treinada na sua voz." },
  { icon: Keyboard, title: "Digita por você", line: "Digita textos e pressiona teclas sob comando." },
  { icon: CloudSun, title: "Clima e hora", line: "Informa tempo, previsão e horário na hora." },
];

function CapabilityRow({ item }: { item: Capability }) {
  const Glyph = item.icon;
  return (
    <div className="flex gap-3.5">
      <Glyph
        size={20}
        weight="light"
        className="mt-0.5 shrink-0 text-white/70"
        aria-hidden
      />
      <div>
        <h4 className="text-[0.9375rem] font-medium text-[#FAFAFA]">
          {item.title}
        </h4>
        <p className="mt-1 text-sm leading-relaxed text-white/45">{item.line}</p>
      </div>
    </div>
  );
}

function Cell({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: 0.6,
        delay: reduce ? 0 : delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={`rounded-card border border-white/[0.08] p-7 sm:p-9 ${className}`}
    >
      {children}
    </motion.div>
  );
}

export default function Features() {
  const reduce = useReducedMotion();

  return (
    <section id="recursos" className="bg-ink-950 px-6 py-28 sm:py-36">
      <div className="mx-auto max-w-shell">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-2xl"
        >
          <h2 className="text-3xl font-semibold tracking-[-0.02em] text-[#FAFAFA] sm:text-5xl">
            Ele age no computador, não só no chat.
          </h2>
          <p className="mt-5 max-w-[52ch] text-lg font-light leading-relaxed text-white/55">
            Doze capacidades, agrupadas pelo que elas tiram das suas mãos.
          </p>
        </motion.div>

        <div className="mt-16 grid grid-cols-1 gap-4 lg:grid-cols-12">
          {/* Celula pesada: superficie elevada, o grupo mais concreto. */}
          <Cell className="bg-ink-800 lg:col-span-7" delay={0}>
            <h3 className="text-sm font-medium text-white/50">
              Controla a máquina
            </h3>
            <div className="mt-7 grid gap-7 sm:grid-cols-2">
              {machine.map((item) => (
                <CapabilityRow key={item.title} item={item} />
              ))}
            </div>
          </Cell>

          {/* Celula com halo: diferencia a superficie sem introduzir cor. */}
          <Cell
            className="relative overflow-hidden bg-ink-900 lg:col-span-5"
            delay={0.08}
          >
            <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/[0.06] blur-3xl" />
            <div className="relative">
              <h3 className="text-sm font-medium text-white/50">
                Entende o contexto
              </h3>
              <div className="mt-7 grid gap-7">
                {context.map((item) => (
                  <CapabilityRow key={item.title} item={item} />
                ))}
              </div>
            </div>
          </Cell>

          {/* Celula larga com o orb real do app rodando dentro dela. */}
          <Cell
            className="bg-ink-900 lg:col-span-12"
            delay={0.16}
          >
            <div className="grid items-center gap-10 lg:grid-cols-[auto_1fr] lg:gap-14">
              {/* Esfera estatica de proposito: uma so gira na pagina, no hero.
                  Duas malhas animadas ao mesmo tempo custam caro em rAF. */}
              <div className="hidden justify-center lg:flex">
                <JarvisOrb state="speaking" sphereSize={150} paused />
              </div>
              <div>
                <h3 className="text-sm font-medium text-white/50">
                  Fala como você
                </h3>
                <div className="mt-7 grid gap-7 sm:grid-cols-2 xl:grid-cols-4">
                  {voice.map((item) => (
                    <CapabilityRow key={item.title} item={item} />
                  ))}
                </div>
              </div>
            </div>
          </Cell>
        </div>
      </div>
    </section>
  );
}
