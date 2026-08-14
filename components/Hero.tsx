"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import { useReducedMotionSafe } from "@/components/ui/use-reduced-motion-safe";
import { useMediaQuery } from "@/components/ui/use-media-query";
import { JarvisOrb } from "@/components/ui/jarvis-sphere";
import { useOrbSize } from "@/components/ui/use-orb-size";
import { SpokenCaption } from "@/components/ui/spoken-caption";
import { Particles } from "@/components/ui/particles";
import { cn } from "@/lib/utils";
import {
  ShieldCheck,
  Lightning,
  Microphone,
  Terminal,
  SquaresFour,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";

// "Sua voz vira ação." era correto mas abstrato demais pra quem chega sem
// contexto — "vira ação" nao diz O QUE, especificamente, acontece. Nomear o
// Windows direto no titulo (em vez de deixar so pro subtitulo, logo abaixo)
// da o "chao" imediato — MEU computador, de verdade — e "obedece" carrega o
// efeito wow que "vira ação" nao tinha: e a fantasia de comandar a maquina
// por voz, cumprida na primeira frase que a pessoa le.
const HEADLINE = ["Fale.", "Seu", "Windows", "obedece."];

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
  //
  // No notebook (mesma faixa do `laptop:` do tailwind.config.ts — largo mas
  // baixo), quem trava o tamanho normalmente e a ALTURA da viewport, nao a
  // largura da coluna (a conta de heightFraction*innerHeight fica abaixo do
  // teto de 480 nessa faixa). Por isso um heightFraction levemente maior so
  // aqui cresce a esfera ~7-8% sem mexer em nenhuma outra tela — mobile,
  // tablet e monitor grande continuam limitados pela largura da coluna ou
  // pelo teto de 480, entao nem chegam a usar essa fracao.
  const isLaptop = useMediaQuery("(min-width: 1024px) and (max-height: 900px)");
  const { containerRef, size } = useOrbSize({
    min: 220,
    max: 480,
    heightFraction: isLaptop ? 0.76 : 0.72,
  });

  // A esfera segue a legenda, exatamente como na secao de Voz clonada: fala
  // enquanto o texto e datilografado e se acalma quando a frase termina. Antes
  // ela so trocava de "idle" para "listening" uma vez e parava ali.
  const [speaking, setSpeaking] = useState(false);
  const handleSpeakingChange = React.useCallback(
    (value: boolean) => setSpeaking(value),
    []
  );

  // A correnteza das particulas pra esquerda e SO no desktop. 1024px e o
  // breakpoint `lg` do Tailwind (o config so acrescenta `wide`, nao mexe nos
  // padroes), entao esta consulta acompanha o mesmo corte que o resto da
  // pagina usa pra separar mobile de desktop.
  // Comeca `false` de proposito, igual ao useReducedMotionSafe: no servidor
  // nao existe matchMedia, e responder so depois de montar mantem o primeiro
  // render do cliente identico ao HTML do servidor. A Particles le o vx de
  // uma ref, entao a virada pos-mount chega no loop que ja esta rodando.
  const [driftLeft, setDriftLeft] = useState(false);
  React.useEffect(() => {
    const mql = window.matchMedia("(min-width: 1024px)");
    const sync = () => setDriftLeft(mql.matches);
    sync();
    mql.addEventListener("change", sync);
    return () => mql.removeEventListener("change", sync);
  }, []);

  return (
    <section
      id="top"
      // isolate: a secao tem bg-ink-950 proprio e e position:relative sem
      // z-index — sem isolar, esse fundo "escapa" pra uma camada de
      // empilhamento depois dos filhos com z-index negativo (os blobs de luz
      // do fundo) e pinta POR CIMA deles, escondendo a luz por completo. Com
      // isolate, o fundo da propria secao vira a base do seu contexto local,
      // e os filhos com z negativo voltam a aparecer por cima dele.
      className="relative isolate flex min-h-[100dvh] w-full items-center overflow-hidden bg-ink-950 px-6 pb-20 pt-24 lg:px-10 wide:px-16"
    >
      {/* Fundo: luz vindo da esquerda por tras de um campo de particulas
          sutil. Substitui a chuva de codigo + halo antigos.
          A primeira tentativa usava caixas com radial-gradient rotacionadas
          (fiel ao componente de referencia), mas o gradiente nao esvaecia ate
          o fim antes da borda da propria caixa — com uma caixa dessas bem
          grande e ainda cortada em pilula (rounded-full), a quina reta da
          caixa ficava visivel, parecendo um painel cinza em vez de luz.
          Blur de verdade (filter, nao gradient-in-a-box) nao tem essa
          borda: some suavemente sempre, entao e o que da o efeito de luz
          "de verdade" em vez de uma forma geometrica solta no fundo. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        {/* opacity-40 abaixo de lg: no mobile este blob e a principal fonte
            de "claro" no alto do hero; reduzi-lo (junto com o scrim mais alto
            logo abaixo) deixa o topo bem mais escuro. Volta ao cheio em lg. */}
        <div className="absolute -left-40 -top-24 h-[620px] w-[620px] rounded-full bg-white/[0.07] opacity-40 blur-[160px] lg:opacity-100" />
        <div className="absolute -left-16 top-[38%] h-[460px] w-[460px] -translate-y-1/2 rounded-full bg-white/[0.05] blur-[140px]" />
      </div>

      {/* No mobile, a luz do canto superior esquerdo sobe ate a faixa onde o
          header (de vidro) flutua, deixando o vidro "claro". Este scrim
          empurra a luz pra cima: mantem o topo TOTALMENTE preto (ink-950
          opaco de verdade — `via-ink-950`, sem transparencia no meio, pra nao
          vazar luz na altura do header) por uma faixa alta e so entao esmaece
          pra transparente perto da esfera. Resultado: header e todo o alto do
          hero pretos, a luz aparece so mais embaixo, em volta do orb. Fica
          acima dos blobs (-z-[5] > -z-10) e abaixo do conteudo (z-[2]). Some
          a partir de lg, onde o header e largo/centralizado e isso nao
          acontece. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-[5] h-96 bg-gradient-to-b from-ink-950 via-ink-950 to-transparent lg:hidden"
      />
      {/* Particulas desligadas so por quem pede menos movimento: e um loop de
          canvas continuo, sem quadro parado equivalente, entao a saida
          honesta e nao rodar (mesmo padrao do JarvisOrb `paused`). Rodam
          sempre em modo fraco de proposito — sao a identidade visual da
          Hero, e o modo fraco hoje so mexe num punhado de coisas estruturais
          (ver use-low-power.tsx). */}
      {!reduce && (
        <Particles
          color="#ffffff"
          quantity={90}
          ease={30}
          // Deriva constante pra esquerda (px por quadro, ~18px/s a 60fps):
          // devagar o bastante pra ler como ambiente, nao como animacao
          // disputando atencao com o titulo. No mobile fica 0 — la a Hero e
          // estreita, a travessia seria rapida demais e o movimento lateral
          // competiria com o scroll.
          vx={driftLeft ? -0.3 : 0}
          className="absolute inset-0"
        />
      )}

      {/* lg:pl-* empurra o grid inteiro (as duas colunas, titulo+CTAs e
          esfera+legenda) um pouco para a direita dentro do mesmo max-w-shell,
          sem mudar a largura total do bloco: sobra mais vazio a esquerda do
          que a direita, na proporcao pedida. */}
      <div className="relative z-[2] mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-14 lg:grid-cols-[0.95fr_1.15fr] lg:gap-8 lg:pl-10 xl:pl-16 wide:max-w-shell">
        <div className="order-2 lg:order-1">
          {/* Revelacao palavra a palavra: o titulo se monta como uma frase
              sendo dita, em vez de aparecer inteiro de uma vez. */}
          <h1 className="mx-auto flex max-w-[15ch] flex-wrap justify-center gap-x-[0.28em] text-center font-display text-[2.75rem] font-semibold leading-[1.05] tracking-[-0.03em] text-[#FAFAFA] sm:text-6xl lg:mx-0 lg:justify-start lg:text-left lg:text-7xl">
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
            className="mx-auto mt-7 max-w-[46ch] text-center text-lg font-light leading-relaxed text-white/60 lg:mx-0 lg:text-left"
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
                pagina continua com botoes = full, per o token global).
                Hover: levanta 2px, fundo clareia e cresce bem de leve
                (scale 1.02, centrado nos dois eixos — nao "pro lado" como a
                versao com seta rejeitada antes). Sem mola e sem brilho/
                sombra extra no hover (tambem rejeitados). */}
            <a
              href="#precos"
              className="rounded-xl bg-[#FAFAFA] px-9 py-4 text-center text-base font-semibold text-ink-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_10px_30px_-12px_rgba(255,255,255,0.35)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:scale-[1.02] hover:bg-white active:translate-y-0 active:scale-[0.98] sm:w-fit sm:min-w-[280px]"
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
              {/* `paused` so por "reduzir movimento": desenha um quadro e
                  para (ver jarvis-sphere.tsx). Continua girando em modo
                  fraco de proposito — e a peca central da Hero. */}
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
                  <div
                    className={cn(
                      "flex items-center gap-3 whitespace-nowrap rounded-2xl border border-white/[0.12] bg-ink-900/90 px-5 py-3.5 shadow-[0_14px_40px_-14px_rgba(0,0,0,0.65)]",
                      !reduce && "animate-float-y"
                    )}
                    style={{ "--float-delay": `${float}s` } as React.CSSProperties}
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
                  </div>
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
