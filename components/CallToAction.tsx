"use client";

import React from "react";
import dynamic from "next/dynamic";
import { motion } from "motion/react";
import { useReducedMotionSafe } from "@/components/ui/use-reduced-motion-safe";
import {
  WindowsLogo,
  DownloadSimple,
  Clock,
  ShieldCheck,
  ArrowRight,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";

// Carregado sob demanda: PrismaticBurst arrasta a `ogl` (WebGL) inteira no
// bundle. A secao fica no rodape da pagina, entao ninguem deveria pagar esse
// peso no carregamento inicial so pra rolar ate aqui depois (ou nunca rolar).
// ssr:false porque WebGL nao existe no servidor. O fundo ja e ink-900 solido
// atras do wrapper, entao nao ha flash de layout enquanto o chunk carrega.
const PrismaticBurst = dynamic(() => import("@/components/ui/prismatic-burst"), {
  ssr: false,
});

// Fechamento da pagina. Um CTA so, com o mesmo rotulo usado no header, no hero
// e nos planos: uma intencao, um texto, em todo lugar.
//
// A antiga onda de barras e os halos de "amanhecer" na base sairam a pedido. O
// fechamento agora e limpo: um glow central sutil por tras do texto da a
// profundidade, sem o show de luzes competindo na regiao de baixo.

// Removedores de atrito, ancorados no que a pagina ja afirma. A garantia de 7
// dias e a unica promessa nova aqui, e e uma promessa real: o negocio
// consegue cumprir. Cada um ganhou uma segunda linha explicando o "porque",
// nao so o rotulo curto de antes.
const assurances: { icon: Icon; title: string; description: string }[] = [
  {
    icon: WindowsLogo,
    title: "Compatível com Windows 10 e 11",
    description: "Funciona perfeitamente nas versões mais recentes.",
  },
  {
    icon: DownloadSimple,
    title: "Instalação rápida e fácil",
    description: "Instale em minutos e comece a usar.",
  },
  {
    icon: Clock,
    title: "Cancele quando quiser",
    description: "Sem burocracia. Você tem controle total.",
  },
  {
    icon: ShieldCheck,
    title: "Garantia de 7 dias",
    description: "Teste sem riscos. Se não gostar, devolvemos seu dinheiro.",
  },
];

export default function CallToAction() {
  const reduce = useReducedMotionSafe();

  return (
    <section className="relative overflow-hidden border-t border-white/[0.08] bg-ink-900 px-6 py-20 sm:py-24">
      {/* Fundo animado por tras do fechamento, no lugar do glow estatico de
          antes. Paleta presa ao cinza/branco do resto do site (as mesmas
          cores do PixelCard do plano Anual): nada de arco-iris, so luz se
          movendo devagar. `lighten` garante que ele so clareia o fundo
          escuro, nunca escurece o texto por cima; `rayCount` fica de fora de
          proposito para o resultado ler como nebulosa suave, nao como
          holofotes. Congela com `paused` para quem prefere menos movimento. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0 opacity-70">
        <PrismaticBurst
          animationType="rotate3d"
          intensity={1.2}
          speed={0.25}
          distort={0.8}
          paused={!!reduce}
          colors={["#ffffff", "#a1a1aa", "#3f3f46"]}
          mixBlendMode="lighten"
        />
      </div>

      <motion.div
        initial={reduce ? false : { opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 mx-auto flex max-w-2xl flex-col items-center text-center"
      >
        <h2 className="text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.03em] text-[#FAFAFA] sm:text-6xl">
          Pare de procurar o ícone.
        </h2>
        <p className="mt-6 max-w-[44ch] text-lg font-light leading-relaxed text-white/55">
          Instale, escolha sua palavra de ativação e comece a falar.
        </p>

        {/* CTA de fechamento: maior que os outros da pagina de proposito. Este
            e o ultimo ponto de decisao, entao ele ganha escala, luz propria e
            uma seta que aponta para a acao. */}
        <a
          href="#precos"
          className="group relative mt-9 inline-flex items-center gap-3 overflow-hidden rounded-full bg-[#FAFAFA] px-10 py-5 text-base font-semibold text-ink-950 shadow-[inset_0_1px_0_rgba(255,255,255,1),0_18px_55px_-14px_rgba(255,255,255,0.55)] transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[inset_0_1px_0_rgba(255,255,255,1),0_26px_70px_-14px_rgba(255,255,255,0.8)] active:translate-y-0 active:scale-[0.98]"
        >
          {/* Brilho varrendo no hover: confirma que o alvo esta vivo antes do
              clique. Escuro porque o botao e claro. */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-ink-950/10 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full"
          />
          <span className="relative">Começar agora</span>
          <ArrowRight
            size={19}
            weight="bold"
            aria-hidden
            className="relative transition-transform duration-300 group-hover:translate-x-1"
          />
        </a>
      </motion.div>

      {/* Eyebrow com fio dos dois lados, seguido do cartao de vidro grande com
          um selo por coluna (badge circular + titulo + linha de explicacao).
          Substitui a pilula compacta de antes: a referencia pedia mais peso
          aqui, e mais peso significa espaco para o "porque" de cada garantia,
          nao so o rotulo. */}
      <div className="relative z-10 mt-11">
        <motion.div
          initial={reduce ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-6 flex items-center justify-center gap-4"
        >
          <span className="hidden h-px w-12 bg-white/15 sm:block sm:w-16" aria-hidden />
          <span className="whitespace-nowrap text-xs font-medium uppercase tracking-[0.15em] text-white/40 sm:tracking-[0.25em]">
            Rápido · Seguro · Sem complicação
          </span>
          <span className="hidden h-px w-12 bg-white/15 sm:block sm:w-16" aria-hidden />
        </motion.div>

        <motion.ul
          initial={reduce ? false : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{
            duration: 0.6,
            delay: reduce ? 0 : 0.18,
            ease: [0.16, 1, 0.3, 1],
          }}
          // Raio maior que o resto da pagina de proposito: excecao pedida so
          // para este cartao, nao muda o token global (cartoes = 20px em
          // qualquer outro lugar).
          className="glass-surface relative mx-auto grid max-w-[960px] grid-cols-1 gap-y-8 overflow-hidden rounded-[40px] border border-white/[0.14] bg-ink-900/50 px-6 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.16),inset_0_-1px_0_rgba(255,255,255,0.05),0_18px_50px_-16px_rgba(0,0,0,0.7)] backdrop-blur-3xl backdrop-saturate-100 sm:grid-cols-2 sm:gap-x-8 sm:px-8 lg:grid-cols-4 lg:gap-x-0 lg:py-6"
        >
          {/* Grao proprio, mais forte que o grao global da pagina (0.035): e
              o que faz o vidro ler como fosco/despolido em vez de so um
              retangulo translucido com blur. Fica atras do conteudo, dentro
              do proprio recorte arredondado do cartao. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-0 opacity-[0.05] mix-blend-overlay"
            style={{
              backgroundImage:
                'url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="140" height="140"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter><rect width="140" height="140" filter="url(%23n)"/></svg>\')',
              backgroundRepeat: "repeat",
            }}
          />
          {/* As tres divisorias voltaram: a barra do lado do item de Windows
              tinha saido a pedido antes, mas era a unica que faltava — as
              outras duas ja estavam la. Volta a ficar identico ao que o
              `divide-x` original fazia, so que explicito por item. */}
          {assurances.map(({ icon: Glyph, title, description }, i) => (
            <li
              key={title}
              className={`relative z-10 flex flex-col items-center px-4 text-center lg:px-8 ${
                i >= 1 ? "lg:border-l lg:border-white/10" : ""
              }`}
            >
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] text-white/80">
                <Glyph size={26} weight="regular" aria-hidden />
              </span>
              <h3 className="mt-5 max-w-[18ch] text-base font-semibold leading-snug text-[#FAFAFA] sm:text-lg">
                {title}
              </h3>
              <p className="mt-2.5 max-w-[26ch] text-sm leading-relaxed text-white/50">
                {description}
              </p>
            </li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
