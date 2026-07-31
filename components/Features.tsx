"use client";

import React from "react";
import Image from "next/image";
import {
  motion,
  useMotionValue,
  useMotionTemplate,
} from "motion/react";
import { useReducedMotionSafe } from "@/components/ui/use-reduced-motion-safe";
import {
  Eye,
  Brain,
  Waveform,
  SlidersHorizontal,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";
import { JarvisOrb } from "@/components/ui/jarvis-sphere";

// Esta secao vem antes de Integracoes: primeiro o que o produto E, depois no
// que ele se conecta. Ela responde "o que ele percebe, lembra e como ele soa",
// que e o que nenhuma lista de logo explica. Integracoes, logo abaixo, cobre
// Spotify, Chrome, GitHub, PowerShell, Steam e Windows com descricao, entao
// repetir "Navegador", "Terminal" e "GitHub" aqui em outra grade faria a pagina
// dizer a mesma coisa duas vezes seguidas.
//
// Nada foi cortado: as outras oito capacidades continuam na pagina, comprimidas
// na celula de alcance.
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
  const reduce = useReducedMotionSafe();
  // Luz que segue o cursor dentro da celula. Vive em motion values, nunca em
  // estado do React: rastrear o ponteiro com useState re-renderizaria a arvore a
  // cada pixel e travaria no mobile.
  const mx = useMotionValue(-9999);
  const my = useMotionValue(-9999);
  const spotlight = useMotionTemplate`radial-gradient(300px circle at ${mx}px ${my}px, rgba(255,255,255,0.08), transparent 68%)`;

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
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        mx.set(e.clientX - r.left);
        my.set(e.clientY - r.top);
      }}
      onMouseLeave={() => {
        mx.set(-9999);
        my.set(-9999);
      }}
      // A borda acende no hover e a luz do cursor lava a superficie.
      className={`group relative overflow-hidden rounded-card border border-white/[0.08] transition-colors duration-300 hover:border-white/25 ${className}`}
    >
      {/* Spotlight acima das texturas (z-[2]), abaixo do texto na pratica: e
          branco e de opacidade baixa, entao levanta as areas escuras e quase nao
          toca no texto claro. */}
      <motion.div
        aria-hidden
        style={{ background: spotlight }}
        className="pointer-events-none absolute inset-0 z-[2] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />
      {children}
    </motion.div>
  );
}

// Textura de fundo da celula. As imagens sao monocromaticas e entram em
// opacidade baixa com um scrim por cima: elas dao materia ao bento sem disputar
// leitura com o texto. Sao decorativas, entao alt vazio e aria-hidden no
// wrapper, e nenhuma delas carrega informacao que so exista na imagem.
//
// Sao pequenas (no maximo 800px de largura). Por isso entram como textura de
// fundo, nunca como imagem focal em escala grande, onde a falta de resolucao
// apareceria.
function CellTexture({
  src,
  className = "",
  opacity = "opacity-[0.15]",
  sizes,
}: {
  src: string;
  className?: string;
  opacity?: string;
  sizes: string;
}) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute select-none ${opacity} ${className}`}
    >
      <Image
        src={src}
        alt=""
        fill
        sizes={sizes}
        className="object-cover transition-opacity duration-500"
      />
    </div>
  );
}

// O comando falado e o que prova a capacidade. Aparece como fala, entre aspas
// tipograficas, nao como pill sobreposta nem como bloco de codigo.
function SpokenExample({ text, big = false }: { text: string; big?: boolean }) {
  return (
    <p
      className={`border-l border-white/15 pl-4 italic leading-[1.5] text-white/70 ${
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

// Corpo comum das 4 celulas-pilar (tudo, menos a de alcance). No desktop o
// comando falado fica escondido ate o hover: o titulo e o corpo sobem um
// pouco e a fala do Jarvis entra por baixo, como se a celula so "respondesse"
// depois de ser acionada, do mesmo jeito que o produto real so fala depois de
// ouvir o comando. Em touch nao existe hover (ver Secao 2 do guia de UX), por
// isso o celular ve o comando direto, sempre visivel, sem depender de toque.
function PillarContent({ item, big = false }: { item: Pillar; big?: boolean }) {
  return (
    <div className="relative flex h-full flex-col p-8 sm:p-10">
      <div className="pointer-events-none transition-transform duration-300 lg:group-hover:-translate-y-3">
        <PillarHead item={item} big={big} />
      </div>

      <div className="mt-6 lg:hidden">
        <SpokenExample text={item.quote} big={big} />
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 hidden translate-y-3 p-8 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 sm:p-10 lg:block">
        <SpokenExample text={item.quote} big={big} />
      </div>
    </div>
  );
}

export default function Features() {
  const reduce = useReducedMotionSafe();

  return (
    <section
      id="recursos"
      // Fundo igual ao de Integracoes (ink-900). O pt-44/pt-64 de antes existia
      // so para abrir espaco para o corte diagonal que ficava aqui no topo;
      // como ele se mudou para dentro da propria Hero, esse respiro extra
      // ficou orfao, so afastando o titulo da divisoria. pt reduzido bem alem
      // do padrao py-28/36 do site (que so se aplica ao pb aqui), aproximando
      // o titulo da linha visivel no rodape da hero.
      className="relative overflow-hidden bg-ink-900 px-6 pb-28 pt-14 sm:pb-36 sm:pt-20"
    >
      {/* O acento em degrau que ficava aqui (topo de Recursos) foi para dentro
          da propria Hero, encostado no rodape dela: assim ele fica visivel
          assim que a pagina carrega, sem depender de scroll. Manter os dois
          pontos criaria dois degraus quase colados, redundantes. A transicao
          Hero -> Recursos volta a ser a simples troca de cor ink-950 -> ink-900
          entre as secoes. */}
      <div className="relative mx-auto max-w-shell">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-3xl"
        >
          <h2 className="text-balance text-3xl font-semibold tracking-[-0.025em] text-[#FAFAFA] sm:text-5xl lg:text-6xl">
            Ele age no computador, não só no chat.
          </h2>
          <p className="mt-6 max-w-[54ch] text-lg font-light leading-relaxed text-white/55">
            Abrir programa qualquer atalho abre. O que muda é ele enxergar a
            tela, lembrar do que você disse e responder na sua voz.
          </p>
        </motion.div>

        {/* Bento de verdadeiro grid-cols-3 com altura de linha fixa (o mesmo
            mecanismo do bento grid de referencia), em vez do grid-cols-12 com
            row-span de antes. A dominante ocupa a coluna esquerda inteira (2
            colunas de largura, 2 linhas de altura); memoria e voz empilham na
            coluna estreita ao lado; alcance e personalidade fecham embaixo no
            mesmo ritmo largo+estreito da primeira linha, espelhado. 5 celulas
            de conteudo, 9 posicoes no grid, nenhuma sobra. */}
        <div className="mt-16 grid grid-cols-1 gap-4 lg:grid-cols-3 lg:auto-rows-[18rem]">
          {/* Dominante: a capacidade mais dificil de acreditar ganha o maior
              espaco e a maior escala de tipo. */}
          <Cell
            className="bg-ink-800 lg:col-start-1 lg:col-span-2 lg:row-start-1 lg:row-span-2"
            delay={0}
          >
            {/* Campo de blocos: le como uma tela cheia de janelas vista de
                lado, que e exatamente o que esta celula afirma. */}
            <CellTexture
              src="/images/i1.jpg"
              className="inset-0"
              opacity="opacity-[0.22]"
              sizes="(max-width: 1024px) 100vw, 58vw"
            />
            {/* Scrim: garante o contraste do texto sobre a textura. */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-ink-800 via-ink-800/90 to-ink-800/55"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/[0.07] blur-[90px]"
            />
            <PillarContent item={screen} big />
          </Cell>

          <Cell
            className="bg-ink-900 lg:col-start-3 lg:row-start-1"
            delay={0.08}
          >
            {/* Fitas em camadas: leem como coisas guardadas uma sobre a outra,
                que e o que esta celula afirma. Cobrem a celula inteira porque a
                imagem e continua, sem assunto central. */}
            <CellTexture
              src="/images/i6.avif"
              className="inset-0"
              opacity="opacity-[0.3]"
              sizes="(max-width: 1024px) 100vw, 33vw"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-gradient-to-br from-ink-900 via-ink-900/88 to-ink-900/50"
            />
            <PillarContent item={memory} />
          </Cell>

          {/* Celula da voz: a esfera real do app, parada, como textura de
              fundo no canto (antes vivia ao lado do texto, em linha; a coluna
              estreita do grid novo nao sobra espaco pra isso). Uma so gira na
              pagina, no hero — duas malhas animadas custam caro em rAF, e esta
              nem anima (paused). */}
          <Cell
            className="bg-ink-900 lg:col-start-3 lg:row-start-2"
            delay={0.16}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -right-10 -top-10 opacity-40 transition-opacity duration-300 group-hover:opacity-60"
            >
              <JarvisOrb state="speaking" sphereSize={150} paused />
            </div>
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-gradient-to-bl from-ink-900/25 via-ink-900/75 to-ink-900"
            />
            <PillarContent item={voice} />
          </Cell>

          {/* Alcance: as outras oito, como amplitude e nao como cartao. */}
          <Cell
            className="bg-ink-900/60 lg:col-start-1 lg:col-span-2 lg:row-start-3"
            delay={0.24}
          >
            {/* Trilhas saindo de um nucleo: alcance se espalhando, que e o
                argumento desta celula. */}
            <CellTexture
              src="/images/i3.jpg"
              className="inset-0"
              opacity="opacity-[0.13]"
              sizes="(max-width: 1024px) 100vw, 58vw"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-gradient-to-r from-ink-900 via-ink-900/85 to-ink-900/45"
            />
            <div className="relative flex h-full flex-col justify-center p-8 sm:p-10">
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
                    className="rounded-chip border border-white/[0.1] px-3.5 py-2 text-sm text-white/65 transition-colors duration-300 hover:border-white/25 hover:bg-white/[0.03] hover:text-white/90"
                  >
                    {item}
                  </motion.li>
                ))}
              </ul>
            </div>
          </Cell>

          <Cell
            className="bg-ink-800 lg:col-start-3 lg:row-start-3"
            delay={0.32}
          >
            {/* i4 estava sem uso no projeto: da materia a esta celula, que
                antes era a unica sem nenhuma textura de fundo. */}
            <CellTexture
              src="/images/i4.avif"
              className="inset-0"
              opacity="opacity-[0.16]"
              sizes="(max-width: 1024px) 100vw, 33vw"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-gradient-to-tl from-ink-800 via-ink-800/90 to-ink-800/55"
            />
            <PillarContent item={personality} />
          </Cell>
        </div>
      </div>
    </section>
  );
}
