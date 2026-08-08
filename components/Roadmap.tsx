"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useReducedMotionSafe } from "@/components/ui/use-reduced-motion-safe";
import {
  DeviceMobile,
  House,
  Car,
  ArrowRight,
  CaretLeft,
  CaretRight,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";

// Secao "Proximas atualizacoes". Antes era scrollytelling: uma faixa alta (3
// telas) com painel sticky, e o item ativo trocava conforme a pessoa ROLAVA.
// A pedido, virou um carrossel de ALTURA NORMAL que troca sozinho (auto-play)
// ou pelas setas / pontinhos — o visitante ve os 3 itens sem precisar rolar
// tres telas, melhorando a navegacao. Fundo e layout continuam iguais; so o
// mecanismo de troca mudou.
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

const AUTOPLAY_MS = 5000;

// Fundo IDENTICO ao de Integracoes.tsx: mesma grade, mesma mascara, mesma
// linha de brilho no topo.
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

function ArrowButton({
  dir,
  onClick,
}: {
  dir: "prev" | "next";
  onClick: () => void;
}) {
  const Glyph = dir === "prev" ? CaretLeft : CaretRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={dir === "prev" ? "Atualização anterior" : "Próxima atualização"}
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/[0.12] text-white/60 transition-colors duration-200 hover:border-white/30 hover:bg-white/[0.06] hover:text-white"
    >
      <Glyph size={16} weight="bold" aria-hidden />
    </button>
  );
}

export default function Roadmap() {
  const reduce = useReducedMotionSafe();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const goTo = (index: number) =>
    setActive(((index % items.length) + items.length) % items.length);
  const next = () => goTo(active + 1);
  const prev = () => goTo(active - 1);

  // Troca sozinho de item. Para no hover/foco e em reduced-motion.
  useEffect(() => {
    if (reduce || paused) return;
    const id = setInterval(
      () => setActive((a) => (a + 1) % items.length),
      AUTOPLAY_MS
    );
    return () => clearInterval(id);
  }, [reduce, paused]);

  // Altura do item ativo: a coluna esquerda se ajusta a ela (os itens ficam
  // sobrepostos em absolute, so o ativo visivel), pra o botao ficar sempre
  // colado no conteudo sem vao nem sobreposicao.
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [contentHeight, setContentHeight] = useState(0);
  useLayoutEffect(() => {
    const measure = () => {
      const el = itemRefs.current[active];
      if (el) setContentHeight(el.offsetHeight);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [active]);

  return (
    <section
      id="futuro"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      className="relative overflow-hidden border-t border-white/[0.07] bg-ink-900 px-6 py-28 sm:py-36 lg:px-10 wide:px-16"
    >
      <SectionBackdrop />

      <div className="relative mx-auto max-w-2xl text-center">
        <h2 className="text-balance font-display text-3xl font-semibold tracking-[-0.02em] text-[#FAFAFA] sm:text-5xl">
          Próximas atualizações
        </h2>
        <p className="mx-auto mt-5 max-w-[54ch] text-lg font-light leading-relaxed text-white/55">
          O computador é só o começo. Confira o que está por vir! Quem assinar
          recebe cada uma dessas atualizações sem nenhuma cobrança adicional.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <ArrowButton dir="prev" onClick={prev} />
          <Pagination active={active} onSelect={goTo} />
          <ArrowButton dir="next" onClick={next} />
        </div>
      </div>

      <div className="relative mx-auto mt-12 grid w-full max-w-6xl grid-cols-1 items-stretch md:grid-cols-2 wide:max-w-shell">
        {/* Coluna esquerda: item ativo (eyebrow com passo + ícone, título,
            corpo, citação) e CTA. */}
        <div className="relative flex flex-col justify-center px-6 py-10 lg:px-10 wide:px-16">
          <div
            className="relative min-h-[16rem] transition-[height] duration-500 ease-in-out"
            style={contentHeight ? { height: contentHeight } : undefined}
          >
            {items.map((item, index) => {
              const Glyph = item.icon;
              return (
                <div
                  key={item.title}
                  ref={(el) => {
                    itemRefs.current[index] = el;
                  }}
                  aria-hidden={index !== active}
                  className={`absolute inset-x-0 top-0 transition-all duration-700 ease-in-out ${
                    index === active
                      ? "translate-y-0 opacity-100"
                      : "pointer-events-none translate-y-6 opacity-0"
                  }`}
                >
                  <div className="mb-6 flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-chip border border-white/[0.12] bg-white/[0.04] text-white/70">
                      <Glyph size={20} weight="light" aria-hidden />
                    </span>
                    <span className="font-display text-sm font-semibold uppercase tracking-[0.18em] text-white/40">
                      Atualização {item.step}
                    </span>
                  </div>
                  <h3 className="max-w-[16ch] text-balance font-display text-4xl font-semibold tracking-[-0.02em] text-[#FAFAFA] sm:text-5xl">
                    {item.title}
                  </h3>
                  <p className="mt-5 max-w-[38ch] text-base leading-relaxed text-white/55">
                    {item.body}
                  </p>
                  <p className="mt-10 max-w-[38ch] border-l border-white/25 pl-5 text-sm italic leading-relaxed text-white/65">
                    “{item.quote}”
                  </p>
                </div>
              );
            })}
          </div>

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

        {/* Coluna direita: pilha de imagens conceito, uma por item. */}
        <div className="relative hidden items-center justify-center p-6 md:flex lg:p-10">
          <div className="relative aspect-[4/3] h-[85%] max-h-[560px] w-full overflow-hidden rounded-card border border-white/[0.1] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)]">
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
    </section>
  );
}
