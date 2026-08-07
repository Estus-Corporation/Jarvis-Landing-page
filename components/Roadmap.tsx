"use client";

import React, { useLayoutEffect, useRef, useState } from "react";
import { useScroll, useMotionValueEvent } from "motion/react";
import { useReducedMotionSafe } from "@/components/ui/use-reduced-motion-safe";
import {
  DeviceMobile,
  House,
  Car,
  ArrowRight,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";

// Secao redesenhada como "scrollytelling": um painel fixo (sticky) na tela,
// e o item ativo avanca conforme a pessoa rola por uma faixa alta (3 telas
// de altura, uma por item) — em vez da antiga grade de 3 cartoes estaticos.
// O fundo (grade tecnica + halo) e o MESMO da versao anterior da secao, de
// proposito: so a forma de apresentar os itens mudou, nao a identidade
// visual da secao.
//
// Existe por duas razoes de venda, nao so de informar —
//  1) mostra que o Jarvis e uma plataforma em expansao, nao um produto
//     parado, o que baixa o medo de "compro e amanha param de atualizar".
//  2) fecha a pagina com a mesma ideia de "comece agora": quem assina hoje
//     ja fica dentro de tudo isso quando sair, sem pagar de novo por isso.
type RoadmapItem = {
  icon: Icon;
  step: string;
  title: string;
  body: string;
  quote: string;
  image: string;
};

const items: RoadmapItem[] = [
  {
    icon: DeviceMobile,
    step: "01",
    title: "Jarvis no seu bolso",
    body: "Um app pra continuar comandando o Jarvis do celular, mesmo longe do computador.",
    quote: "Jarvis, quanto falta pro meu build terminar?",
    image:
      "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=1600&auto=format&fit=crop",
  },
  {
    icon: House,
    step: "02",
    title: "Sua casa, por voz",
    body: "Lâmpada, ar-condicionado, tomada inteligente: o mesmo Jarvis que cuida do seu PC passa a cuidar da sua casa.",
    quote: "Jarvis, apaga as luzes e liga o ar-condicionado.",
    image:
      "https://images.unsplash.com/photo-1558002038-1055907df827?q=80&w=1600&auto=format&fit=crop",
  },
  {
    icon: Car,
    step: "03",
    title: "Jarvis no painel do seu carro",
    body: "Integrado à multimídia do carro. Rota, mensagem, playlist — peça sem tirar as mãos do volante.",
    quote: "Jarvis, rota para casa. E quem me mandou mensagem no WhatsApp?",
    image:
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1600&auto=format&fit=crop",
  },
];

// Fundo IDENTICO ao de Integracoes.tsx ("Tudo gira em torno do Jarvis."), a
// pedido: mesma grade, mesma mascara, mesma linha de brilho no topo — sem o
// halo desfocado que existia aqui antes. Fica FIXO dentro do painel sticky,
// entao continua visivel e identico enquanto os 3 itens se revezam.
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

function Pagination({
  active,
  onSelect,
}: {
  active: number;
  onSelect: (index: number) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      {items.map((item, index) => (
        <button
          key={item.title}
          type="button"
          onClick={() => onSelect(index)}
          className={`h-1 rounded-full transition-all duration-500 ease-in-out ${
            index === active ? "w-10 bg-white/80" : "w-5 bg-white/20 hover:bg-white/35"
          }`}
          aria-label={`Ir para "${item.title}"`}
          aria-current={index === active}
        />
      ))}
    </div>
  );
}

export default function Roadmap() {
  const reduce = useReducedMotionSafe();
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  // Reservar um espaco fixo do tamanho do item MAIS ALTO (pra nenhum
  // estourar por cima do botao) deixava um vao enorme nos itens mais curtos.
  // Em vez disso, medimos a altura real do item ativo e o container se
  // ajusta pra ela (com transicao), entao o botao fica sempre colado no
  // conteudo, seja qual for o item — sem vao, sem sobreposicao.
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [contentHeight, setContentHeight] = useState(0);

  useLayoutEffect(() => {
    const measure = () => {
      const el = itemRefs.current[active];
      if (el) setContentHeight(el.offsetHeight);
    };
    measure();
    // Reflow: o texto quebra diferente em outra largura, entao a altura
    // medida fica desatualizada se a janela for redimensionada.
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [active]);

  // Progresso 0→1 conforme a faixa alta (items.length telas) atravessa a
  // viewport. Cada item ocupa uma fatia igual dessa faixa.
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    const index = Math.min(items.length - 1, Math.floor(value * items.length));
    setActive((prev) => (prev === index ? prev : index));
  });

  const goTo = (index: number) => {
    const el = trackRef.current;
    if (!el) return;
    // getBoundingClientRect + scrollY, nao offsetTop: offsetTop e relativo ao
    // offsetParent posicionado mais proximo (aqui, a propria <section>, que e
    // relative), nao ao topo do documento — daria um alvo de scroll errado.
    const top =
      el.getBoundingClientRect().top +
      window.scrollY +
      (index / items.length) * el.offsetHeight;
    window.scrollTo({ top, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <section
      id="futuro"
      className="relative border-t border-white/[0.07] bg-ink-900"
    >
      {/* Sem bloco de titulo/intro aqui de proposito: um bloco de texto
          entre a secao anterior e o painel sticky (com a grade) criava uma
          "regiao" visual a mais no meio, separando as duas em vez de deixar
          uma fluir direto na outra. A secao vai direto pro painel. */}
      {/* Faixa alta: uma tela cheia (100dvh) por item. E o "combustivel" de
          scroll que faz o painel sticky abaixo trocar de item. */}
      <div
        ref={trackRef}
        style={{ height: `${items.length * 100}dvh` }}
        className="relative"
      >
        <div className="sticky top-0 flex h-[100dvh] w-full flex-col justify-center overflow-hidden">
          <SectionBackdrop />

          {/* Titulo/descricao do painel: centralizados, acima da grade de
              duas colunas — ficam AQUI dentro do painel (nao antes dele) de
              proposito, um bloco separado antes do painel criava uma
              "regiao" a mais, cortando o fluxo entre a secao anterior e
              este painel. */}
          <div className="relative mx-auto max-w-2xl px-6 text-center lg:px-10">
            <h2 className="text-balance font-display text-3xl font-semibold tracking-[-0.02em] text-[#FAFAFA] sm:text-5xl">
              Próximas atualizações
            </h2>
            <p className="mx-auto mt-5 max-w-[54ch] text-lg font-light leading-relaxed text-white/55">
              O computador é só o começo. Confira o que está por vir! Quem
              assinar recebe cada uma dessas atualizações sem nenhuma
              cobrança adicional.
            </p>
            <div className="mt-8 flex justify-center">
              <Pagination active={active} onSelect={goTo} />
            </div>
          </div>

          <div className="relative mx-auto mt-10 grid w-full max-w-6xl grid-cols-1 items-stretch md:grid-cols-2 wide:max-w-shell">
            {/* Coluna esquerda: titulo/descricao do item ativo (no lugar que
                era do titulo da secao), paginacao e CTA. Sem border-r: a
                linha dividindo o painel ao meio saiu, a pedido — a coluna da
                imagem agora flutua livre ao lado. */}
            <div className="relative flex flex-col justify-center px-6 py-10 lg:px-10 wide:px-16">
              {/* min-h-[14rem]: chute inicial (tamanho do item 1, o ativo no
                  primeiro paint) so pra nao colapsar antes do JS medir. Assim
                  que monta, `style.height` assume a altura REAL do item
                  ativo — e quem faz o botao ficar sempre colado no
                  conteudo. */}
              <div
                className="relative min-h-[14rem] transition-[height] duration-500 ease-in-out"
                style={contentHeight ? { height: contentHeight } : undefined}
              >
                {items.map((item, index) => (
                  <div
                    key={item.title}
                    ref={(el) => {
                      itemRefs.current[index] = el;
                    }}
                    aria-hidden={index !== active}
                    className={`absolute inset-x-0 top-0 border-l border-white/25 pl-5 transition-all duration-700 ease-in-out ${
                      index === active
                        ? "translate-y-0 opacity-100"
                        : "pointer-events-none translate-y-6 opacity-0"
                    }`}
                  >
                    <h3 className="max-w-[16ch] text-balance font-display text-4xl font-semibold tracking-[-0.02em] text-[#FAFAFA] sm:text-5xl">
                      {item.title}
                    </h3>
                    <p className="mt-5 max-w-[38ch] text-base leading-relaxed text-white/55">
                      {item.body}
                    </p>
                    {/* Citacao mais pra baixo (mt-12 em vez de mt-5), a
                        pedido — separada do corpo em vez de emendada nele. */}
                    <p className="mt-12 max-w-[38ch] text-sm italic leading-relaxed text-white/65">
                      “{item.quote}”
                    </p>
                  </div>
                ))}
              </div>

              {/* Botao mais pra baixo, a pedido (mt-16 em vez de mt-10). */}
              <div className="mt-16">
                <a
                  href="#precos"
                  className="group inline-flex items-center gap-2 rounded-full bg-[#FAFAFA] px-7 py-3.5 text-sm font-semibold text-ink-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_10px_30px_-12px_rgba(255,255,255,0.35)] transition-colors duration-200 hover:bg-white active:scale-[0.98]"
                >
                  Entrar agora
                  <ArrowRight
                    size={15}
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
            <div className="relative hidden items-center justify-center p-6 md:flex lg:p-10">
              {/* aspect-[4/3] (mais largo que alto) em vez do 3/4 anterior —
                  as 3 imagens usam o MESMO container/classes, entao ja saem
                  do mesmo tamanho por construcao; object-cover em cada uma
                  cuida do enquadramento independente da orientacao original
                  da foto. */}
              <div className="relative aspect-[4/3] h-[85%] max-h-[560px] overflow-hidden rounded-card border border-white/[0.1] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)]">
                <div
                  className="absolute inset-0 transition-transform duration-700 ease-in-out"
                  style={{ transform: `translateY(-${active * 100}%)` }}
                >
                  {items.map((item) => (
                    <div key={item.title} className="h-full w-full">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.image}
                        alt=""
                        aria-hidden
                        className="h-full w-full object-cover"
                        onError={(event) => {
                          const target = event.currentTarget;
                          target.onerror = null;
                          target.src =
                            "https://placehold.co/800x1200/141417/FAFAFA?text=Jarvis";
                        }}
                      />
                    </div>
                  ))}
                </div>
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950/60 via-transparent to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
