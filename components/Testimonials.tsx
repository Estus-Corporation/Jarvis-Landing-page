"use client";

// PLACEHOLDER: nenhum depoimento aqui e real. O produto ainda nao lancou, e
// inventar nomes/falas de "clientes" seria prova social falsa. Cada card e um
// ESPACO RESERVADO explicito (fala entre colchetes, nome "Seu nome aqui"),
// pronto pra receber depoimentos reais (com nome + selo de verificado) no
// lancamento. A esteira em si ja funciona; so o conteudo e provisorio.
//
// Layout: MURAL DE DEPOIMENTOS em esteira infinita. Duas fileiras de cards
// correndo em sentidos opostos, sem fim, com bordas mascaradas e pausa no
// hover — o efeito de "muita gente falando" que se pediu. Vocabulario de
// luz/LED das outras secoes.
import React from "react";
import { motion } from "motion/react";
import { useReducedMotionSafe } from "@/components/ui/use-reduced-motion-safe";
import {
  Quotes,
  User,
  ShieldCheck,
  HardDrives,
  ArrowsClockwise,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";
import SectionEyebrow from "@/components/ui/section-eyebrow";

type Testimonial = { quote: string; name: string; role: string };

// Temas variados nos placeholders pra a esteira nao repetir a mesma frase.
// Nomes ficam como espaco reservado honesto — nada de pessoa inventada.
const testimonials: Testimonial[] = [
  { quote: "[Depoimento sobre a primeira impressão ao instalar o Jarvis.]", name: "Seu nome aqui", role: "Cliente Jarvis" },
  { quote: "[Depoimento sobre quanto tempo o Jarvis economiza no dia a dia.]", name: "Seu nome aqui", role: "Cliente Jarvis" },
  { quote: "[Depoimento sobre a experiência de ouvir a própria voz clonada.]", name: "Seu nome aqui", role: "Cliente Jarvis" },
  { quote: "[Depoimento sobre controlar o PC inteiro só falando.]", name: "Seu nome aqui", role: "Cliente Jarvis" },
  { quote: "[Depoimento sobre o suporte e a confiança no produto.]", name: "Seu nome aqui", role: "Cliente Jarvis" },
  { quote: "[Depoimento sobre usar o Jarvis no trabalho todos os dias.]", name: "Seu nome aqui", role: "Cliente Jarvis" },
];

// Divide em duas fileiras pra correrem em sentidos opostos.
const rowOne = testimonials.slice(0, 3);
const rowTwo = testimonials.slice(3);

const trust: { icon: Icon; title: string; note: string }[] = [
  { icon: ShieldCheck, title: "Garantia de 7 dias", note: "Não gostou, devolvemos 100%" },
  { icon: HardDrives, title: "Dados 100% locais", note: "Nada sai do seu computador" },
  { icon: ArrowsClockwise, title: "Sem fidelidade", note: "Cancele quando quiser" },
];

function TestimonialCard({
  item,
  clone = false,
}: {
  item: Testimonial;
  clone?: boolean;
}) {
  return (
    <div
      aria-hidden={clone || undefined}
      className="glow-ring group relative mr-4 flex w-[340px] shrink-0 flex-col overflow-hidden rounded-card border border-white/[0.1] bg-ink-800/60 p-6 transition-colors duration-300 hover:border-white/25"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -right-1 -top-5 select-none font-display text-[6rem] font-bold leading-none text-transparent"
        style={{ WebkitTextStroke: "1px rgba(255,255,255,0.05)" }}
      >
        ”
      </span>
      <Quotes size={20} weight="fill" className="text-white/20" aria-hidden />
      <p className="mt-4 flex-1 text-[0.95rem] font-light italic leading-relaxed text-white/75">
        {item.quote}
      </p>
      <footer className="mt-6 flex items-center gap-3">
        <span
          aria-hidden
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/[0.03] text-white/45"
        >
          <User size={16} weight="light" />
        </span>
        <span>
          <span className="block font-display text-sm font-semibold text-[#FAFAFA]">
            {item.name}
          </span>
          <span className="block text-xs text-white/45">{item.role}</span>
        </span>
      </footer>
    </div>
  );
}

// Esteira infinita: duas metades identicas, anda -50%, o corte fecha
// invisivel. Para no hover.
function Track({
  items,
  direction,
}: {
  items: Testimonial[];
  direction: "left" | "right";
}) {
  const REPEAT = 3;
  const half = Array.from({ length: REPEAT }, (_, r) =>
    items.map((item, i) => ({ item, key: `${r}-${i}` }))
  ).flat();

  return (
    <div className="group/track flex overflow-hidden">
      <div
        className={`flex shrink-0 ${
          direction === "left" ? "animate-marquee-left" : "animate-marquee-right"
        } group-hover/track:[animation-play-state:paused]`}
      >
        {half.map(({ item, key }) => (
          <div key={key} className="relative shrink-0">
            <TestimonialCard item={item} />
          </div>
        ))}
        {half.map(({ item, key }) => (
          <div key={`dup-${key}`} className="relative shrink-0">
            <TestimonialCard item={item} clone />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Testimonials() {
  const reduce = useReducedMotionSafe();

  return (
    <section
      id="depoimentos"
      className="relative overflow-hidden border-t border-white/[0.07] bg-ink-900 px-6 py-28 sm:py-36 lg:px-10 wide:px-16"
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute left-1/2 top-1/2 h-[440px] w-[760px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.045] blur-[150px]" />
      </div>

      <div className="relative mx-auto max-w-6xl wide:max-w-shell">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto max-w-2xl text-center"
        >
          <div className="flex justify-center">
            <SectionEyebrow>Depoimentos</SectionEyebrow>
          </div>
          <h2 className="mt-5 text-balance font-display text-3xl font-semibold tracking-[-0.02em] text-[#FAFAFA] sm:text-5xl">
            O que dizem sobre o Jarvis.
          </h2>
        </motion.div>

        {/* Mural em duas esteiras infinitas, sentidos opostos, bordas com
            máscara pros cards entrarem e saírem de cena. */}
        <motion.div
          initial={reduce ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative mt-16 flex flex-col gap-4"
          style={{
            maskImage:
              "linear-gradient(to right, transparent, #000 7%, #000 93%, transparent)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent, #000 7%, #000 93%, transparent)",
          }}
        >
          <Track items={rowOne} direction="left" />
          <Track items={rowTwo} direction="right" />
        </motion.div>

        {/* Faixa de confiança: fatos REAIS que a página garante. */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="mt-14 grid grid-cols-1 gap-3 rounded-card border border-white/[0.08] bg-ink-800/40 p-3 sm:grid-cols-3"
        >
          {trust.map(({ icon: Glyph, title, note }) => (
            <div key={title} className="flex items-center gap-3.5 rounded-chip px-4 py-3">
              <span
                aria-hidden
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-chip border border-white/[0.12] bg-white/[0.04] text-white/70"
              >
                <Glyph size={19} weight="light" />
              </span>
              <span>
                <span className="block font-display text-sm font-semibold text-[#FAFAFA]">
                  {title}
                </span>
                <span className="block text-xs text-white/45">{note}</span>
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
