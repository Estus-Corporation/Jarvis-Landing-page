"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { motion, AnimatePresence, useInView } from "motion/react";
import { useLenis } from "lenis/react";
import { useReducedMotionSafe, useSkipEntrance } from "@/components/ui/use-reduced-motion-safe";
import {
  CloudSun,
  SpotifyLogo,
  YoutubeLogo,
  Clock,
  GameController,
  X,
  CaretLeft,
  CaretRight,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";
import SectionEyebrow from "@/components/ui/section-eyebrow";

// SECAO RECONSTRUIDA (3a vez). A versao anterior punha a janela do app no
// meio com duas fileiras de botoes redondos nas laterais (tres de cada lado),
// autoplay trocando o widget ativo a cada 2,6s e uma legenda datilografada
// SOBREPOSTA no rodape da imagem. Tres problemas, todos de estrutura:
//
//   1. Os botoes eram so icone, sem nome. Descobrir o que cada um era
//      exigia clicar um por um — informacao escondida atras de interacao,
//      numa secao cujo trabalho e justamente mostrar o que a tela tem.
//   2. A legenda ficava EM CIMA da imagem, tampando exatamente o rodape da
//      dashboard — o elemento que a secao inteira existe pra exibir.
//   3. Autoplay + efeito de digitacao = texto se reescrevendo sem parar. A
//      secao nunca ficava quieta o suficiente pra ser lida.
//
// Agora: a janela fica SOZINHA e inteira, sem nada por cima nem disputando
// largura, e os widgets viram itens com icone, nome e uma linha de
// explicacao — tudo legivel sem clique e sem espera. Sairam o estado
// `active`, o autoplay, o efeito de digitacao e os botoes. A secao virou
// conteudo parado: chega, mostra e deixa ler.
//
// Os widgets embaixo da janela viraram SO ICONES (pedido do usuario,
// 28/09/2026): uma fileira centralizada com o anel duplo de cada um, sem nome
// nem frase — o nome fica no `title` (dica do mouse) e no texto de leitor de
// tela. Com isso sairam o cartao unico do desktop e a esteira com autoplay
// do celular: cinco icones cabem numa linha so em qualquer largura.

type Widget = { icon: Icon; title: string };

// Ordem de leitura da grade (esquerda pra direita, de cima pra baixo).
const WIDGETS: Widget[] = [
  { icon: CloudSun, title: "Clima" },
  { icon: SpotifyLogo, title: "Spotify" },
  { icon: Clock, title: "Relógio" },
  { icon: GameController, title: "Jogo em execução" },
  { icon: YoutubeLogo, title: "YouTube" },
];

const EASE = [0.16, 1, 0.3, 1] as const;

// CARROSSEL de capturas (pedido do usuario, 28/09/2026): no lugar da captura
// unica (dashjarvis.webp), seis telas reais do app mostrando o mesmo painel
// montado de jeitos diferentes — que e exatamente o "Monte sua tela" do
// titulo. Convertidas de JPG pra WebP (sharp, quality 90, ~100KB cada), mesmo
// padrao das imagens do Roadmap. Desenhadas duas vezes (janela e lightbox),
// por isso src/alt/proporcao moram aqui num lugar so.
const SHOTS = [
  {
    src: "/images/interface-1.webp",
    alt: "Interface do Jarvis com a esfera no centro, assistente e YouTube à esquerda, lista de tarefas à direita, relógio e clima em cima, jogo e Spotify embaixo.",
  },
  {
    src: "/images/interface-2.webp",
    alt: "Interface do Jarvis com atalhos em órbita ao redor da esfera, YouTube à esquerda e Spotify à direita.",
  },
  {
    src: "/images/interface-3.webp",
    alt: "Interface do Jarvis com um vídeo grande no centro, relógio e clima nas laterais, jogo e Spotify embaixo.",
  },
  {
    src: "/images/interface-4.webp",
    alt: "Interface do Jarvis com o vídeo do YouTube em destaque no centro e a esfera pequena no canto.",
  },
  {
    src: "/images/interface-5.webp",
    alt: "Interface do Jarvis com relógio e clima em cima, vídeo no centro, jogo e Spotify embaixo.",
  },
  {
    src: "/images/interface-6.webp",
    alt: "Interface do Jarvis com a esfera no centro, Spotify à esquerda e YouTube à direita.",
  },
] as const;
// As seis tem 1600 de largura e 858-865 de altura. A caixa usa a media; o
// object-cover corta no maximo ~3px de uma delas, invisivel.
const SHOT_W = 1600;
const SHOT_H = 861;
// Tempo de cada captura no autoplay.
const SLIDE_MS = 5000;

// Icone em anel duplo — mesma familia visual do RingIcon de Organization.tsx
// (o "icone de recurso" do site). So a fileira de widgets usa: sem nome nem
// frase do lado, o icone sozinho precisa de presenca. 60px no celular (e o
// que deixa os cinco numa linha so em 390px) e 88px a partir de sm. O tamanho
// do glifo e por classe, nao pelo `size` do Phosphor, pra poder variar por
// breakpoint (o CSS vence o atributo width/height do svg).
function RingIcon({ icon: Glyph }: { icon: Icon }) {
  return (
    <span className="relative flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-full border border-white/[0.16] bg-ink-950 sm:h-[88px] sm:w-[88px]">
      <span
        aria-hidden
        className="absolute -inset-[6px] rounded-full border border-white/[0.07] sm:-inset-[9px]"
      />
      <Glyph weight="light" aria-hidden className="h-7 w-7 text-white/85 sm:h-10 sm:w-10" />
    </span>
  );
}

// Seta do carrossel de capturas. `className` decide onde ela mora (fora da
// janela no desktop, na linha das bolinhas no celular) e inclui o `flex` —
// por isso nao vem aqui, pra `hidden lg:flex` funcionar.
function SlideArrow({
  dir,
  onStep,
  className = "",
}: {
  dir: -1 | 1;
  onStep: (delta: number) => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onStep(dir)}
      aria-label={dir < 0 ? "Imagem anterior" : "Próxima imagem"}
      className={`h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/[0.16] bg-ink-900 text-white/70 outline-none transition-colors duration-200 hover:border-white/40 hover:text-white focus-visible:ring-2 focus-visible:ring-white/70 lg:h-11 lg:w-11 ${className}`}
    >
      {dir < 0 ? <CaretLeft size={16} weight="bold" aria-hidden /> : <CaretRight size={16} weight="bold" aria-hidden />}
    </button>
  );
}

// ---- Lightbox ----------------------------------------------------------------
// Vai pro <body> por portal em vez de ficar onde foi declarado: a janela do
// app e desenhada dentro de um motion.div animado, e um ancestral com
// `transform` vira bloco de contencao de `position: fixed` — o overlay
// deixaria de cobrir a tela e passaria a se posicionar dentro do cartao.
function Lightbox({
  index,
  onStep,
  onClose,
  manageFocus,
}: {
  index: number;
  onStep: (delta: number) => void;
  onClose: () => void;
  manageFocus: boolean;
}) {
  const shot = SHOTS[index];
  const reduce = useReducedMotionSafe();
  const skipEntrance = useSkipEntrance();
  const closeRef = useRef<HTMLButtonElement>(null);
  const lenis = useLenis();

  // Trava a pagina atras do overlay. Duas travas porque sao dois mecanismos:
  // o Lenis roda seu proprio loop de rolagem (overflow hidden nao o alcanca) e
  // o overflow cobre o que sobra — teclado, toque, barra de rolagem nativa.
  // `useLenis` fora do provider (movimento reduzido: o ReactLenis nem monta)
  // cai num contexto de fallback e devolve undefined, entao o `?.` basta.
  useEffect(() => {
    lenis?.stop();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      lenis?.start();
      document.body.style.overflow = previous;
    };
  }, [lenis]);

  // Esc fecha sempre — o ouvinte e no document, entao nao depende de nada
  // estar focado.
  //
  // Ja o FOCO so e mexido quando a abertura veio do teclado (`manageFocus`).
  // Quem abriu com o mouse nao ganha foco nenhum: era isso que deixava a
  // "barra branca" pra tras. Mandar o foco pro X e, ao fechar, devolve-lo pro
  // botao da imagem acendia o anel de foco do navegador nos dois — e no botao
  // da imagem ele aparecia cortado, so a aresta de cima, porque a janela tem
  // overflow-hidden e o botao encosta nas outras tres bordas dela (overflow
  // recorta o outline de um descendente). Dai a barra no topo da captura.
  // Pelo teclado o comportamento continua o correto: o foco entra no dialogo
  // ao abrir e volta pro mesmo ponto ao fechar.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      // Setas do teclado passam as capturas tambem com a imagem ampliada.
      else if (e.key === "ArrowLeft") onStep(-1);
      else if (e.key === "ArrowRight") onStep(1);
    };
    document.addEventListener("keydown", onKeyDown);

    const previouslyFocused = manageFocus
      ? (document.activeElement as HTMLElement | null)
      : null;
    if (manageFocus) closeRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previouslyFocused?.focus?.();
    };
  }, [onClose, onStep, manageFocus]);

  return createPortal(
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label="Imagem ampliada da interface do Jarvis"
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={reduce ? undefined : { opacity: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      // Clicar no fundo fecha. z acima do header (z-50).
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-ink-950/95 p-4 backdrop-blur-sm sm:p-8"
    >
      <button
        ref={closeRef}
        type="button"
        onClick={onClose}
        aria-label="Fechar imagem ampliada"
        // focus-visible (nao focus): anel so pra quem chegou pelo teclado.
        className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full border border-white/[0.16] bg-ink-900/80 text-white/70 outline-none transition-colors duration-200 hover:border-white/40 hover:text-white focus-visible:ring-2 focus-visible:ring-white/70 sm:right-6 sm:top-6"
      >
        <X size={18} weight="bold" aria-hidden />
      </button>

      <motion.div
        initial={reduce ? false : { opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={reduce ? undefined : { opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.3, ease: EASE }}
        // O clique na propria imagem NAO fecha — so o do fundo.
        onClick={(e) => e.stopPropagation()}
        className="max-h-full"
      >
        {/* w-auto + max-h/max-w: a proporcao vem dos atributos width/height,
            entao a imagem encolhe pelo lado que estourar primeiro — altura em
            tela baixa e larga, largura em tela alta e estreita. */}
        <Image
          key={shot.src}
          src={shot.src}
          alt={shot.alt}
          width={SHOT_W}
          height={SHOT_H}
          unoptimized
          draggable={false}
          className="h-auto max-h-[86vh] w-auto max-w-full rounded-card border border-white/[0.12] shadow-[0_50px_140px_-40px_rgba(0,0,0,0.9)]"
        />
      </motion.div>

      {/* Setas: fora da imagem, nas bordas da tela. stopPropagation pra o
          clique nao cair no fundo (que fecha). */}
      {([-1, 1] as const).map((d) => (
        <button
          key={d}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onStep(d);
          }}
          aria-label={d < 0 ? "Imagem anterior" : "Próxima imagem"}
          className={`absolute top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/[0.16] bg-ink-900/80 text-white/70 outline-none transition-colors duration-200 hover:border-white/40 hover:text-white focus-visible:ring-2 focus-visible:ring-white/70 ${
            d < 0 ? "left-4 sm:left-6" : "right-4 sm:right-6"
          }`}
        >
          {d < 0 ? <CaretLeft size={18} weight="bold" aria-hidden /> : <CaretRight size={18} weight="bold" aria-hidden />}
        </button>
      ))}
    </motion.div>,
    document.body
  );
}

export default function Showcase() {
  const reduce = useReducedMotionSafe();
  const skipEntrance = useSkipEntrance();
  const [expanded, setExpanded] = useState(false);
  // Se a ampliacao foi aberta pelo teclado. So nesse caso o lightbox mexe no
  // foco (ver comentario la dentro) — no clique de mouse, mexer no foco so
  // acende aneis que o visitante nao pediu.
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const close = useCallback(() => setExpanded(false), []);

  // ---- Carrossel da janela ----
  const [index, setIndex] = useState(0);
  const step = useCallback(
    (delta: number) => setIndex((i) => (i + delta + SHOTS.length) % SHOTS.length),
    []
  );
  // Autoplay pausa com o mouse em cima (ou foco dentro), com a imagem
  // ampliada, fora da tela, e nunca liga com "reduzir movimento". O `index`
  // nas deps reinicia a contagem a cada troca — clicar numa seta ou bolinha
  // da os 5s inteiros pra captura escolhida, em vez de trocar logo em seguida.
  const [hovering, setHovering] = useState(false);
  const windowRef = useRef<HTMLDivElement>(null);
  const inView = useInView(windowRef, { amount: 0.3 });
  useEffect(() => {
    if (reduce || hovering || expanded || !inView) return;
    const t = setTimeout(() => step(1), SLIDE_MS);
    return () => clearTimeout(t);
  }, [index, reduce, hovering, expanded, inView, step]);
  // Arrasto com o dedo troca de captura. Um arrasto tambem dispara `click` no
  // fim, e isso abriria o lightbox — o ref engole esse clique.
  const pannedRef = useRef(false);

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
      className="relative overflow-hidden bg-[#0C0C0E] px-6 pb-32 pt-20 sm:pb-40 sm:pt-28 lg:px-10 laptop:pb-20 laptop:pt-16 wide:px-16"
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
        {/* linha divisoria: so o brilho estatico no meio, sem o feixe
            animado que corria por cima (beam-sweep) — tirado a pedido do
            usuario em todas as divisorias de secao da pagina. */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      </div>

      <div className="relative mx-auto max-w-6xl wide:max-w-shell">
        <motion.div
          initial={skipEntrance ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, ease: EASE }}
          // max-w-3xl (nao mais 2xl): a 48px (sm:text-5xl) o titulo precisa
          // de ~686px pra caber numa linha so — 672px ficava 14px curto.
          className="mx-auto max-w-3xl text-center"
        >
          <SectionEyebrow>Interface</SectionEyebrow>
          {/* Fonte fluida: trava em 48px por volta de 740px de largura,
              bem antes do padding da secao mudar em 1024px. */}
          {/* Mesma formula de fonte de Roadmap.tsx ("Próximas atualizações"),
              nao mais calibrada pro proprio texto: o pedido foi todos os
              titulos de secao no MESMO tamanho do de Updates, entao a
              formula (e nao so o resultado num ponto) precisa ser igual —
              caso contrario cada titulo volta a ter seu proprio tamanho em
              alguma largura de tela. */}
          {/* wrapper mx-auto w-fit (nao mais inline-block, ver correcao
              identica em Organization.tsx): encolhe pra largura do texto,
              entao a linha (w-full deste wrapper) casa com a frase do
              titulo em qualquer largura, sem virar inline (o que deixava o
              titulo na mesma linha do rotulo em telas largas). */}
          <div className="mx-auto w-fit">
            <h2 className="mt-5 whitespace-nowrap leading-tight font-display text-[length:clamp(0.9rem,calc(10.22vw_-_5.52px),3rem)] font-semibold tracking-[-0.02em] text-[#FAFAFA] laptop:text-[2.625rem]">
              Monte sua tela
            </h2>
            <div aria-hidden className="mt-2 h-px w-full bg-gradient-to-r from-transparent via-white/25 to-transparent laptop:mt-1.5" />
          </div>
          <p className="mx-auto mt-3 max-w-[54ch] text-lg font-light leading-relaxed text-white/55 laptop:mt-2">
            Widgets que você arrasta, reorganiza e personaliza.
          </p>
        </motion.div>

        {/* A janela e a grade dividem a MESMA largura maxima e o mesmo centro:
            a grade de widgets nasce exatamente sob as bordas da imagem, o que
            e o que faz as duas lerem como um bloco so em vez de dois blocos
            empilhados por acaso. O teto de 1080px existe porque a janela e
            16/9 — em telas `wide` o container vai a 1400px, e ali a imagem
            passaria de 780px de altura, alta demais pra caber num olhar. */}
        <div className="mx-auto mt-12 max-w-[1080px] laptop:mt-9 laptop:max-w-[860px]">
          {/* janela do app. O wrapper `relative` existe pras setas: a janela
              tem overflow-hidden, entao elas nao podem morar dentro dela. */}
          <div className="relative">
          <motion.div
            ref={windowRef}
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
            onFocus={() => setHovering(true)}
            onBlur={() => setHovering(false)}
            initial={skipEntrance ? false : { opacity: 0, y: 24, scale: 0.97 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: EASE }}
            // Sem `glow-ring`: a classe acende um anel de luz GIRANDO na borda
            // no hover (ver .glow-ring:hover em globals.css). No lugar dela, um
            // halo PARADO e PERMANENTE por fora da janela — a segunda sombra do
            // box-shadow, somada a de profundidade que ja existia. Nao depende
            // mais de hover, entao nao ha transicao nenhuma aqui: a janela
            // simplesmente e uma tela acesa.
            // Spread negativo encolhe a forma antes de borrar, entao a luz
            // nasce um pouco pra dentro da borda e se espalha macia em vez de
            // desenhar um contorno. O alcance util e ~(blur/2 - spread): com 56
            // e -14 ela morre a ~14px da borda.
            // overflow-hidden nao a corta: overflow recorta filhos, nunca a
            // sombra do proprio elemento.
            //
            // ORDEM IMPORTA, e era ela que fazia o brilho parecer mais forte em
            // cima do que embaixo: box-shadow pinta a PRIMEIRA sombra por cima
            // das seguintes, e a de profundidade e deslocada 50px pra BAIXO —
            // ou seja, ela cobria de preto justamente a metade de baixo do
            // halo, e deixava a de cima intacta. Com o halo declarado primeiro
            // ele passa a ser pintado por cima, e a luz fica igual nos quatro
            // lados. A sombra escura tambem desceu de 50/140/-40 pra
            // 36/110/-48: mais curta e mais recolhida, pra ancorar a janela
            // sem voltar a comer o brilho embaixo.
            className="relative overflow-hidden rounded-card border border-white/[0.12] bg-ink-950 shadow-[0_0_56px_-14px_rgba(255,255,255,0.35),0_36px_110px_-48px_rgba(0,0,0,0.85)]"
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
              {/* Contador da captura atual, no lugar do antigo "ao vivo". */}
              <span className="ml-auto flex items-center gap-2 font-mono text-xs tabular-nums text-white/40">
                <span className="led-dot" aria-hidden />
                {String(index + 1).padStart(2, "0")} / {String(SHOTS.length).padStart(2, "0")}
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
            {/* A captura inteira e o botao de ampliar. Sem nenhuma reacao
                visual ao hover — nem selo, nem zoom, nem anel na borda: a
                unica pista e o cursor virar lupa. */}
            <motion.button
              type="button"
              // detail === 0 identifica ativacao por TECLADO: Enter/Espaco num
              // botao disparam um clique sintetico sem contagem de cliques,
              // enquanto o mouse manda 1 ou mais.
              onClick={(e) => {
                if (pannedRef.current) {
                  pannedRef.current = false;
                  return;
                }
                setKeyboardOpen(e.detail === 0);
                setExpanded(true);
              }}
              onPanEnd={(_, info) => {
                if (Math.abs(info.offset.x) < 50) return;
                pannedRef.current = true;
                step(info.offset.x < 0 ? 1 : -1);
              }}
              aria-label="Ampliar a imagem da interface do Jarvis"
              // ring-inset, e nao o outline padrao: o outline seria recortado
              // pelo overflow-hidden da janela em tres lados, sobrando so a
              // aresta de cima (a "barra branca"). O ring por dentro fica todo
              // dentro da area visivel. focus-visible: so no teclado.
              // touch-pan-y: o arrasto vertical continua rolando a pagina; so
              // o horizontal vira troca de captura.
              className="relative block aspect-[1600/861] w-full cursor-zoom-in touch-pan-y overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/70"
            >
              {/* As seis empilhadas, so a atual visivel: a troca e um
                  crossfade de opacidade (compositor, sem layout), e como todas
                  ja estao no DOM nao ha piscada de carregamento na troca. */}
              {SHOTS.map((shot, i) => (
                <Image
                  key={shot.src}
                  src={shot.src}
                  alt={i === index ? shot.alt : ""}
                  aria-hidden={i !== index || undefined}
                  fill
                  unoptimized
                  sizes="(min-width: 1024px) 1080px, 100vw"
                  className={`object-cover transition-opacity duration-700 ease-out ${
                    i === index ? "opacity-100" : "opacity-0"
                  }`}
                  draggable={false}
                />
              ))}
              {/* realce especular no topo */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"
              />
              {/* cantos de mira HUD */}
              {(
                ["left-3 top-3", "right-3 top-3", "left-3 bottom-3", "right-3 bottom-3"] as const
              ).map((pos) => {
                const [cx, cy] = pos.split(" ");
                return (
                  <span
                    key={pos}
                    aria-hidden
                    className={`pointer-events-none absolute h-5 w-5 ${cx} ${cy} ${
                      cx.startsWith("left") ? "border-l" : "border-r"
                    } ${cy.startsWith("top") ? "border-t" : "border-b"} border-white/40`}
                  />
                );
              })}
            </motion.button>

          </motion.div>

          {/* Setas FORA da janela (pedido do usuario), uma de cada lado, na
              altura do meio da captura. So a partir de lg: abaixo disso nao
              sobra margem ao lado da janela, e as setas descem pra linha das
              bolinhas (logo abaixo). */}
          <SlideArrow dir={-1} onStep={step} className="absolute right-full top-1/2 mr-5 hidden -translate-y-1/2 lg:flex" />
          <SlideArrow dir={1} onStep={step} className="absolute left-full top-1/2 ml-5 hidden -translate-y-1/2 lg:flex" />
          </div>

          {/* Bolinhas: a ativa vira um tracinho largo, mesmo padrao dos
              carrosseis do celular (Organization/Features). No celular as
              setas ficam nas pontas desta linha. */}
          <div className="mt-5 flex items-center justify-center gap-2">
            <SlideArrow dir={-1} onStep={step} className="mr-3 flex lg:hidden" />
            {SHOTS.map((shot, i) => (
              <button
                key={shot.src}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Mostrar imagem ${i + 1} de ${SHOTS.length}`}
                aria-current={i === index || undefined}
                className="flex h-6 items-center px-0.5 outline-none focus-visible:ring-2 focus-visible:ring-white/70"
              >
                <span
                  className={`block h-1.5 rounded-full transition-all duration-300 ${
                    i === index ? "w-6 bg-white" : "w-1.5 bg-white/25 hover:bg-white/50"
                  }`}
                />
              </button>
            ))}
            <SlideArrow dir={1} onStep={step} className="ml-3 flex lg:hidden" />
          </div>

          {/* Divisor rotulado: separa a imagem da legenda dela sem precisar de
              uma caixa. Sem ele os itens encostariam direto no rodape da
              janela e leriam como parte da propria captura de tela.
              "Widgets" agora usa a MESMA pilula (borda + fundo) do rotulo
              "Interface" la em cima (pedido do usuario) — o texto solto
              virou uma pilula com borda, igual a outra. Nao reaproveita o
              componente SectionEyebrow em si (que e usado em toda a pagina
              COM o led-dot piscando) porque aqui o pedido foi sem a bolinha
              — so o mesmo desenho de pilula, escrito na mao. */}
          <motion.div
            initial={skipEntrance ? false : { opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="mt-14 flex items-center gap-5 laptop:mt-10"
          >
            <span className="h-px flex-1 bg-white/[0.18]" aria-hidden />
            <span className="inline-flex items-center rounded-full border border-white/[0.1] bg-white/[0.03] px-3.5 py-1.5 font-display text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
              {/* translate-x-px: move so o TEXTO 1px pra direita — a pilula
                  (borda/fundo do <span> pai) fica exatamente onde estava. */}
              <span className="inline-block translate-x-px">Widgets</span>
            </span>
            <span className="h-px flex-1 bg-white/[0.18]" aria-hidden />
          </motion.div>

          <ul className="mt-10 flex items-center justify-center gap-3 sm:gap-10 laptop:mt-8">
            {WIDGETS.map((w, i) => (
              <motion.li
                key={w.title}
                initial={skipEntrance ? false : { opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                // Escalonado por indice: entram como uma onda, nao em fila.
                transition={{ duration: 0.5, ease: EASE, delay: i * 0.06 }}
                title={w.title}
              >
                <RingIcon icon={w.icon} />
                <span className="sr-only">{w.title}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <Lightbox index={index} onStep={step} onClose={close} manageFocus={keyboardOpen} />
        )}
      </AnimatePresence>
    </section>
  );
}
