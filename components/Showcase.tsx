"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";
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
import SectionEyebrow from "@/components/ui/section-eyebrow";

// SECAO RECONSTRUIDA DO ZERO (2a vez) — antes a dashboard dividia espaco com
// 6 cartoes de widget cheios de texto, 3 de cada lado, o que limitava o
// tamanho dela a uma coluna estreita do meio.
//
// Ideia nova: a imagem e a PROTAGONISTA de verdade (bem maior — sem cartoes
// de texto competindo por largura). Os widgets viram botoes de icone so,
// numa selecao automatica (mesmo mecanismo do hub de Integracoes: um ativo
// por vez, autoplay, para no hover/foco) e a legenda viva embaixo da imagem
// conta o que aquele widget faz. Menos elementos, mais imagem, mesma
// informacao — so que contada uma de cada vez em vez de todas de uma vez.

type Widget = { icon: Icon; title: string; note: string };

// 3 a esquerda, 3 a direita: a ordem aqui e a ordem visual de cima pra baixo
// em cada lado (e a ordem do autoplay, esquerda primeiro).
const leftWidgets: Widget[] = [
  { icon: CloudSun, title: "Clima e relógio", note: "Previsão e hora local sempre à vista." },
  { icon: MusicNotes, title: "Spotify", note: "Faixa atual com a capa do álbum." },
  { icon: Timer, title: "Timer e pomodoro", note: "Ciclos de foco controlados por voz." },
];

const rightWidgets: Widget[] = [
  { icon: GameController, title: "Jogo em execução", note: "Ele reconhece o que você está jogando." },
  { icon: ListChecks, title: "Tarefas e agenda", note: "Lembretes e compromissos do dia." },
  { icon: ChatCircleText, title: "Chat com imagens", note: "Conversa por texto quando falar não dá." },
];

const allWidgets = [...leftWidgets, ...rightWidgets];

const AUTOPLAY_MS = 2600;

// Botao de icone so, sem texto. Ativo = fundo branco solido + icone preto
// (mesmo tratamento do botao selecionado em "Ele age no computador, nao so
// no chat.", Features.tsx, e da faixa de garantia em Testimonials.tsx) — o
// resto do site converge pro mesmo "selo branco" pra indicar selecao/ativo.
// onMouseEnter/onFocus escolhem o widget tanto no hover (mouse) quanto no
// toque/tab (foco).
function WidgetIcon({
  widget,
  active,
  onActivate,
}: {
  widget: Widget;
  active: boolean;
  onActivate: (w: Widget) => void;
}) {
  const Glyph = widget.icon;
  return (
    <button
      type="button"
      // onClick, nao onMouseEnter/onFocus: precisa de uma acao explicita
      // (clique ou Enter/Espaco com o botao focado — onClick cobre os dois)
      // pra trocar o widget selecionado, em vez de mudar so por passar o
      // mouse por cima. O container ao redor ainda pausa o autoplay no
      // hover (onMouseEnter/onMouseLeave la fora), so a SELECAO em si que
      // agora exige clique.
      onClick={() => onActivate(widget)}
      aria-label={`${widget.title}: ${widget.note}`}
      aria-pressed={active}
      className={`glow-ring flex h-14 w-14 shrink-0 items-center justify-center rounded-full border transition-colors duration-300 sm:h-16 sm:w-16 ${
        active
          ? "glow-ring--active border-white bg-[#FAFAFA]"
          : "border-white/[0.12] bg-ink-800 hover:border-white/25"
      }`}
    >
      <Glyph
        size={22}
        weight="light"
        aria-hidden
        className={`transition-colors duration-300 ${
          active ? "text-ink-950" : "text-white/60"
        }`}
      />
    </button>
  );
}

export default function Showcase() {
  const reduce = useReducedMotionSafe();
  const [active, setActive] = useState<Widget>(allWidgets[0]);
  const [paused, setPaused] = useState(false);

  // Autoplay: destaca um widget por vez, girando pela lista toda. Para no
  // hover/foco. Mesmo mecanismo do hub de Integracoes.
  useEffect(() => {
    if (reduce || paused) return;
    const id = setInterval(() => {
      setActive((cur) => {
        const idx = allWidgets.findIndex((w) => w.title === cur.title);
        return allWidgets[(idx + 1) % allWidgets.length];
      });
    }, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [reduce, paused]);

  const handleActivate = React.useCallback((w: Widget) => setActive(w), []);

  // Legenda com efeito de escrita, igual ao SpokenCaption de baixo da esfera
  // na Hero (ver components/ui/spoken-caption.tsx) — so que aqui o "texto"
  // muda por causa de um widget diferente ficar ativo (hover ou autoplay dos
  // icones), nao por um ciclo de frases proprio. Titulo + nota viram UMA
  // string so pra digitar (`combined`); na hora de desenhar, `chars` corta
  // essa string e o pedaco e repartido de volta em titulo (negrito) e nota
  // (normal) pelo comprimento do titulo.
  const combined = `${active.title} ${active.note}`;
  const [chars, setChars] = useState(reduce ? combined.length : 0);

  useEffect(() => {
    if (reduce) {
      setChars(combined.length);
      return;
    }
    setChars(0);
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setChars(i);
      if (i >= combined.length) clearInterval(id);
    }, 26);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active.title, reduce]);

  const typed = combined.slice(0, chars);
  const typedTitle = typed.slice(0, active.title.length);
  const typedNote = typed.slice(active.title.length);
  const typing = chars < combined.length;

  return (
    <section
      id="interface"
      // FUNDO HERDADO: esta secao subiu de lugar (passou a vir logo depois de
      // Recursos) e adotou o fundo que ja morava nessa posicao da pagina — o
      // tom #0C0C0E com grade e feixe, que antes era o da secao de
      // Organizacao. Os fundos ficaram parados; o conteudo e que trocou.
      //
      // bg-[#0C0C0E]: bg-ink-900 (#0E0E10) escurecido de leve — bg-ink-950
      // (#0A0A0B) e o proximo tom da escala, mas o salto direto ate la ficava
      // forte demais (a secao ficava identica ao fundo puro da pagina), e um
      // ajuste de so ~25% do caminho (#0D0D0F) ficou leve demais no sentido
      // oposto. Este tom fica a ~40% do caminho ate ink-950.
      // laptop:* (ver tailwind.config.ts): tela de desktop, mas baixa. Aqui a
      // altura vem quase toda da janela do app, que e 16/9 — ou seja, a
      // altura dela e refem da largura. Por isso o ajuste de notebook e um
      // teto de largura na janela (mais abaixo), e nao uma altura fixa.
      className="relative overflow-hidden bg-[#0C0C0E] px-6 pb-28 pt-20 sm:pb-36 sm:pt-28 lg:px-10 laptop:pb-16 laptop:pt-16 wide:px-16"
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
          <SectionEyebrow>Interface</SectionEyebrow>
          <h2 className="mt-5 whitespace-nowrap font-display text-3xl font-semibold tracking-[-0.02em] text-[#FAFAFA] sm:text-5xl laptop:text-[2.625rem]">
            Uma dashboard viva na sua tela.
          </h2>
          <p className="mx-auto mt-5 max-w-[54ch] text-lg font-light leading-relaxed text-white/55 laptop:mt-4">
            A esfera reage à conversa no centro. Em volta, widgets que você
            arrasta, reorganiza e tinge com o seu tema de cor.
          </p>
        </motion.div>

        {/* Palco: 3 colunas em lg (icones | janela | icones), mas agora as
            colunas de icone sao "auto" (largura do proprio botao, ~64px) em
            vez de fracoes — a janela (1fr) fica com QUASE toda a largura
            disponivel. E a mudanca central deste redesenho: antes eram
            0.8fr/1.75fr/0.8fr (a janela levava ~52% do espaco), agora e
            auto/1fr/auto (a janela leva tudo que sobra, ~85-90%). */}
        <div
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          className="mt-8 grid grid-cols-1 items-center gap-6 lg:grid-cols-[auto_1fr_auto] lg:gap-8 laptop:mt-8"
        >
          {/* icones esquerda (lg) */}
          <div className="hidden flex-col gap-5 lg:flex">
            {leftWidgets.map((w) => (
              <WidgetIcon
                key={w.title}
                widget={w}
                active={active.title === w.title}
                onActivate={handleActivate}
              />
            ))}
          </div>

          {/* janela do app */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 24, scale: 0.97 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            // glow-ring SEM --active: ver comentario equivalente em
            // Features.tsx — o anel girando repinta a cada frame pra
            // sempre (nao e compositor-only), caro demais pra deixar ligado
            // sem interacao numa janela grande e sempre visivel.
            // laptop:max-w-*: a janela e 16/9, entao limitar a LARGURA e o
            // unico jeito de baixar a altura sem cortar a imagem. Os 780px
            // dao ~439px de imagem no lugar dos ~540px que a largura cheia
            // gerava; `mx-auto` mantem ela centrada entre as duas fileiras
            // de icones, que continuam onde estavam.
            className="glow-ring relative mx-auto w-full max-w-[640px] overflow-hidden rounded-card border border-white/[0.12] bg-ink-950 shadow-[0_50px_140px_-40px_rgba(0,0,0,0.9)] lg:max-w-none laptop:max-w-[840px]"
          >
            {/* barra de titulo */}
            <div className="flex items-center gap-3 border-b border-white/[0.08] bg-ink-900/80 px-4 py-3">
              <span className="flex gap-1.5" aria-hidden>
                <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
              </span>
              <span className="ml-1 font-display text-xs font-semibold uppercase tracking-[0.15em] text-white/45">
                Jarvis
              </span>
              <span className="ml-auto flex items-center gap-2 text-xs text-white/40">
                <span className="led-dot" aria-hidden />
                ao vivo
              </span>
            </div>

            {/* a imagem: aspect-[16/9], igual a proporcao real do arquivo
                (1536x864) — antes era 16/10 (proporcao da imagem antiga),
                que cortava as laterais desta por object-cover tentar
                preencher uma caixa mais "quadrada" que a imagem. Com a
                caixa na MESMA proporcao do arquivo, cover nao corta nada.

                unoptimized: o arquivo fonte JA e um .webp comprimido. Sem
                isso, o otimizador de imagem do Next decodifica esse webp e
                RE-comprime pra outro webp (uma 2a passada com perda, mesmo
                em quality=100 — webp 100 nao e bit-a-bit identico ao
                original, e comprimir duas vezes acumula perda, visivel
                sobretudo nos pontinhos da esfera e nas estrelas de fundo).
                unoptimized manda o Next servir os bytes originais direto,
                sem reprocessar nada — a imagem fica identica ao arquivo
                fonte. Custo: sem srcset responsivo, mas o arquivo ja e leve
                (165KB) e nao vale a pena trocar fidelidade por isso aqui. */}
            <div className="relative aspect-[16/9] w-full">
              <Image
                src="/images/dashjarvis.webp"
                alt="Interface do Jarvis: esfera de rede geodésica no centro, com widgets de tarefas, clima, relógio e Spotify ao redor."
                fill
                unoptimized
                className="object-cover"
                draggable={false}
              />
              {/* realce especular no topo */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"
              />
              {/* cantos de mira HUD */}
              {(
                ["left-3 top-3", "right-3 top-3", "left-3 bottom-3", "right-3 bottom-3"] as const
              ).map((pos) => {
                const [x, y] = pos.split(" ");
                return (
                  <span
                    key={pos}
                    aria-hidden
                    className={`pointer-events-none absolute h-5 w-5 ${x} ${y} ${
                      x.startsWith("left") ? "border-l" : "border-r"
                    } ${y.startsWith("top") ? "border-t" : "border-b"} border-white/40`}
                  />
                );
              })}

              {/* legenda viva, agora SOBREPOSTA na parte inferior da imagem
                  (antes era uma caixa solta abaixo das fileiras de icones).
                  Mesmo efeito de escrita do SpokenCaption da Hero; fica
                  ancorada no rodape da janela, centralizada. bg mais opaco
                  (ink-950/80) + blur pra o texto ler por cima da imagem. */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center p-3 sm:p-4">
                <div className="pointer-events-auto flex max-w-[calc(100%-2rem)] items-center justify-center rounded-card border border-white/[0.12] bg-ink-950/80 px-5 py-3 text-center backdrop-blur-md">
                  <p className="text-balance text-sm leading-relaxed sm:text-base" aria-live="polite">
                    <span className="font-display font-semibold text-[#FAFAFA]">
                      {typedTitle}
                    </span>
                    <span className="font-light text-white/60">{typedNote}</span>
                    {typing && !reduce && (
                      <span className="ml-0.5 inline-block h-[1.1em] w-[2px] translate-y-[2px] animate-pulse bg-white/70 align-middle" />
                    )}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* icones direita (lg) */}
          <div className="hidden flex-col gap-5 lg:flex">
            {rightWidgets.map((w) => (
              <WidgetIcon
                key={w.title}
                widget={w}
                active={active.title === w.title}
                onActivate={handleActivate}
              />
            ))}
          </div>
        </div>

        {/* icones em linha (abaixo de lg): mesma selecao, so que todos os 6
            numa fileira so em vez de duas colunas de 3. */}
        <div
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:hidden"
        >
          {allWidgets.map((w) => (
            <WidgetIcon
              key={w.title}
              widget={w}
              active={active.title === w.title}
              onActivate={handleActivate}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
