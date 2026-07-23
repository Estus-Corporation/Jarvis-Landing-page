"use client";

import React from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  Eye,
  Brain,
  Waveform,
  SlidersHorizontal,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";
import { JarvisOrb } from "@/components/ui/jarvis-sphere";

// A secao de Integracoes, logo acima, ja lista Spotify, Chrome, GitHub,
// PowerShell, Steam e Windows com descricao. Repetir "Navegador", "Terminal" e
// "GitHub" aqui em outra grade fazia a pagina dizer a mesma coisa duas vezes
// seguidas, em dois layouts parecidos.
//
// Divisao nova: Integracoes responde "no que ele se conecta". Esta secao
// responde "o que ele percebe, lembra e como ele soa", que e o que nenhuma
// integracao explica. Nada foi cortado: as outras oito capacidades continuam
// na pagina, comprimidas na celula de alcance.
type Pillar = {
  icon: Icon;
  title: string;
  body: string;
  quote: string;
};

const screen: Pillar = {
  icon: Eye,
  title: "Ele enxerga a sua tela",
  body: "Captura o que está no monitor e responde sobre aquilo. Sem você descrever, copiar ou colar nada.",
  quote: "Jarvis, o que esse erro aqui quer dizer?",
};

const memory: Pillar = {
  icon: Brain,
  title: "Ele lembra",
  body: "Fatos e preferências que você contou ficam guardados e voltam nas conversas seguintes.",
  quote: "Manda pro cliente daquele projeto.",
};

const voice: Pillar = {
  icon: Waveform,
  title: "Ele soa como você",
  body: "A resposta sai em uma síntese treinada na sua própria fala.",
  quote: "Que horas é minha primeira reunião?",
};

const personality: Pillar = {
  icon: SlidersHorizontal,
  title: "Ele fala do seu jeito",
  body: "Formal, seco ou brincalhão. O tom é uma configuração, não um padrão fixo.",
  quote: "Responde mais curto a partir de agora.",
};

// As oito restantes. Viram alcance, nao cartao: elas ja ganharam espaco
// proprio na secao de integracoes e aqui servem para mostrar amplitude.
const reach = [
  "Navegador",
  "Programas",
  "Terminal",
  "GitHub",
  "Jogos",
  "Ativação por voz",
  "Digita por você",
  "Clima e hora",
];

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
      initial={reduce ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: 0.7,
        delay: reduce ? 0 : delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      // Hover em CSS puro, sem rastrear posicao do cursor: a borda acende e a
      // superficie sobe um degrau. Barato e consistente com o resto da pagina.
      className={`group relative overflow-hidden rounded-card border border-white/[0.08] transition-colors duration-300 hover:border-white/20 ${className}`}
    >
      {children}
    </motion.div>
  );
}

// O comando falado e o que prova a capacidade. Aparece como fala, entre aspas
// tipograficas, nao como pill sobreposta nem como bloco de codigo.
function SpokenExample({ text, big = false }: { text: string; big?: boolean }) {
  return (
    <p
      className={`mt-6 border-l border-white/15 pl-4 italic leading-[1.5] text-white/70 ${
        big ? "text-base sm:text-lg" : "text-sm"
      }`}
    >
      “{text}”
    </p>
  );
}

function PillarHead({ item, big = false }: { item: Pillar; big?: boolean }) {
  const Glyph = item.icon;
  return (
    <>
      <Glyph
        size={big ? 30 : 24}
        weight="light"
        className="text-white/60 transition-colors duration-300 group-hover:text-white/90"
        aria-hidden
      />
      <h3
        className={`mt-6 font-semibold tracking-[-0.02em] text-[#FAFAFA] ${
          big ? "text-3xl sm:text-4xl" : "text-xl sm:text-2xl"
        }`}
      >
        {item.title}
      </h3>
      <p
        className={`mt-4 leading-relaxed text-white/50 ${
          big ? "max-w-[42ch] text-base sm:text-lg" : "max-w-[38ch] text-sm"
        }`}
      >
        {item.body}
      </p>
    </>
  );
}

export default function Features() {
  const reduce = useReducedMotion();

  return (
    <section id="recursos" className="relative bg-ink-950 px-6 py-28 sm:py-36">
      <div className="mx-auto max-w-shell">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-3xl"
        >
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-white/35">
            Recursos
          </span>
          <h2 className="mt-4 text-balance text-3xl font-semibold tracking-[-0.025em] text-[#FAFAFA] sm:text-5xl lg:text-6xl">
            Ele age no computador, não só no chat.
          </h2>
          <p className="mt-6 max-w-[54ch] text-lg font-light leading-relaxed text-white/55">
            Abrir programa qualquer atalho abre. O que muda é ele enxergar a
            tela, lembrar do que você disse e responder na sua voz.
          </p>
        </motion.div>

        {/* Bento assimetrico de 5 celulas. Row 1: 7+5. Row 2: a dominante
            continua + 5. Row 3: 7+5. No mobile tudo vira coluna unica. */}
        <div className="mt-16 grid grid-cols-1 gap-4 lg:grid-cols-12">
          {/* Dominante: a capacidade mais dificil de acreditar ganha o maior
              espaco e a maior escala de tipo. */}
          <Cell className="bg-ink-800 lg:col-span-7 lg:row-span-2" delay={0}>
            <div
              aria-hidden
              className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/[0.07] blur-[90px]"
            />
            <div className="relative flex h-full flex-col justify-between p-8 sm:p-11">
              <div>
                <PillarHead item={screen} big />
              </div>
              <SpokenExample text={screen.quote} big />
            </div>
          </Cell>

          <Cell className="bg-ink-900 lg:col-span-5" delay={0.08}>
            <div className="p-8 sm:p-10">
              <PillarHead item={memory} />
              <SpokenExample text={memory.quote} />
            </div>
          </Cell>

          {/* Celula da voz: a esfera real do app, parada. Uma so gira na
              pagina, no hero. Duas malhas animadas custam caro em rAF. */}
          <Cell className="bg-ink-900 lg:col-span-5" delay={0.16}>
            <div className="flex items-center gap-6 p-8 sm:p-10">
              <div className="min-w-0 flex-1">
                <PillarHead item={voice} />
                <SpokenExample text={voice.quote} />
              </div>
              <div className="-mr-16 hidden shrink-0 opacity-70 sm:block">
                <JarvisOrb state="speaking" sphereSize={130} paused />
              </div>
            </div>
          </Cell>

          {/* Alcance: as outras oito, como amplitude e nao como cartao. */}
          <Cell className="bg-ink-900/60 lg:col-span-7" delay={0.24}>
            <div className="p-8 sm:p-10">
              <h3 className="text-sm font-medium text-white/45">
                E também comanda
              </h3>
              <ul className="mt-6 flex flex-wrap gap-2.5">
                {reach.map((item, i) => (
                  <motion.li
                    key={item}
                    initial={reduce ? false : { opacity: 0, scale: 0.94 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{
                      duration: 0.45,
                      delay: reduce ? 0 : 0.3 + i * 0.04,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="rounded-chip border border-white/[0.1] px-3.5 py-2 text-sm text-white/65"
                  >
                    {item}
                  </motion.li>
                ))}
              </ul>
            </div>
          </Cell>

          <Cell className="bg-ink-800 lg:col-span-5" delay={0.32}>
            <div className="p-8 sm:p-10">
              <PillarHead item={personality} />
              <SpokenExample text={personality.quote} />
            </div>
          </Cell>
        </div>
      </div>
    </section>
  );
}
