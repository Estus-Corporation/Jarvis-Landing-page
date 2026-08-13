"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";
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
  quote: string;
  image: string;
};

const items: RoadmapItem[] = [
  {
    icon: DeviceMobile,
    step: "01",
    title: "Jarvis no seu bolso",
    body: "Um app pra continuar comandando o Jarvis do celular, mesmo longe do computador. Pergunte algo, peça uma tarefa ou só acompanhe o que ele está fazendo — tudo pelo mesmo Jarvis, agora no seu bolso. Notificações chegam na hora certa, e o histórico da conversa segue com você entre o computador e o celular, sem perder o fio.",
    quote: "Jarvis, quanto falta pro meu build terminar?",
    image: "/images/mobile.webp",
  },
  {
    icon: House,
    step: "02",
    title: "Sua casa, por voz",
    body: "Lâmpada, ar-condicionado, tomada inteligente: o mesmo Jarvis que cuida do seu PC passa a cuidar da sua casa. Chegou e já quer tudo do jeito certo? Basta pedir, e ele ajusta a casa inteira antes de você tirar o casaco. Crie rotinas pra manhã, pra noite ou pra quando sair — um comando só, e cada cômodo responde do jeito que você combinou.",
    bodyCompact:
      "Lâmpada, ar-condicionado, tomada inteligente: o mesmo Jarvis que cuida do seu PC passa a cuidar da sua casa. Peça, e ele ajusta tudo antes de você tirar o casaco. Crie rotinas pra manhã, pra noite ou pra saída — um comando só, e cada cômodo responde do jeito certo.",
    quote: "Jarvis, apaga as luzes e liga o ar-condicionado.",
    image: "/images/iot.webp",
  },
  {
    icon: Car,
    step: "03",
    title: "Jarvis no painel do seu carro",
    body: "Integrado à multimídia do carro. Rota, mensagem, playlist — peça sem tirar as mãos do volante. No trânsito ou na estrada, é só falar: ele entende o pedido e cuida do resto enquanto você guia. Ele também avisa sobre trânsito na rota, sugere um caminho melhor e lê as mensagens em voz alta, sem você precisar olhar pra tela.",
    bodyCompact:
      "Integrado à multimídia do carro. Rota, mensagem, playlist — peça sem tirar as mãos do volante. Ele avisa sobre trânsito na rota, sugere um caminho melhor e lê as mensagens em voz alta, sem você precisar olhar pra tela.",
    quote: "Jarvis, traçar trajeto para casa.",
    image: "/images/car.webp",
  },
];

const AUTOPLAY_MS = 6000;

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
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      <div className="absolute inset-x-0 top-0 h-px overflow-hidden">
        <div className="beam-sweep h-full w-32 bg-gradient-to-r from-transparent via-white/80 to-transparent" />
      </div>
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
    if (reduce || paused) return;
    const id = setInterval(() => {
      setActive((prev) => (prev + 1) % items.length);
    }, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [active, reduce, paused]);

  const goTo = (index: number) => {
    setActive(((index % items.length) + items.length) % items.length);
  };

  return (
    <section
      id="futuro"
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
          <h2 className="mt-5 whitespace-nowrap leading-tight font-display text-[length:clamp(0.9rem,calc(10.22vw_-_5.52px),3rem)] font-semibold tracking-[-0.02em] text-[#FAFAFA] laptop:text-[2.625rem]">
            Próximas atualizações
          </h2>
          <p className="mx-auto mt-5 max-w-[54ch] text-lg font-light leading-relaxed text-white/55 laptop:mt-4">
            O computador é só o começo. Confira o que está por vir! Quem
            assinar recebe cada uma dessas atualizações sem nenhuma cobrança
            adicional.
          </p>
          {/* Nada de controle aqui embaixo: setas e tracinhos foram todos
              pra coluna vertical na esquerda do conteudo (ver mais abaixo). */}
        </motion.div>

        {/* items-start (nao items-center): a coluna esquerda sobe pro topo
            da linha, alinhando o rotulo "Update N.0" com o topo da imagem
            ao lado, em vez de ficar centralizada no meio da altura dela. */}
        <div className="relative mx-auto mt-14 grid grid-cols-1 items-start gap-10 md:grid-cols-[1fr_1.2fr] md:gap-8 laptop:mt-12">
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
                        antes de subir pra baixo do titulo da secao. */}
                    <p className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-white/35">
                      Update {index + 1}.0
                    </p>
                    <h3 className="mt-3 max-w-[16ch] text-balance font-display text-4xl font-semibold tracking-[-0.02em] text-[#FAFAFA] sm:text-5xl laptop:text-4xl">
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
            <div
              ref={imageRef}
              className="relative aspect-[4/3] w-full overflow-hidden rounded-card border border-white/[0.1] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)] laptop:aspect-[16/11]"
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
          </div>
        </div>
      </div>
    </section>
  );
}
