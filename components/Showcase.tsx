"use client";

import React from "react";
import {
  motion,
  useMotionValue,
  useMotionTemplate,
} from "motion/react";
import { useReducedMotionSafe } from "@/components/ui/use-reduced-motion-safe";
import {
  CloudSun,
  MusicNotes,
  Timer,
  GameController,
  ListChecks,
  ChatCircleText,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";
import ScrollExpandMedia from "@/components/ui/scroll-expansion-hero";

// Prova visual da secao: uma imagem so, a captura real da dashboard.
//
// A segunda foto saiu a pedido. E, com ela fora, a lista de widgets nao podia
// continuar como cartao ao lado: a propria imagem ja mostra clima, relogio,
// Spotify e tarefas. Nomear em texto o que a foto exibe e dizer duas vezes.
// Os nomes viram indice discreto embaixo, e a imagem ganha o palco inteiro.
// O indice deixou de ser uma lista de texto com hairline em cima de cada linha,
// que era o layout mais preguicoso possivel para seis itens. Cada widget virou
// um cartao com glifo proprio e uma luz que segue o cursor: a secao fala de uma
// tela viva, entao o indice dela tambem reage ao ponteiro.
type Widget = { icon: Icon; title: string; note: string };

const widgets: Widget[] = [
  {
    icon: CloudSun,
    title: "Clima e relógio",
    note: "Previsão e hora local sempre à vista.",
  },
  {
    icon: MusicNotes,
    title: "Spotify",
    note: "Faixa atual com a capa do álbum.",
  },
  {
    icon: Timer,
    title: "Timer e pomodoro",
    note: "Ciclos de foco controlados por voz.",
  },
  {
    icon: GameController,
    title: "Jogo em execução",
    note: "Ele reconhece o que você está jogando.",
  },
  {
    icon: ListChecks,
    title: "Tarefas e agenda",
    note: "Lembretes e compromissos do dia.",
  },
  {
    icon: ChatCircleText,
    title: "Chat com imagens",
    note: "Conversa por texto quando falar não dá.",
  },
];

// Luz que acompanha o cursor dentro do cartao.
//
// A posicao vive em motion values, nunca em estado do React: seguir o ponteiro
// com useState re-renderizaria a arvore a cada pixel e travaria no mobile.
function SpotlightCard({ widget, delay }: { widget: Widget; delay: number }) {
  const reduce = useReducedMotionSafe();
  const mx = useMotionValue(-9999);
  const my = useMotionValue(-9999);
  const spotlight = useMotionTemplate`radial-gradient(220px circle at ${mx}px ${my}px, rgba(255,255,255,0.1), transparent 72%)`;
  const Glyph = widget.icon;

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{
        duration: 0.6,
        delay: reduce ? 0 : delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        mx.set(e.clientX - r.left);
        my.set(e.clientY - r.top);
      }}
      // Tira a luz de cena ao sair, senao ela fica congelada no ultimo ponto.
      onMouseLeave={() => {
        mx.set(-9999);
        my.set(-9999);
      }}
      className="group relative overflow-hidden rounded-card border border-white/[0.08] bg-ink-950/40 p-7 transition-colors duration-300 hover:border-white/20"
    >
      <motion.div
        aria-hidden
        style={{ background: spotlight }}
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />
      <div className="relative">
        <Glyph
          size={26}
          weight="light"
          aria-hidden
          className="text-white/55 transition-colors duration-300 group-hover:text-[#FAFAFA]"
        />
        <h4 className="mt-5 text-base font-medium text-[#FAFAFA]">
          {widget.title}
        </h4>
        <p className="mt-2 text-sm leading-relaxed text-white/45">
          {widget.note}
        </p>
      </div>
    </motion.div>
  );
}

export default function Showcase() {
  return (
    // Sem overflow-hidden nesta secao: ele quebraria o `sticky` do palco de
    // expansao (sticky nao gruda se algum ancestral tem overflow hidden). O
    // recorte da midia e do halo ja acontece dentro do proprio palco.
    <section id="interface" className="relative border-t border-white/[0.07] bg-ink-900 pb-28 sm:pb-36">
      {/* Revelacao por expansao: a captura nasce estreita entre as duas linhas
          do titulo e cresce ate quase encher o palco conforme a pagina rola,
          enquanto o titulo se abre para os lados. Dirigido por progresso de
          scroll, sem sequestrar a rolagem. */}
      <ScrollExpandMedia
        titleTop="Uma dashboard"
        titleBottom="viva na sua tela"
        mediaSrc="/images/jarvis-dashboard.png"
        mediaAlt="Interface do Jarvis: esfera de rede geodésica no centro, com widgets de tarefas, clima, relógio e Spotify ao redor."
      />

      <div className="relative mx-auto max-w-6xl px-6 lg:px-10 wide:max-w-shell wide:px-16">
        {/* Ponte: a legenda que antes ficava sob o titulo agora liga a captura
            expandida ao indice de widgets. */}
        <p className="mx-auto max-w-[54ch] text-center text-lg font-light leading-relaxed text-white/55">
          A esfera reage à conversa no centro. Em volta, widgets que você
          arrasta, reorganiza e tinge com o seu tema de cor.
        </p>

        {/* Indice do que aparece na imagem. */}
        <div className="mt-16">
          <h3 className="text-sm font-medium text-white/45">
            O que já vem na tela
          </h3>
          {/* Seis itens, seis celulas: 3 colunas por 2 linhas no desktop, sem
              celula vazia sobrando. No mobile cai para coluna unica. */}
          <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {widgets.map((widget, i) => (
              <SpotlightCard
                key={widget.title}
                widget={widget}
                delay={i * 0.07}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
