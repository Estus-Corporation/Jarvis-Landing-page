"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  motion,
  animate,
  useMotionValue,
  type PanInfo,
} from "motion/react";
import { useReducedMotionSafe } from "@/components/ui/use-reduced-motion-safe";
import { useMediaQuery } from "@/components/ui/use-media-query";
import {
  DeviceMobile,
  House,
  Car,
  ArrowRight,
  CaretUp,
  CaretDown,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";
import SectionEyebrow from "@/components/ui/section-eyebrow";

// Secao "Proximas atualizacoes": carrossel autocontido (setas + autoplay),
// NAO mais um "scrollytelling" preso ao scroll da pagina — trocar de item
// nao depende de rolar uma faixa de 3 telas, e a secao tem altura normal
// (uma tela so), igual as vizinhas. Autoplay para no hover/foco e com
// "reduzir movimento".
//
// Existe por duas razoes de venda —
//  1) mostra que o Jarvis e uma plataforma em expansao, nao um produto parado.
//  2) fecha a pagina reforcando "assine agora": quem assina hoje recebe cada
//     uma dessas atualizacoes sem cobranca adicional.
type RoadmapItem = {
  icon: Icon;
  step: string;
  title: string;
  body: string;
  // Versao mais curta do body, so pra caber no notebook (ver `isLaptop`,
  // mais abaixo) sem passar da base da imagem, onde o botao "Quero ser
  // notificado!" agora fica fixo. Opcional: quando ausente, usa `body` normal
  // em todas as telas.
  bodyCompact?: string;
  // Versao mais curta AINDA, so pro carrossel do celular: la o cartao ja e a
  // largura da tela inteira, mas o pedido foi reduzir especificamente a
  // quantidade de texto ABAIXO da imagem — mais curta que a bodyCompact do
  // notebook (que so precisa cortar por causa da ALTURA da tela, nao por
  // ser celular). Opcional: quando ausente, cai pra bodyCompact e depois
  // pra body.
  bodyMobile?: string;
  quote: string;
  image: string;
};

const items: RoadmapItem[] = [
  {
    icon: DeviceMobile,
    step: "01",
    title: "App Mobile",
    body: "Um app pra continuar comandando o Jarvis do celular, mesmo longe do computador. Pergunte algo, peça uma tarefa ou só acompanhe o que ele está fazendo — tudo pelo mesmo Jarvis, agora no seu bolso. Notificações chegam na hora certa, e o histórico da conversa segue com você entre o computador e o celular, sem perder o fio.",
    bodyMobile:
      "Um app pra continuar comandando o Jarvis do celular, mesmo longe do computador. Notificações chegam na hora certa, e a conversa segue com você entre os dois aparelhos.",
    quote: "Jarvis, quanto falta pro meu build terminar?",
    image: "/images/mobile.webp",
  },
  {
    icon: House,
    step: "02",
    title: "Dispositivos Smart",
    body: "Lâmpada, ar-condicionado, tomada inteligente: o mesmo Jarvis que cuida do seu PC passa a cuidar da sua casa. Chegou e já quer tudo do jeito certo? Basta pedir, e ele ajusta a casa inteira antes de você tirar o casaco. Crie rotinas pra manhã, pra noite ou pra quando sair — um comando só, e cada cômodo responde do jeito que você combinou.",
    bodyCompact:
      "Lâmpada, ar-condicionado, tomada inteligente: o mesmo Jarvis que cuida do seu PC passa a cuidar da sua casa. Peça, e ele ajusta tudo antes de você tirar o casaco. Crie rotinas pra manhã, pra noite ou pra saída — um comando só, e cada cômodo responde do jeito certo.",
    bodyMobile:
      "O mesmo Jarvis que cuida do seu PC passa a cuidar da sua casa: luz, ar-condicionado, tomada. Crie rotinas pra manhã, noite ou saída — um comando só.",
    quote: "Jarvis, apaga as luzes e liga o ar-condicionado.",
    image: "/images/iot.webp",
  },
  {
    icon: Car,
    step: "03",
    title: "App Multimídia",
    body: "Integrado à multimídia do carro. Rota, mensagem, playlist — peça sem tirar as mãos do volante. No trânsito ou na estrada, é só falar: ele entende o pedido e cuida do resto enquanto você guia. Ele também avisa sobre trânsito na rota, sugere um caminho melhor e lê as mensagens em voz alta, sem você precisar olhar pra tela.",
    bodyCompact:
      "Integrado à multimídia do carro. Rota, mensagem, playlist — peça sem tirar as mãos do volante. Ele avisa sobre trânsito na rota, sugere um caminho melhor e lê as mensagens em voz alta, sem você precisar olhar pra tela.",
    bodyMobile:
      "Integrado à multimídia do carro. Rota, mensagem, playlist — peça sem tirar as mãos do volante. Ele também avisa sobre o trânsito na rota.",
    quote: "Jarvis, traçar trajeto para casa.",
    image: "/images/car.webp",
  },
];

const AUTOPLAY_MS = 6000;

// ---- Carrossel de arrastar (so no celular, abaixo de md) -----------------
// A coluna de setas verticais + tracinhos (CarouselControl/Pagination, logo
// abaixo) foi desenhada pro mouse — clicar num alvo pequeno e preciso. No
// celular ela vira um carrossel de arrastar, so que SEM a espiada do
// vizinho que Organization.tsx/Features.tsx tem: aqui o cartao carrega uma
// imagem que quer o espaco todo, e reservar uma fatia da largura pro
// vizinho so pra apertar essa imagem nao valia a troca. Cada cartao ocupa a
// LARGURA INTEIRA da tela (sem espiada — PEEK e zero), entao em repouso so
// se ve um cartao por vez.
//
// GAP nao e zero, porem: sem NENHUM vao, o cartao seguinte encostava direto
// no fim do cartao atual assim que o arrasto comecava a revelar os dois ao
// mesmo tempo — os dois liam como um so, colados, no meio do gesto. O vao
// so aparece NESSE momento (arrastando), nunca em repouso, e e so uma tira
// da cor de fundo entre os dois — suficiente pra dizer "isto e OUTRO
// cartao chegando", nao mais que isso.
const ROADMAP_SWIPE_DISTANCE = 56; // px percorridos
const ROADMAP_SWIPE_VELOCITY = 380; // px/s no momento em que o dedo solta
const ROADMAP_GAP = 32; // px de vao entre cartoes, so visivel arrastando (= gap-8, pedido do usuario — era 16/gap-4)

// Fundo IDENTICO ao de Integracoes.tsx ("Tudo gira em torno do Jarvis."):
// mesma grade, mesma mascara, mesma linha de brilho no topo.
function SectionBackdrop() {
  return (
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
      {/* linha divisoria: so o brilho estatico no meio, sem o feixe animado
          que corria por cima (beam-sweep) — tirado a pedido do usuario em
          todas as divisorias de secao da pagina. */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
    </div>
  );
}

// Tracinhos de progresso empilhados — agora do MESMO comprimento (estilo
// Instagram Stories, so que vertical), cada um representando um item: quem
// ja passou fica cheio, quem ainda vai vir fica vazio, e o ATIVO enche em
// tempo real, no mesmo ritmo do proprio relogio do autoplay (AUTOPLAY_MS) —
// da pra literalmente ver quanto falta pra trocar sozinho, em vez de so
// saber QUAL esta ativo. Some a animacao (mas mantem um realce estatico) no
// hover/foco: e quando o autoplay pausa, e o relogio dele reinicia do zero
// quando volta (ver comentario no useEffect, mais abaixo) — a barra reflete
// exatamente isso, em vez de fingir que retoma de onde parou.
function Pagination({
  active,
  paused,
  onSelect,
}: {
  active: number;
  paused: boolean;
  onSelect: (index: number) => void;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      {items.map((item, index) => (
        <button
          key={item.title}
          type="button"
          onClick={() => onSelect(index)}
          aria-label={`Ir para "${item.title}"`}
          aria-current={index === active}
          // O tracinho visivel e so 4px de largura (w-1) de proposito — mas
          // isso tambem seria o alvo de toque inteiro sem ajuda. O
          // pseudo-elemento abaixo (before:) estende a area CLICAVEL 10px
          // pra cada lado (24px de largura no total) sem engordar o tracinho
          // visual: ha espaco de sobra dos dois lados (a coluna vizinha mais
          // proxima e o proprio texto do item, bem mais longe que isso), e
          // verticalmente cada botao ja tem 40px (h-10) de altura.
          //
          // overflow-hidden PRECISA sair do botao e ir pro <span> visual
          // logo abaixo: se ficasse aqui, cortaria tambem o before: (que so
          // "vaza" pra fora da caixa de 4px de proposito, pra virar a area de
          // toque) — overflow-hidden clipa pintura E deteccao de clique dos
          // dois, nao so do conteudo que devia ficar preso na forma da
          // pilula (o preenchimento animado, mais abaixo).
          className="group relative h-10 w-1 shrink-0 before:absolute before:-inset-x-2.5 before:inset-y-0 before:content-['']"
        >
          <span
            aria-hidden
            className={`absolute inset-0 overflow-hidden rounded-full transition-colors duration-300 ${
              index === active && paused
                ? "bg-white/35"
                : "bg-white/[0.15] group-hover:bg-white/25"
            }`}
          >
            {/* ja mostrado neste ciclo: cheio */}
            {index < active && (
              <span
                aria-hidden
                className="absolute inset-0 rounded-full bg-white/80"
              />
            )}
            {/* o ativo, enchendo ao vivo. `key={active}` remonta o span toda
                vez que ESTE item vira o ativo (inclusive de novo, quando o
                carrossel da a volta) — e o que reinicia a animacao do 0%
                sempre, em vez de continuar de onde uma rodada anterior parou. */}
            {index === active && !paused && (
              <span
                key={active}
                aria-hidden
                className="roadmap-fill absolute inset-y-0 inset-x-0 origin-top rounded-full bg-white/80"
                style={{ animationDuration: `${AUTOPLAY_MS}ms` }}
              />
            )}
          </span>
        </button>
      ))}
    </div>
  );
}

// Setas de cima/baixo (nao mais esquerda/direita): o controle inteiro agora e
// uma coluna, entao carets horizontais apontariam pra um eixo em que nada se
// move. Os rotulos continuam "anterior"/"proxima" — quem usa leitor de tela
// ouve a ordem do carrossel, nao a direcao do desenho.
function ArrowButton({
  direction,
  onClick,
}: {
  direction: "up" | "down";
  onClick: () => void;
}) {
  const Glyph = direction === "up" ? CaretUp : CaretDown;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={direction === "up" ? "Atualização anterior" : "Próxima atualização"}
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/[0.12] text-white/60 transition-colors duration-200 hover:border-white/30 hover:bg-white/[0.06] hover:text-white"
    >
      <Glyph size={16} weight="bold" aria-hidden />
    </button>
  );
}

// Controle completo do carrossel numa coluna so: seta pra cima, tracinhos de
// progresso, seta pra baixo. Nao se posiciona mais sozinho (era
// `self-stretch` numa linha flex) — quem centraliza ele agora e o pai, em
// cima da trilha vertical (ver comentario grande mais abaixo).
function CarouselControl({
  active,
  paused,
  onSelect,
}: {
  active: number;
  paused: boolean;
  onSelect: (index: number) => void;
}) {
  return (
    <div className="flex w-9 shrink-0 flex-col items-center gap-4">
      <ArrowButton direction="up" onClick={() => onSelect(active - 1)} />
      <Pagination active={active} paused={paused} onSelect={onSelect} />
      <ArrowButton direction="down" onClick={() => onSelect(active + 1)} />
    </div>
  );
}

export default function Roadmap() {
  const reduce = useReducedMotionSafe();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  // Se o carrossel do celular ja foi arrastado (ou um tracinho dele tocado)
  // ao menos uma vez. As setas/pontinhos do desktop so RESETAM o relogio do
  // autoplay ao clicar (ver o useEffect do autoplay, mais abaixo) — nunca o
  // desligam, porque um clique e instantaneo, nao ha "meio do gesto" pra
  // atropelar. Arrastar e diferente: e um gesto CONTINUO, e o autoplay
  // trocando de cartao por baixo do dedo no meio dele seria briga de
  // controle (mesmo raciocinio do `manual` de Features.tsx). Por isso so o
  // carrossel mobile liga isto, e ligado ele desliga o autoplay de vez.
  const [manual, setManual] = useState(false);

  // abaixo de md a secao vira o carrossel de arrastar (ver mais abaixo) —
  // subido pra ca (era declarado so la embaixo) porque o autoplay, logo a
  // seguir, tambem precisa saber se esta no celular.
  const isMobileCarousel = useMediaQuery("(max-width: 767px)");

  // Visibilidade da secao no celular: mesmo mecanismo de Features.tsx ("Ele
  // age de verdade") — o autoplay so deve tocar enquanto "Updates" esta de
  // fato na tela. Comeca quando o visitante rola ate ela e pausa se ele sair,
  // em vez de ficar avancando sozinha escondida no fundo da pagina. So
  // importa no celular: no desktop o hover ja da controle de pausa (`paused`,
  // acima).
  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Altura do item ativo: a coluna esquerda se ajusta a ela (os itens ficam
  // sobrepostos em absolute, so o ativo visivel), pra o botao ficar sempre
  // colado no conteudo sem vao nem sobreposicao.
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [contentHeight, setContentHeight] = useState(0);

  // No notebook (mesma faixa do `laptop:` do tailwind.config.ts — tela larga
  // mas baixa), o botao "Quero ser notificado!" precisa ficar PARADO, nunca
  // descer quando o item ativo trocar. Por isso, so nessa faixa, contentHeight
  // usa a altura do MAIOR item (nao so do ativo) — o botao passa a se ancorar
  // sempre no mesmo lugar (o pior caso), em vez de subir/descer junto com o
  // texto de cada atualizacao.
  const isLaptop = useMediaQuery("(min-width: 1024px) and (max-height: 900px)");

  useLayoutEffect(() => {
    const measure = () => {
      if (isLaptop) {
        const heights = itemRefs.current.map((el) => el?.offsetHeight ?? 0);
        setContentHeight(Math.max(0, ...heights));
        return;
      }
      const el = itemRefs.current[active];
      if (el) setContentHeight(el.offsetHeight);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [active, isLaptop]);

  // Altura real da imagem (coluna direita): medida do mesmo jeito que
  // contentHeight, pra o botao "Quero ser notificado!" poder se ancorar no
  // fim dela (ver `stageHeight` mais abaixo). offsetHeight volta 0 quando a
  // imagem esta `hidden` (abaixo de md), o que desativa essa ancoragem
  // sozinho no celular — Math.max cai de volta pra contentHeight.
  const imageRef = useRef<HTMLDivElement | null>(null);
  const [imageHeight, setImageHeight] = useState(0);

  useLayoutEffect(() => {
    const measure = () => {
      if (imageRef.current) setImageHeight(imageRef.current.offsetHeight);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [active]);

  // Altura do proprio botao: precisa dela pra mirar o CENTRO dele na linha
  // da imagem, nao o topo — so alinhar o topo deixava o botao inteiro
  // pendurado ABAIXO da linha (o que a altura dele ocupa, ~54px, sobrava
  // toda pra baixo). So muda com o breakpoint (o texto do botao nao muda),
  // entao mede uma vez e so re-mede em resize, sem depender de `active`.
  const buttonRef = useRef<HTMLDivElement | null>(null);
  const [buttonHeight, setButtonHeight] = useState(0);

  useLayoutEffect(() => {
    const measure = () => {
      if (buttonRef.current) setButtonHeight(buttonRef.current.offsetHeight);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // buttonTop: posicao (a partir do topo do wrapper) de onde o botao COMECA.
  // Direto — nao mais "infla o texto pra empurrar o botao por tabela" —
  // pra nao depender de como flex/margin interagem: e so max() entre "logo
  // depois do texto, com respiro minimo" e "o BOTAO INTEIRO acima da linha
  // da imagem, com o fundo dele encostando nela" (imageHeight - a altura
  // toda do botao). Testado centralizado (so metade do botao) antes, mas
  // ainda deixava metade do botao pendurada abaixo da linha — isso aqui
  // encosta o rodape do botao na base da imagem, sem passar dela.
  //
  // No notebook, porem, o botao precisa ficar PARADO — nunca descer com o
  // texto do item ativo (ver comentario em `isLaptop`, acima). Por isso, so
  // nessa faixa, buttonTop ignora contentHeight de vez e usa direto
  // imageHeight - buttonHeight: como a altura da imagem nao muda entre os
  // itens, essa conta da sempre o mesmo numero, e o rodape do botao fica
  // sempre encostado na base da imagem.
  const MIN_GAP = 24;
  const buttonTop = isLaptop
    ? Math.max(0, imageHeight - buttonHeight)
    : Math.max(contentHeight + MIN_GAP, imageHeight - buttonHeight);

  // Respiro entre a citacao (ancorada no fundo do item, so no notebook — ver
  // `mt-auto` mais abaixo) e o botao, pra ela nao ficar colada nele.
  const QUOTE_GAP = 24;

  // Autoplay: avanca sozinho a cada AUTOPLAY_MS. Reiniciar o efeito toda vez
  // que `active` muda (inclusive quando muda por causa do proprio autoplay)
  // recomeca a contagem do zero — e o que faz clicar numa seta ou num
  // pontinho "resetar" o relogio em vez de só pular um tick. Para no
  // hover/foco (nao incomoda quem esta lendo) e com "reduzir movimento".
  useEffect(() => {
    if (reduce || paused || manual) return;
    // Fora da tela no celular: nao avanca sozinha. O cleanup da execucao
    // anterior deste efeito (que roda automaticamente quando `inView` muda)
    // ja cancela o interval pendente — e isso que "pausa" ao sair da secao.
    if (isMobileCarousel && !inView) return;
    const id = setInterval(() => {
      setActive((prev) => (prev + 1) % items.length);
    }, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [active, reduce, paused, manual, isMobileCarousel, inView]);

  const goTo = (index: number) => {
    setActive(((index % items.length) + items.length) % items.length);
  };

  // ---- Mecanica do carrossel mobile ---------------------------------------
  // Mesmas pecas de Organization.tsx (posFor/snapTo/thumbX), so que mais
  // simples: sem PEEK nem GAP (ver comentario grande em ROADMAP_SWIPE_*,
  // mais acima), o passo de uma parada e sempre uma largura de tela inteira
  // — `posFor` nem precisa mais de Math.max/clamp, ja que -idx*mobileStride
  // bate exato em mobileMinX na ultima parada.
  // Reusa o MESMO `active` do carrossel de desktop (nao um indice proprio):
  // os dois sao a mesma "posicao no roadmap", so a pele muda com a largura
  // da tela, entao virar de tablet pra celular no meio nunca perde o lugar.
  // (isMobileCarousel foi movido pra cima, perto do autoplay — ver la.)

  // Altura do TITULO, empatada entre os 3 cartoes do carrossel mobile. Sem
  // isso, cada `h3` quebra no numero de linhas que o proprio texto pedir
  // (o titulo do Update 3, "Jarvis no painel do seu carro", e o unico dos
  // tres que pede 3 linhas dentro do max-w-[16ch] em vez de 2) — e como a
  // imagem vem logo depois do titulo no fluxo normal do cartao, ela nascia
  // mais baixo SO nesse cartao, o "pulo" que aparecia arrastando pra ele.
  // Reservar a altura do titulo mais alto nos tres empata a posicao da
  // imagem (e de tudo abaixo dela) nos tres, mesmo esquema de medicao que
  // headHeights/stageHeights faz em Organization.tsx.
  const mobileTitleRefs = useRef<(HTMLHeadingElement | null)[]>([]);
  const [mobileTitleHeights, setMobileTitleHeights] = useState<number[]>([]);
  useLayoutEffect(() => {
    const bump = (i: number) => (h: number) =>
      setMobileTitleHeights((prev) => {
        if (prev[i] === h) return prev;
        const next = [...prev];
        next[i] = h;
        return next;
      });
    const ros = mobileTitleRefs.current.map((el, i) => {
      if (!el) return null;
      const set = bump(i);
      const ro = new ResizeObserver(([entry]) => set(entry.contentRect.height));
      ro.observe(el);
      return ro;
    });
    return () => ros.forEach((ro) => ro?.disconnect());
  }, []);
  const mobileTitleMinHeight =
    mobileTitleHeights.length === items.length && mobileTitleHeights.every(Boolean)
      ? Math.max(...mobileTitleHeights)
      : undefined;

  const mobileViewportRef = useRef<HTMLDivElement | null>(null);
  const [mobileTrackWidth, setMobileTrackWidth] = useState(0);
  useEffect(() => {
    const el = mobileViewportRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) =>
      setMobileTrackWidth(entry.contentRect.width)
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const mobileX = useMotionValue(0);
  // PASSO de uma parada = largura da tela + o vao (ver ROADMAP_GAP, mais
  // acima) — e o vao entrando na conta e o que garante que ele SOME de
  // repouso a repouso (cada cartao volta a preencher a tela toda) e SO
  // aparece durante a propria transicao.
  const mobileStride = mobileTrackWidth ? mobileTrackWidth + ROADMAP_GAP : 0;
  const mobileMinX = -(items.length - 1) * mobileStride;
  const posForMobile = (idx: number) => -idx * mobileStride;

  const snapMobile = (idx: number) => {
    if (!mobileStride) return;
    animate(mobileX, posForMobile(idx), {
      type: "spring",
      stiffness: 380,
      damping: 42,
    });
  };

  useEffect(() => {
    if (!isMobileCarousel) {
      mobileX.set(0);
      return;
    }
    snapMobile(active);
    // snapMobile e recriado a cada render (le mobileStride); as deps abaixo
    // sao as entradas reais dele.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, isMobileCarousel, mobileStride]);

  // Arrastar pra ESQUERDA avanca, pra DIREITA volta — mesma convencao dos
  // outros carrosseis. Ao contrario de `goTo` (usado pelas setas do
  // desktop), NAO da a volta nas pontas: Math.min/max trava no primeiro e
  // no ultimo item, que e o que faz o elastico bater na ponta em vez de
  // pular de volta pro item 1 no meio de um arrasto — a mesma mecanica de
  // Organization.tsx/Features.tsx.
  const handleMobileDragEnd = (_: unknown, info: PanInfo) => {
    const { offset, velocity } = info;
    let next = active;
    if (offset.x < -ROADMAP_SWIPE_DISTANCE || velocity.x < -ROADMAP_SWIPE_VELOCITY)
      next = Math.min(active + 1, items.length - 1);
    else if (offset.x > ROADMAP_SWIPE_DISTANCE || velocity.x > ROADMAP_SWIPE_VELOCITY)
      next = Math.max(active - 1, 0);

    if (next === active) snapMobile(active);
    else setActive(next);
  };

  return (
    <section
      id="futuro"
      ref={sectionRef}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      // bg-[#0C0C0E]: mesmo ajuste sutil de Organization.tsx — ver comentario
      // la pra detalhes (ink-900 escurecido ~40% do caminho ate ink-950).
      // laptop:* (ver tailwind.config.ts): tela de desktop, mas baixa. O que
      // pesa aqui e o bloco do titulo e a imagem 4/3 da direita — a coluna da
      // esquerda se mede sozinha (contentHeight), entao encolher o titulo do
      // item ja reacomoda o resto sem ajuste manual.
      className="relative overflow-hidden border-t border-white/[0.07] bg-[#0C0C0E] px-6 pb-28 pt-20 sm:pb-36 sm:pt-28 lg:px-10 laptop:pb-24 laptop:pt-16 wide:px-16"
    >
      <SectionBackdrop />

      <div className="relative mx-auto max-w-6xl wide:max-w-shell">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto max-w-2xl text-center"
        >
          <SectionEyebrow>Updates</SectionEyebrow>
          {/* Fonte fluida: titulo curto, entao a formula trava em 48px bem
              antes mesmo do fim do celular — aqui e mais pra ficar
              consistente com as outras secoes do que por necessidade real. */}
          {/* wrapper mx-auto w-fit (nao mais inline-block, ver correcao
              identica em Organization.tsx): encolhe pra largura do texto,
              entao a linha (w-full deste wrapper) casa com a frase do
              titulo em qualquer largura, sem virar inline (o que deixava o
              titulo na mesma linha do rotulo em telas largas). */}
          <div className="mx-auto w-fit">
            <h2 className="mt-5 whitespace-nowrap leading-tight font-display text-[length:clamp(0.9rem,calc(10.22vw_-_5.52px),3rem)] font-semibold tracking-[-0.02em] text-[#FAFAFA] laptop:text-[2.625rem]">
              Próximas atualizações
            </h2>
            <div aria-hidden className="mt-2 h-px w-full bg-gradient-to-r from-transparent via-white/25 to-transparent laptop:mt-1.5" />
          </div>
          <p className="mx-auto mt-3 max-w-[54ch] text-lg font-light leading-relaxed text-white/55 laptop:mt-2">
            O computador é só o começo. As atualizações estão a caminho.
          </p>
          {/* Nada de controle aqui embaixo no desktop (md+): setas e
              tracinhos foram todos pra coluna vertical na esquerda do
              conteudo (ver mais abaixo). No celular (abaixo de md) o
              controle e outro — ver o carrossel de arrastar logo depois
              deste bloco. */}
        </motion.div>

        {/* Versao MOBILE (abaixo de md): o mesmo carrossel de
            arrastar-e-espiar do resto do site, em vez da coluna de setas
            verticais pensada pro mouse. Ordem dentro de cada cartao e a
            pedida: rotulo+titulo no topo, a imagem, a descricao, e por fim
            (fora do cartao, ja que vale pro roadmap inteiro) a barra de
            progresso e o CTA. */}
        <div className="mt-10 md:hidden">
          {/* px-8: o viewport tinha overflow-hidden ENCOSTADO na borda do
              cartao (zero folga), entao a luz externa da imagem (o halo
              branco, ver shadow dela mais abaixo) nunca tinha espaco pra
              se espalhar — era cortada no mesmo instante em que nascia, nos
              dois lados (pedido do usuario foi tirar esse corte). Era px-4
              (16px) antes, mas o halo (blur 56px, spread -14px) se estende
              uns ~14-20px pra fora da borda — perto demais dos 16px, sobrava
              so uma margem de 0-2px e a parte mais forte do brilho (perto da
              borda) ainda saia cortada nos dois lados (o usuario via isso
              como "algo invisivel" comendo a luz — reportado de novo depois
              do primeiro ajuste). Com padding aqui, o `overflow-hidden`
              passa a recortar 32px ALEM da borda do cartao (o `contentRect`
              que mede a largura pro calculo do arrasto ja desconta esse
              padding sozinho, entao o carrossel continua parando no lugar
              certo sem nenhuma conta manual). */}
          <div ref={mobileViewportRef} className="overflow-hidden px-8">
            <motion.div
              drag={isMobileCarousel ? "x" : false}
              dragConstraints={{ left: mobileMinX, right: 0 }}
              dragElastic={0.15}
              dragMomentum={false}
              onDragStart={() => setManual(true)}
              onDragEnd={handleMobileDragEnd}
              style={{ x: mobileX }}
              className="flex cursor-grab items-start gap-8 will-change-transform active:cursor-grabbing"
            >
              {items.map((item, index) => (
                // w-full: cada cartao e uma tela inteira, sem espiada do
                // vizinho (ver o comentario grande em ROADMAP_SWIPE_*, mais
                // acima) — a imagem usa a largura toda em vez de ceder uma
                // fatia pro proximo cartao aparecer. O gap-4 do pai so fica
                // visivel arrastando (ver ROADMAP_GAP).
                <div key={item.title} className="w-full shrink-0">
                  {/* wrapper w-fit + mx-auto: encolhe pra largura do proprio
                      rotulo, entao a linha abaixo (w-full DESTE wrapper) casa
                      com o texto "Update N.0" em vez da largura do cartao —
                      mesma ideia das linhas sob os titulos de secao. */}
                  <div className="mx-auto w-fit">
                    <p className="text-center font-display text-xs font-semibold uppercase tracking-[0.2em] text-white/35">
                      Update {index + 1}.0
                    </p>
                    <div aria-hidden className="mt-1.5 h-px w-full bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                  </div>
                  {/* mx-auto: o max-w-[16ch] restringe a CAIXA do h3 (pra
                      titulo longo quebrar em 2 linhas curtas em vez de 1
                      linha esticada) — sem centralizar essa caixa tambem,
                      text-center so centralizaria as linhas DENTRO dela,
                      que ainda ficaria colada a esquerda do cartao. */}
                  <h3
                    ref={(el) => {
                      mobileTitleRefs.current[index] = el;
                    }}
                    className="mx-auto mt-2 flex max-w-[16ch] items-center justify-center text-balance text-center font-display text-3xl font-semibold tracking-[-0.02em] text-[#FAFAFA]"
                    style={
                      mobileTitleMinHeight ? { minHeight: mobileTitleMinHeight } : undefined
                    }
                  >
                    {item.title}
                  </h3>
                  {/* shadow com duas camadas, mesma dupla do desktop
                      (pedido do usuario): halo branco parado por fora da
                      moldura + a sombra de profundidade que ja existia. */}
                  <div className="relative mt-3 aspect-[4/3] overflow-hidden rounded-card border border-white/[0.1] shadow-[0_0_56px_-14px_rgba(255,255,255,0.35),0_30px_80px_-20px_rgba(0,0,0,0.7)]">
                    <Image
                      src={item.image}
                      alt=""
                      aria-hidden
                      fill
                      unoptimized
                      sizes="90vw"
                      loading={index === 0 ? "eager" : "lazy"}
                      draggable={false}
                      className="object-cover"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950/60 via-transparent to-transparent" />
                  </div>
                  <div aria-hidden className="mt-3 h-px w-full bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                  {/* text-sm (nao mais text-base) e SEM o teto de 38ch do
                      desktop (aqui so estreitava a linha a toa, num cartao
                      que ja e a largura da tela): a descricao ocupa menos
                      altura tanto pela fonte menor quanto por caber mais
                      caracteres por linha, sobrando mais espaco pra imagem
                      acima ler como o elemento principal do cartao. */}
                  <p className="mt-4 text-center text-sm leading-relaxed text-white/55">
                    {item.bodyMobile ?? item.bodyCompact ?? item.body}
                  </p>
                  <p className="mt-3 text-center text-sm italic leading-relaxed text-white/65">
                    “{item.quote}”
                  </p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* CTA uma vez so (nao por cartao): o convite vale pro roadmap
              inteiro, nao so pro item em cena no momento. Vem ANTES da barra
              de progresso agora (a pedido do usuario — antes a ordem era
              barra-depois-botao) — mt-8 e o mesmo respiro que a barra tinha
              em relacao ao carrossel logo acima. */}
          <div className="mt-8 flex justify-center">
            <a
              href="#precos"
              className="group inline-flex items-center gap-2.5 rounded-full bg-[#FAFAFA] px-9 py-4 text-base font-semibold text-ink-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_10px_30px_-12px_rgba(255,255,255,0.35)] transition-colors duration-200 hover:bg-white active:scale-[0.98]"
            >
              Quero ser notificado!
              <ArrowRight
                size={17}
                weight="bold"
                aria-hidden
                className="transition-transform duration-300 group-hover:translate-x-0.5"
              />
            </a>
          </div>

          {/* Pontinhos — 3a versao, mesma peca de Organization.tsx (ver o
              comentario grande la, com a explicacao do `layoutId`). Sem
              cartao envolvendo; a ativa vira uma pilulazinha que desliza ate
              a posicao nova. mt-6: o mesmo respiro que o botao tinha em
              relacao a barra que morava aqui, so que invertido. layoutId
              proprio desta secao (tem que ser unico na pagina inteira). */}
          <div
            className="mx-auto mt-6 flex w-fit items-center gap-2"
            role="tablist"
            aria-label="Próximas atualizações"
          >
            {items.map((item, index) => (
              <button
                key={item.title}
                type="button"
                role="tab"
                aria-selected={index === active}
                aria-label={`Ir para "${item.title}"`}
                onClick={() => {
                  setManual(true);
                  setActive(index);
                }}
                className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center"
              >
                {index === active ? (
                  <motion.span
                    layoutId="roadmap-carousel-dot"
                    transition={{ type: "spring", stiffness: 500, damping: 34 }}
                    aria-hidden
                    className="h-1.5 w-5 rounded-full bg-white"
                  />
                ) : (
                  <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-white/25" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Versao DESKTOP (md+). items-start (nao items-center): a coluna
            esquerda sobe pro topo da linha, alinhando o rotulo "Update N.0"
            com o topo da imagem ao lado, em vez de ficar centralizada no
            meio da altura dela. */}
        <div className="relative mx-auto mt-14 hidden grid-cols-1 items-start gap-10 md:grid md:grid-cols-[1fr_1.2fr] md:gap-8 laptop:mt-12">
          {/* Coluna esquerda: controle vertical do carrossel + rotulo
              "Update N.0" + titulo/descricao do item ativo + CTA.
              height explicita = buttonTop + buttonHeight: o unico filho em
              fluxo normal aqui e a linha do texto (rail, controle e botao
              sao todos absolute) — sem essa altura explicita o wrapper
              encolheria pro tamanho do texto sozinho, e a trilha vertical
              (bottom-0, mais abaixo) pararia ANTES do botao em vez de
              alcancar ele. */}
          <div
            className="relative flex flex-col"
            style={
              buttonTop && buttonHeight
                ? { height: buttonTop + buttonHeight }
                : undefined
            }
          >
            {/* Trilha vertical: do topo do titulo (pula o rotulo "Update N.0"
                acima dele, top-7) ate o fim do botao "Quero ser notificado!"
                (bottom-0 deste wrapper, que e o ultimo elemento). Fica no VAO
                entre o controle e o texto (left-[46px]: depois dos 36px do
                controle, antes dos 76px onde o texto comeca) — nao mais em
                cima do controle, que ficava com os tracinhos por dentro da
                linha. O controle continua centralizado na altura INTEIRA do
                wrapper (topo do titulo ao fundo do botao), so que agora
                claramente a ESQUERDA da trilha, sem sobrepor. */}
            <div
              aria-hidden
              className="pointer-events-none absolute left-[46px] top-7 bottom-0 w-px bg-white/[0.1]"
            />
            <div className="absolute -left-4 top-1/2 -translate-y-1/2">
              <CarouselControl active={active} paused={paused} onSelect={goTo} />
            </div>

            {/* O respiro ate o texto (spacer w-9/36px + gap-10/40px = 76px,
                ver `left-[76px]` no botao mais abaixo) e o que antes era
                ocupado pelo controle, que virou absoluto (ver acima) — gap
                crescente (era gap-5, depois gap-8, agora gap-10) da mais
                distancia da trilha "|" a esquerda, que continua parada em
                left-[46px]. Este `w-9` vazio so reserva o espaco horizontal
                do controle, pra o texto nao se mexer quando ele vira
                absoluto. */}
            <div className="flex gap-10">
              <div className="w-9 shrink-0" aria-hidden />
              {/* min-h-[14rem]: chute inicial (tamanho do item 1, o ativo no
                  primeiro paint) so pra nao colapsar antes do JS medir. Assim
                  que monta, `style.height` assume a altura REAL do item
                  ativo — quem posiciona o botao agora e `buttonTop` (ver
                  acima), direto, nao mais esta caixa "inflada". */}
              <div
                className="relative min-h-[14rem] flex-1 transition-[height] duration-500 ease-in-out"
                style={contentHeight ? { height: contentHeight } : undefined}
              >
                {items.map((item, index) => (
                  <div
                    key={item.title}
                    ref={(el) => {
                      itemRefs.current[index] = el;
                    }}
                    aria-hidden={index !== active}
                    // flex flex-col + height fixa (so no notebook): da pra
                    // caixa a MESMA altura sempre (ate logo acima do botao),
                    // e o `mt-auto` da citacao (mais abaixo) empurra ela pro
                    // fundo dessa caixa — ou seja, a citacao fica sempre na
                    // mesma linha, colada acima do botao "Quero ser
                    // notificado!", nao importa o tamanho do body do item.
                    // No mobile/tablet, style fica undefined (altura
                    // continua automatica) e o layout nao muda.
                    className={`absolute inset-x-0 top-0 flex flex-col transition-all duration-700 ease-in-out ${
                      index === active
                        ? "translate-y-0 opacity-100"
                        : "pointer-events-none translate-y-6 opacity-0"
                    }`}
                    style={
                      isLaptop && buttonTop
                        ? { height: Math.max(buttonTop - QUOTE_GAP, 0) }
                        : undefined
                    }
                  >
                    {/* Rotulo "Update N.0": no lugar onde a paginacao ficava
                        antes de subir pra baixo do titulo da secao.
                        w-fit (nao mx-auto: aqui o bloco e alinhado a
                        esquerda, nao centralizado): encolhe a largura do
                        wrapper pro texto do rotulo, entao a linha abaixo
                        (w-full DESTE wrapper) casa com "Update N.0" em vez de
                        esticar pela coluna toda — mesma ideia da versao
                        mobile e das linhas sob os titulos de secao. */}
                    <div className="w-fit">
                      <p className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-white/35">
                        Update {index + 1}.0
                      </p>
                      <div aria-hidden className="mt-1.5 h-px w-full bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                    </div>
                    <h3 className="mt-2 max-w-[16ch] text-balance font-display text-4xl font-semibold tracking-[-0.02em] text-[#FAFAFA] sm:text-5xl laptop:text-4xl">
                      {item.title}
                    </h3>
                    <p className="mt-5 max-w-[38ch] text-base leading-relaxed text-white/55 laptop:mt-4">
                      {isLaptop && item.bodyCompact ? item.bodyCompact : item.body}
                    </p>
                    <p
                      className={
                        isLaptop
                          ? "mt-auto max-w-[38ch] text-sm italic leading-relaxed text-white/65"
                          : "mt-12 max-w-[38ch] text-sm italic leading-relaxed text-white/65 laptop:mt-10"
                      }
                    >
                      “{item.quote}”
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* absolute + left-[76px] (spacer w-9 + gap-10): mesmo calculo
                horizontal que alinha o texto, so que agora vertical tambem e
                explicito via `top: buttonTop` — nao mais inferido por
                margin-top empilhado em cima de uma altura "inflada". */}
            <div
              ref={buttonRef}
              className="absolute left-[76px] transition-[top] duration-500 ease-in-out"
              style={{ top: buttonTop || undefined }}
            >
              <a
                href="#precos"
                className="group inline-flex items-center gap-2.5 rounded-full bg-[#FAFAFA] px-9 py-4 text-base font-semibold text-ink-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_10px_30px_-12px_rgba(255,255,255,0.35)] transition-colors duration-200 hover:bg-white active:scale-[0.98]"
              >
                Quero ser notificado!
                <ArrowRight
                  size={17}
                  weight="bold"
                  aria-hidden
                  className="transition-transform duration-300 group-hover:translate-x-0.5"
                />
              </a>
            </div>
          </div>

          {/* Coluna direita: pilha de imagens ilustrativas, uma por item —
              conceito, nao print real do produto (nenhuma dessas
              capacidades existe ainda). Escondida no mobile, igual ao
              layout de referencia. */}
          <div className="relative hidden items-center justify-center md:flex">
            {/* w-full + aspect-ratio (altura DERIVADA da largura), nao
                h-full/h-% + aspect-ratio: testado na pratica, essa segunda
                combinacao NAO respeitava a proporcao dentro de um item flex
                (a largura era espremida pelo flex-shrink sem recalcular a
                altura, virando uma caixa fora de 4:3). */}
            {/* laptop:aspect-[16/11]: a altura sai da largura da coluna, entao
                achatar a proporcao e o que baixa a imagem sem estreitar a
                grade. As tres fotos sao paisagem, entao cortar um pouco da
                altura nao come nada do assunto delas. */}
            {/* wrapper w-full: precisa dele porque agora ha DOIS filhos em
                fluxo normal (a imagem e a linha abaixo dela) dentro de um pai
                flex (items-center/justify-center) — sem essa caixa, os dois
                ficariam lado a lado na linha em vez de imagem-em-cima,
                linha-embaixo. */}
            <div className="w-full">
              {/* shadow com DUAS camadas agora — a mesma dupla de
                  Showcase.tsx ("Uma dashboard viva"), pedido do usuario: um
                  halo branco parado por fora da moldura (a primeira,
                  0_0_56px) + a sombra de profundidade que ja existia aqui
                  (a segunda). So no desktop (este bloco inteiro e
                  `hidden md:flex`, nunca aparece no celular). */}
              <div
                ref={imageRef}
                className="relative aspect-[4/3] w-full overflow-hidden rounded-card border border-white/[0.1] shadow-[0_0_56px_-14px_rgba(255,255,255,0.35),0_30px_80px_-20px_rgba(0,0,0,0.7)] laptop:aspect-[16/11]"
              >
                <div
                  className="absolute inset-0 transition-transform duration-700 ease-in-out"
                  style={{ transform: `translateY(-${active * 100}%)` }}
                >
                  {items.map((item, index) => (
                    <div key={item.title} className="relative h-full w-full">
                      {/* next/image + `unoptimized`: mesmo padrao de
                          Showcase.tsx — os arquivos ja SAO .webp comprimidos
                          (as fontes .png tinham 1,4-1,7MB CADA; virar webp
                          derrubou os tres juntos de 4,45MB pra 270KB), entao
                          passar de novo pelo otimizador do Next so recomprimiria
                          algo ja comprimido. O que se ganha aqui em relacao ao
                          <img> cru e `sizes`, que evita o navegador baixar mais
                          pixel do que a coluna realmente mostra.

                          loading: so o primeiro item e "eager". Os outros dois
                          so aparecem depois que o carrossel gira, entao adiar
                          eles tira ~180KB do caminho critico de quem so passa
                          rolando pela secao. */}
                      <Image
                        src={item.image}
                        alt=""
                        aria-hidden
                        fill
                        unoptimized
                        sizes="(min-width: 1800px) 750px, (min-width: 768px) 45vw, 0px"
                        loading={index === 0 ? "eager" : "lazy"}
                        draggable={false}
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950/60 via-transparent to-transparent" />
              </div>
              <div aria-hidden className="mt-4 h-px w-full bg-gradient-to-r from-transparent via-white/25 to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
