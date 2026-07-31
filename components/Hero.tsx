"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import { useReducedMotionSafe } from "@/components/ui/use-reduced-motion-safe";
import { JarvisOrb } from "@/components/ui/jarvis-sphere";
import { useOrbSize } from "@/components/ui/use-orb-size";
import { SpokenCaption } from "@/components/ui/spoken-caption";
import CodeRain from "@/components/ui/code-rain";
import StepDivider from "@/components/ui/step-divider";
import {
  ShieldCheck,
  Lightning,
  Microphone,
  Terminal,
  SquaresFour,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";

const HEADLINE = ["Fale.", "Ele", "já", "fez."];

// Selos flutuantes ao redor da esfera: mostram, de relance, tres coisas
// concretas que o Jarvis faz, sem exigir que a pessoa leia a secao de
// Recursos para descobrir. Posicoes em % do proprio quadro da esfera (nao da
// coluna), entao acompanham a esfera crescendo/encolhendo por breakpoint sem
// precisar de valores por tamanho de tela. `float` da a cada um um atraso de
// balanco proprio, para nao boiarem em uníssono como um bloco so.
const ORB_CHIPS: {
  icon: Icon;
  label: string;
  position: string;
  float: number;
}[] = [
  {
    icon: Microphone,
    label: "Comandos de voz",
    position: "right-[4%] top-[10%]",
    float: 0,
  },
  {
    icon: Terminal,
    label: "Terminal integrado",
    position: "left-[-8%] top-[48%]",
    float: 0.5,
  },
  {
    icon: SquaresFour,
    label: "Abre programas",
    position: "bottom-[10%] right-[8%]",
    float: 1,
  },
];

// Prova social logo abaixo dos CTAs, ainda dentro da primeira dobra: reforca
// a decisao no exato momento em que ela e tomada, sem exigir que a pessoa
// role a pagina atras de confianca. Os dois selos (privacidade, instalacao)
// repetem so o que a pagina ja afirma la embaixo, nunca uma promessa nova.
const TRUST_SIGNALS: { icon: Icon; title: string; subtitle: string }[] = [
  { icon: ShieldCheck, title: "Privacidade total", subtitle: "Dados 100% locais" },
  { icon: Lightning, title: "Instalação rápida", subtitle: "Menos de 1 minuto" },
];

// Frases proprias do hero. Sao diferentes das da secao de Voz clonada de
// proposito: a mesma legenda datilografada aparece em dois pontos da pagina, e
// repetir texto identico faria a segunda parecer um bug de copia. Todas
// descrevem coisas que o produto realmente faz.
const HERO_PHRASES = [
  "Abrindo o Chrome e buscando os documentos.",
  "Comando executado. Terminal pronto.",
  "Notificações silenciadas. Modo foco ligado.",
  "Claro. Enviando a mensagem agora.",
];

export default function Hero() {
  const reduce = useReducedMotionSafe();
  // O teto acompanha a largura da coluna do orb, alargada logo abaixo no grid.
  // A caixa desenhada e (size + 144) por causa do padding dos aneis, entao o
  // limite util da coluna de ~640px e 496. O hook ainda corta por altura de
  // viewport, o que mantem o hero inteiro visivel em telas baixas.
  // Teto menor que antes (era 480). A legenda falada agora divide a coluna com
  // a esfera, e o hero continua tendo que caber na primeira tela: o espaco que
  // a caixa de texto ocupa saiu do diametro da esfera.
  const { containerRef, size } = useOrbSize({ min: 220, max: 480 });

  // A esfera segue a legenda, exatamente como na secao de Voz clonada: fala
  // enquanto o texto e datilografado e se acalma quando a frase termina. Antes
  // ela so trocava de "idle" para "listening" uma vez e parava ali.
  const [speaking, setSpeaking] = useState(false);
  const handleSpeakingChange = React.useCallback(
    (value: boolean) => setSpeaking(value),
    []
  );

  return (
    <section
      id="top"
      className="relative flex min-h-[100dvh] w-full items-center overflow-hidden bg-ink-950 px-6 pb-20 pt-24"
    >
      <CodeRain />

      {/* Halo com respiro lento, unico loop continuo do fundo. */}
      <motion.div
        animate={
          reduce ? undefined : { scale: [1, 1.06, 1], opacity: [0.85, 1, 0.85] }
        }
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute right-0 top-1/2 h-[640px] w-[640px] -translate-y-1/2 translate-x-1/4 rounded-full bg-white/[0.045] blur-[130px]"
      />

      {/* Aceno da proxima secao, DENTRO da propria hero. Antes esse divisor
          vivia no topo de Recursos, ou seja, logo depois da dobra: como a hero
          ocupa a tela toda (min-h-[100dvh]), a linha so aparecia depois de
          rolar. Agora ele mora aqui, encostado no rodape da hero, dentro do
          respiro que o pb-20 ja reserva, visivel assim que a pagina carrega.
          `fill=""` desliga a camada solida que cobria a maior parte da caixa:
          essa area volta a ficar transparente, entao a chuva de codigo e o
          halo (que ja rodam atras) continuam aparecendo normalmente ate a
          linha, em vez de baterem numa placa opaca. So a reentrancia (o "furo"
          que aponta para Recursos) continua colorida, via `notchFill`.
          `stepWidth` baixo + `dropDepth` cheio (100, a altura toda da caixa)
          deixam a diagonal ingreme mesmo numa caixa curta: sem esses dois
          parametros, reduzir a altura da caixa (para aproximar a linha da
          hero) automaticamente achata o angulo, porque a mesma porcentagem de
          queda vira poucos pixels reais numa caixa baixa. */}
      {/* Divisor de volta ao bottom-0: a caixa inteira desceu ate encostar na
          costura real com Recursos de novo, entao a linha inferior fica
          alinhada com a base fisica da tela. Sem deslocamento, nao ha mais
          vao entre a caixa e a costura, entao a "tapa-buraco" que cobria essa
          folga (usada quando a caixa vivia em bottom-10) nao e mais
          necessaria e saiu. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-32 sm:h-40"
      >
        <StepDivider
          fill=""
          notchFill="bg-ink-900"
          flip
          stepWidth={10}
          // dropDepth<100: a linha superior deixa de ficar colada no topo da
          // caixa e desce um pouco em direcao ao meio, sem mexer na linha de
          // baixo (essa depende so do bottom-10 do wrapper). Efeito colateral
          // esperado: a diagonal fica um pouco menos vertical, ja que o
          // percurso vertical dela encolheu junto.
          dropDepth={80}
          lineColor="#ffffff"
          lineWidth={1.4}
          className="absolute inset-0 h-full w-full"
        />
      </div>

      {/* lg:pl-* empurra o grid inteiro (as duas colunas, titulo+CTAs e
          esfera+legenda) um pouco para a direita dentro do mesmo max-w-shell,
          sem mudar a largura total do bloco: sobra mais vazio a esquerda do
          que a direita, na proporcao pedida. */}
      <div className="relative z-[2] mx-auto grid w-full max-w-shell grid-cols-1 items-center gap-14 lg:grid-cols-[0.95fr_1.15fr] lg:gap-8 lg:pl-10 xl:pl-16">
        <div className="order-2 lg:order-1">
          {/* Revelacao palavra a palavra: o titulo se monta como uma frase
              sendo dita, em vez de aparecer inteiro de uma vez. */}
          <h1 className="flex max-w-[15ch] flex-wrap gap-x-[0.28em] text-[2.75rem] font-semibold leading-[1.05] tracking-[-0.03em] text-[#FAFAFA] sm:text-6xl lg:text-7xl">
            {HEADLINE.map((word, i) => (
              <span key={word + i} className="overflow-hidden pb-[0.08em]">
                <motion.span
                  className="inline-block"
                  initial={reduce ? false : { y: "100%", opacity: 0 }}
                  animate={{ y: "0%", opacity: 1 }}
                  transition={{
                    duration: 0.75,
                    delay: reduce ? 0 : i * 0.08,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  {word}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p
            initial={reduce ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.42, ease: [0.16, 1, 0.3, 1] }}
            className="mt-7 max-w-[46ch] text-lg font-light leading-relaxed text-white/60"
          >
            Um assistente de voz que vive no seu Windows. Controla o navegador,
            abre programas e roda comandos de terminal.
          </motion.p>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.52, ease: [0.16, 1, 0.3, 1] }}
            className="mt-10 flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center"
          >
            {/* Raio menor e largura maior que o padrao pill do site de
                proposito: excecao pedida so para este botao (o resto da
                pagina continua com botoes = full, per o token global). */}
            <a
              href="#precos"
              className="rounded-xl bg-[#FAFAFA] px-9 py-4 text-center text-base font-semibold text-ink-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_10px_30px_-12px_rgba(255,255,255,0.35)] transition-colors duration-200 hover:bg-white active:scale-[0.98] sm:w-fit sm:min-w-[280px]"
            >
              Começar agora
            </a>

            <a
              href="#recursos"
              className="rounded-full border border-white/15 px-9 py-4 text-center text-base text-white/70 transition-all duration-300 hover:border-white/40 hover:bg-white/[0.04] hover:text-white active:scale-[0.98] sm:w-fit"
            >
              Ver recursos
            </a>
          </motion.div>

          {/* Dois lembretes de atrito, ambos coisas que a pagina reafirma la
              embaixo. O selo de "+1,2 mil usuarios" que vivia aqui saiu: sem
              numero verificavel para mostrar ainda, prova social fabricada
              piora a confianca em vez de construir ela. */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.62, ease: [0.16, 1, 0.3, 1] }}
            className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4"
          >
            {TRUST_SIGNALS.map(({ icon: Glyph, title, subtitle }, i) => (
              <React.Fragment key={title}>
                <div className="flex items-center gap-2.5">
                  <Glyph
                    size={20}
                    weight="light"
                    aria-hidden
                    className="shrink-0 text-white/45"
                  />
                  <div className="leading-tight">
                    <p className="text-sm text-white/75">{title}</p>
                    <p className="text-xs text-white/40">{subtitle}</p>
                  </div>
                </div>
                {i < TRUST_SIGNALS.length - 1 && (
                  <span
                    className="hidden h-8 w-px bg-white/10 sm:block"
                    aria-hidden
                  />
                )}
              </React.Fragment>
            ))}
          </motion.div>
        </div>

        <motion.div
          initial={reduce ? false : { opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          // lg:ml-* nudja so este bloco (esfera + card de fala) mais para a
          // direita dentro da propria coluna, sem tocar a coluna do texto.
          className="order-1 flex flex-col items-center lg:order-2 lg:ml-6 xl:ml-10"
        >
          <div ref={containerRef} className="flex w-full justify-center">
            <div className="relative inline-block">
              <JarvisOrb
                state={speaking ? "speaking" : "idle"}
                sphereSize={size}
                paused={!!reduce}
              />

              {/* Escondidos abaixo de sm: a esfera fica pequena demais nesse
                  breakpoint (min 220px) para tres selos com texto nao
                  colidirem ou vazarem da secao. */}
              {ORB_CHIPS.map(({ icon: Glyph, label, position, float }, i) => (
                <motion.div
                  key={label}
                  initial={reduce ? false : { opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    duration: 0.6,
                    delay: 0.95 + i * 0.15,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className={`absolute z-10 hidden sm:block ${position}`}
                >
                  <motion.div
                    animate={reduce ? undefined : { y: [0, -8, 0] }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: float,
                    }}
                    className="flex items-center gap-3 whitespace-nowrap rounded-2xl border border-white/[0.12] bg-ink-900/80 px-5 py-3.5 shadow-[0_14px_40px_-14px_rgba(0,0,0,0.65)] backdrop-blur-sm"
                  >
                    <Glyph
                      size={22}
                      weight="light"
                      aria-hidden
                      className="shrink-0 text-white/70"
                    />
                    <span className="text-base font-medium text-white/85">
                      {label}
                    </span>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* O orb ja traz 72px de padding transparente embaixo, entao a
              legenda encosta sem precisar de margem propria grande. */}
          <div className="flex w-full justify-center px-2">
            <SpokenCaption
              phrases={HERO_PHRASES}
              onSpeakingChange={handleSpeakingChange}
              // Acima da dobra: entra por tempo, junto com os CTAs, e nao por
              // scroll, que aqui nunca aconteceria.
              reveal="immediate"
              revealDelay={0.75}
              // max-w-md nao bastava mais: com a caixa presa a uma linha so
              // (sem quebrar), a frase mais longa precisa de mais espaco
              // horizontal do que 448px davam.
              className="max-w-xl"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
