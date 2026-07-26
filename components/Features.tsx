"use client";

import React from "react";
import Image from "next/image";
import {
  motion,
  useMotionValue,
  useMotionTemplate,
  useReducedMotion,
} from "motion/react";
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
  const reduce = useReducedMotion();
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
// As tres tem no maximo 800px de largura. Por isso entram como textura de
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
    <section
      id="recursos"
      // Fundo igual ao de Integracoes (ink-900). O pt maior abre espaco para o
      // corte diagonal do topo nao encostar no conteudo.
      className="relative overflow-hidden bg-ink-900 px-6 pb-28 pt-44 sm:pb-36 sm:pt-64"
    >
      {/* Corte diagonal Hero -> Recursos via clip-path (nao imagem, nao SVG).
          Duas camadas dentro da faixa do topo:
           1) Uma div da cor da hero (ink-950) recortada em diagonal: cobre o
              topo inteiro e a aresta de baixo SOBE da esquerda para a direita
              (poucos graus), revelando o ink-900 de Recursos por baixo.
           2) Uma segunda div de 2px seguindo a MESMA diagonal, branca, que
              desenha o fio nitido da aresta (o dark-sobre-dark sozinho quase
              nao aparece). */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-40 sm:h-56"
      >
        <div
          className="absolute inset-0 bg-ink-950"
          style={{ clipPath: "polygon(0 0, 100% 0, 100% 45%, 0 100%)" }}
        />
        <div
          className="absolute inset-0 bg-white/40"
          style={{
            clipPath:
              "polygon(0 calc(100% - 2px), 100% calc(45% - 2px), 100% 45%, 0 100%)",
          }}
        />
      </div>

      <div className="relative z-[2] mx-auto max-w-shell">
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

        {/* Bento assimetrico de 5 celulas. Row 1: 7+5. Row 2: a dominante
            continua + 5. Row 3: 7+5. No mobile tudo vira coluna unica. */}
        <div className="mt-16 grid grid-cols-1 gap-4 lg:grid-cols-12">
          {/* Dominante: a capacidade mais dificil de acreditar ganha o maior
              espaco e a maior escala de tipo. */}
          <Cell className="bg-ink-800 lg:col-span-7 lg:row-span-2" delay={0}>
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
            <div className="relative flex h-full flex-col justify-between p-8 sm:p-11">
              <div>
                <PillarHead item={screen} big />
              </div>
              <SpokenExample text={screen.quote} big />
            </div>
          </Cell>

          <Cell className="bg-ink-900 lg:col-span-5" delay={0.08}>
            {/* Fitas em camadas: leem como coisas guardadas uma sobre a outra,
                que e o que esta celula afirma. Cobrem a celula inteira porque a
                imagem e continua, sem assunto central. */}
            <CellTexture
              src="/images/i6.avif"
              className="inset-0"
              opacity="opacity-[0.3]"
              sizes="(max-width: 1024px) 100vw, 42vw"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-gradient-to-br from-ink-900 via-ink-900/88 to-ink-900/50"
            />
            <div className="relative p-8 sm:p-10">
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
            <div className="relative p-8 sm:p-10">
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
