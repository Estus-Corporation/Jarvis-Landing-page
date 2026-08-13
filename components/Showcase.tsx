"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { useLenis } from "lenis/react";
import { useReducedMotionSafe } from "@/components/ui/use-reduced-motion-safe";
import { Marquee } from "@/components/ui/3d-testimonials";
import {
  CloudSun,
  MusicNotes,
  Clock,
  GameController,
  X,
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
// No celular os quatro widgets viram uma ESTEIRA continua (`Marquee`, de
// ui/3d-testimonials.tsx — a mesma peca que ja anima os depoimentos desta
// pagina, so que horizontal em vez de vertical). Diferenca deliberada dos
// carrosseis de Organization.tsx/Features.tsx: aqueles param num cartao por
// vez, arrastados pelo dedo, porque cada cartao la carrega uma maquete
// INTEIRA que pede leitura parada. Os widgets sao 4 fatos curtos — icone,
// nome, uma frase — que nao competem por atencao entre si, entao andar
// sozinho em loop (sem parar, sem esperar gesto) le mais como "dashboard
// viva" (o proprio nome da secao) do que como formulario de passo a passo.
// Nao ha estado nenhum aqui: sem indice ativo, sem drag, sem barra de
// progresso — a animacao e 100% CSS (@keyframes marquee, em globals.css),
// e o global `prefers-reduced-motion` (tambem em globals.css) ja para
// qualquer animacao CSS da pagina, entao nao precisa de tratamento extra
// pra reduced-motion aqui.

type Widget = { icon: Icon; title: string; note: string };

// Ordem de leitura da grade (esquerda pra direita, de cima pra baixo).
const WIDGETS: Widget[] = [
  {
    icon: CloudSun,
    title: "Clima",
    note: "Previsão do tempo sempre à vista.",
  },
  {
    icon: MusicNotes,
    title: "Spotify",
    note: "Faixa atual com a capa do álbum.",
  },
  {
    icon: Clock,
    title: "Relógio",
    note: "A hora local, sempre visível.",
  },
  {
    icon: GameController,
    title: "Jogo em execução",
    note: "Ele reconhece o que você está jogando.",
  },
];

const EASE = [0.16, 1, 0.3, 1] as const;

// A captura, num lugar so: ela e desenhada duas vezes (na janela e no
// lightbox) e src/alt/proporcao tem que casar entre as duas.
const SHOT = {
  src: "/images/dashjarvis.webp",
  alt: "Interface do Jarvis: esfera de rede geodésica no centro, com widgets de tarefas, clima, relógio e Spotify ao redor.",
  width: 1536,
  height: 864,
} as const;

// Icone em anel duplo — mesma familia visual do RingIcon de Organization.tsx
// (o "icone de recurso" do site). `size` cobre os dois usos: "sm" (padrao) e
// o tamanho de sempre, pro cabecalho enxuto da lista de desktop; "lg" e so
// pro cartao do carrossel do celular, que ganhou altura de sobra e pede um
// icone mais forte pra preencher o espaco em vez de sobrar vazio.
function RingIcon({
  icon: Glyph,
  className = "",
  size = "sm",
}: {
  icon: Icon;
  className?: string;
  size?: "sm" | "lg";
}) {
  const ring = size === "lg" ? "h-14 w-14" : "h-10 w-10";
  const inset = size === "lg" ? "-inset-[6px]" : "-inset-[5px]";
  const glyph = size === "lg" ? 24 : 18;
  return (
    <span
      className={`relative flex ${ring} shrink-0 items-center justify-center rounded-full border border-white/[0.16] bg-ink-950 ${className}`}
    >
      <span
        aria-hidden
        className={`absolute ${inset} rounded-full border border-white/[0.07]`}
      />
      <Glyph size={glyph} weight="light" aria-hidden className="text-white/85" />
    </span>
  );
}

// ---- Lightbox ----------------------------------------------------------------
// Vai pro <body> por portal em vez de ficar onde foi declarado: a janela do
// app e desenhada dentro de um motion.div animado, e um ancestral com
// `transform` vira bloco de contencao de `position: fixed` — o overlay
// deixaria de cobrir a tela e passaria a se posicionar dentro do cartao.
function Lightbox({
  onClose,
  manageFocus,
}: {
  onClose: () => void;
  manageFocus: boolean;
}) {
  const reduce = useReducedMotionSafe();
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
  }, [onClose, manageFocus]);

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
          src={SHOT.src}
          alt={SHOT.alt}
          width={SHOT.width}
          height={SHOT.height}
          unoptimized
          draggable={false}
          className="h-auto max-h-[86vh] w-auto max-w-full rounded-card border border-white/[0.12] shadow-[0_50px_140px_-40px_rgba(0,0,0,0.9)]"
        />
      </motion.div>
    </motion.div>,
    document.body
  );
}

export default function Showcase() {
  const reduce = useReducedMotionSafe();
  const [expanded, setExpanded] = useState(false);
  // Se a ampliacao foi aberta pelo teclado. So nesse caso o lightbox mexe no
  // foco (ver comentario la dentro) — no clique de mouse, mexer no foco so
  // acende aneis que o visitante nao pediu.
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const close = useCallback(() => setExpanded(false), []);

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
          transition={{ duration: 0.6, ease: EASE }}
          // max-w-3xl (nao mais 2xl): a 48px (sm:text-5xl) o titulo precisa
          // de ~686px pra caber numa linha so — 672px ficava 14px curto.
          className="mx-auto max-w-3xl text-center"
        >
          <SectionEyebrow>Interface</SectionEyebrow>
          {/* Fonte fluida: trava em 48px por volta de 740px de largura,
              bem antes do padding da secao mudar em 1024px. */}
          <h2 className="mt-5 whitespace-nowrap leading-tight font-display text-[length:clamp(0.9rem,calc(7vw_-_3.78px),3rem)] font-semibold tracking-[-0.02em] text-[#FAFAFA] laptop:text-[2.625rem]">
            Uma dashboard viva na sua tela.
          </h2>
          <p className="mx-auto mt-5 max-w-[54ch] text-lg font-light leading-relaxed text-white/55 laptop:mt-4">
            A esfera reage à conversa no centro. Em volta, widgets que você
            arrasta, reorganiza e tinge com o seu tema de cor.
          </p>
        </motion.div>

        {/* A janela e a grade dividem a MESMA largura maxima e o mesmo centro:
            a grade de widgets nasce exatamente sob as bordas da imagem, o que
            e o que faz as duas lerem como um bloco so em vez de dois blocos
            empilhados por acaso. O teto de 1080px existe porque a janela e
            16/9 — em telas `wide` o container vai a 1400px, e ali a imagem
            passaria de 780px de altura, alta demais pra caber num olhar. */}
        <div className="mx-auto mt-12 max-w-[1080px] laptop:mt-9 laptop:max-w-[860px]">
          {/* janela do app */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 24, scale: 0.97 }}
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
            {/* A captura inteira e o botao de ampliar. Sem nenhuma reacao
                visual ao hover — nem selo, nem zoom, nem anel na borda: a
                unica pista e o cursor virar lupa. */}
            <button
              type="button"
              // detail === 0 identifica ativacao por TECLADO: Enter/Espaco num
              // botao disparam um clique sintetico sem contagem de cliques,
              // enquanto o mouse manda 1 ou mais.
              onClick={(e) => {
                setKeyboardOpen(e.detail === 0);
                setExpanded(true);
              }}
              aria-label="Ampliar a imagem da interface do Jarvis"
              // ring-inset, e nao o outline padrao: o outline seria recortado
              // pelo overflow-hidden da janela em tres lados, sobrando so a
              // aresta de cima (a "barra branca"). O ring por dentro fica todo
              // dentro da area visivel. focus-visible: so no teclado.
              className="relative block aspect-[16/9] w-full cursor-zoom-in overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/70"
            >
              <Image
                src={SHOT.src}
                alt={SHOT.alt}
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
            </button>
          </motion.div>

          {/* Divisor rotulado: separa a imagem da legenda dela sem precisar de
              uma caixa. Sem ele os itens encostariam direto no rodape da
              janela e leriam como parte da propria captura de tela. */}
          <motion.div
            initial={reduce ? false : { opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="mt-14 flex items-center gap-5 laptop:mt-10"
          >
            <span className="h-px flex-1 bg-white/[0.18]" aria-hidden />
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-white/65">
              Widgets
            </span>
            <span className="h-px flex-1 bg-white/[0.18]" aria-hidden />
          </motion.div>

          {/* Desktop (lg+): lista simples, como sempre foi — icone a
              esquerda, titulo e nota empilhados a direita. Sem moldura de
              cartao: numa fileira so de 4 num container ja com bordas
              (a janela acima), um cartao por item seria moldura dentro de
              moldura. */}
          <div className="mt-10 hidden lg:grid lg:grid-cols-4 lg:gap-x-8 lg:gap-y-9 laptop:mt-8 laptop:gap-y-7">
            {WIDGETS.map((w, i) => (
              <motion.div
                key={w.title}
                initial={reduce ? false : { opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                // Escalonado por indice: a 0.06s de intervalo os itens entram
                // como uma onda, nao como uma fila.
                transition={{ duration: 0.5, ease: EASE, delay: i * 0.06 }}
                className="flex items-start gap-4"
              >
                <RingIcon icon={w.icon} />
                <div className="min-w-0">
                  <h3 className="font-display text-[15px] font-semibold tracking-[-0.01em] text-[#FAFAFA]">
                    {w.title}
                  </h3>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-white/50">
                    {w.note}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Celular (abaixo de lg): esteira continua, sem parada nenhuma —
              anda sozinha pra esquerda em loop infinito. `Marquee` (mesma
              peca das esteiras de depoimento) repete os 4 cartoes 3x
              (repeat=3) e anima o BLOCO inteiro em `translateX(-100% -
              gap)`; quando um bloco sai completamente, o proximo ja esta
              exatamente onde o primeiro comecou, entao o loop nunca mostra
              costura. -mx-6 px-6 sangra a esteira ate a borda real da tela
              (o titulo/paragrafo acima continuam no respiro normal da
              secao) — e os degrades nas pontas escondem o corte abrupto de
              onde os cartoes entram/saem.
              Altura MENOR que a versao anterior (h-40 = 160px, era h-60 =
              240px): sem gesto pra guiar, um cartao mais compacto deixa
              o olho ver mais de um por vez enquanto a esteira passa. */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="relative -mx-6 mt-10 overflow-hidden px-6 lg:hidden"
          >
            <Marquee repeat={3} className="[--duration:26s] [--gap:1rem] p-1">
              {WIDGETS.map((w) => (
                <div
                  key={w.title}
                  className="flex h-40 w-56 shrink-0 flex-col items-center justify-center gap-2 rounded-card border border-white/[0.1] bg-ink-900/60 p-5 text-center"
                >
                  <RingIcon icon={w.icon} size="lg" className="mx-auto" />
                  <div>
                    <h3 className="font-display text-[15px] font-semibold tracking-[-0.01em] text-[#FAFAFA]">
                      {w.title}
                    </h3>
                    <p className="mt-1 text-[13px] leading-relaxed text-white/50">
                      {w.note}
                    </p>
                  </div>
                </div>
              ))}
            </Marquee>
            {/* degrades: escondem onde os cartoes entram/saem no corte da
                sangria — #0C0C0E casa com o fundo desta secao (ver a classe
                da <section>, mais abaixo). */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-[#0C0C0E] to-transparent"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-[#0C0C0E] to-transparent"
            />
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {expanded && <Lightbox onClose={close} manageFocus={keyboardOpen} />}
      </AnimatePresence>
    </section>
  );
}
