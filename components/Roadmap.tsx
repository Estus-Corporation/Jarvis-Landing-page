"use client";

import React from "react";
import { motion } from "motion/react";
import { useReducedMotionSafe } from "@/components/ui/use-reduced-motion-safe";
import {
  DeviceMobile,
  House,
  Car,
  ArrowRight,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";
import SectionEyebrow from "@/components/ui/section-eyebrow";

// Secao nova, pedida explicitamente: um "spoiler" do que vem depois do
// lancamento. Existe por duas razoes de venda, nao so de informar —
//  1) mostra que o Jarvis e uma plataforma em expansao, nao um produto
//     parado, o que baixa o medo de "compro e amanha param de atualizar".
//  2) fecha a pagina com a mesma ideia de "comece agora": quem assina hoje
//     ja fica dentro de tudo isso quando sair, sem pagar de novo por isso.
//
// So 3 itens, os 3 que o pedido trouxe, na ordem em que foram descritos:
// mobile primeiro (o mais proximo/generico), depois casa inteligente, depois
// carro (o mais ambicioso, fecha em alta). Cada um leva um comando de
// exemplo — a mesma prova por fala que o resto da pagina usa pra capacidade
// atual, aqui usada pra capacidade futura.
type RoadmapItem = {
  icon: Icon;
  step: string;
  title: string;
  body: string;
  quote: string;
};

const items: RoadmapItem[] = [
  {
    icon: DeviceMobile,
    step: "01",
    title: "Jarvis no seu bolso",
    body: "Um app pra continuar comandando o Jarvis do celular, mesmo longe do computador.",
    quote: "Jarvis, quanto falta pro meu build terminar?",
  },
  {
    icon: House,
    step: "02",
    title: "Sua casa, por voz",
    body: "Lâmpada, ar-condicionado, tomada inteligente: o mesmo Jarvis que cuida do seu PC passa a cuidar da sua casa.",
    quote: "Jarvis, apaga as luzes e liga o ar-condicionado.",
  },
  {
    icon: Car,
    step: "03",
    title: "Jarvis no painel do seu carro",
    body: "Integrado à multimídia do carro. Rota, mensagem, playlist — peça sem tirar as mãos do volante.",
    quote: "Jarvis, rota para casa. E quem me mandou mensagem no WhatsApp?",
  },
];

function ComingSoonBadge() {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.04] px-3 py-1 font-display text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-white/55">
      <span className="led-dot" aria-hidden />
      Em breve
    </span>
  );
}

function RoadmapCard({ item, delay }: { item: RoadmapItem; delay: number }) {
  const reduce = useReducedMotionSafe();
  const Glyph = item.icon;

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{
        duration: 0.65,
        delay: reduce ? 0 : delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="glow-ring glow-ring--active relative flex h-full flex-col overflow-hidden rounded-card border border-white/[0.1] bg-ink-900/70 p-7 sm:p-8"
    >
      <div className="flex items-start justify-between gap-4">
        <span
          aria-hidden
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-chip border border-white/[0.12] bg-white/[0.04] text-white/70"
        >
          <Glyph size={22} weight="light" />
        </span>
        <ComingSoonBadge />
      </div>

      <p
        aria-hidden
        className="mt-6 font-display text-xs font-semibold tracking-[0.2em] text-white/25"
      >
        {item.step}
      </p>
      <h3 className="mt-2 font-display text-xl font-semibold tracking-[-0.01em] text-[#FAFAFA] sm:text-2xl">
        {item.title}
      </h3>
      <p className="mt-3 max-w-[36ch] text-sm leading-relaxed text-white/50">
        {item.body}
      </p>

      <p className="mt-6 border-l border-white/15 pl-4 text-sm italic leading-relaxed text-white/65">
        “{item.quote}”
      </p>
    </motion.div>
  );
}

export default function Roadmap() {
  const reduce = useReducedMotionSafe();

  return (
    <section
      id="futuro"
      className="relative overflow-hidden border-t border-white/[0.07] bg-ink-950 px-6 py-28 sm:py-36 lg:px-10 wide:px-16"
    >
      {/* Mesmo tratamento de fundo tecnico de Integracoes (grade + halo),
          reaproveitado aqui pra costurar visualmente as duas secoes "tech" da
          pagina sem repetir o layout inteiro. */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.045) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage:
              "radial-gradient(ellipse 70% 50% at 50% 0%, #000 30%, transparent 100%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 70% 50% at 50% 0%, #000 30%, transparent 100%)",
          }}
        />
        <div className="absolute left-1/2 top-0 h-[380px] w-[760px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-white/[0.05] blur-[130px]" />
      </div>

      <div className="relative mx-auto max-w-6xl wide:max-w-shell">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto max-w-2xl text-center"
        >
          <SectionEyebrow>Próximas atualizações</SectionEyebrow>
          <h2 className="mt-5 text-balance font-display text-3xl font-semibold tracking-[-0.02em] text-[#FAFAFA] sm:text-5xl">
            O Jarvis não para de aprender lugares novos.
          </h2>
          <p className="mx-auto mt-5 max-w-[54ch] text-lg font-light leading-relaxed text-white/55">
            O computador é só o começo. Isto é o que já está a caminho — e
            quem assina agora recebe cada uma dessas atualizações sem pagar
            de novo por elas.
          </p>
        </motion.div>

        <div className="mt-16 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {items.map((item, i) => (
            <RoadmapCard key={item.title} item={item} delay={i * 0.1} />
          ))}
        </div>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mt-14 flex flex-col items-center justify-center gap-5 text-center"
        >
          <p className="text-sm text-white/45">
            Nenhuma dessas atualizações tem data marcada ainda — mas quem já
            é Jarvis é o primeiro a receber, sem custo extra.
          </p>
          <a
            href="#precos"
            className="group inline-flex items-center gap-2 rounded-full bg-[#FAFAFA] px-7 py-3 text-sm font-semibold text-ink-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_10px_30px_-12px_rgba(255,255,255,0.35)] transition-colors duration-200 hover:bg-white active:scale-[0.98]"
          >
            Entrar agora
            <ArrowRight
              size={15}
              weight="bold"
              aria-hidden
              className="transition-transform duration-300 group-hover:translate-x-0.5"
            />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
