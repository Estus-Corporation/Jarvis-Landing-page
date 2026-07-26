"use client";

import React from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  WindowsLogo,
  DownloadSimple,
  Prohibit,
  ArrowRight,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";

// Fechamento da pagina. Um CTA so, com o mesmo rotulo usado no header, no hero
// e nos planos: uma intencao, um texto, em todo lugar.
//
// A antiga onda de barras e os halos de "amanhecer" na base sairam a pedido. O
// fechamento agora e limpo: um glow central sutil por tras do texto da a
// profundidade, sem o show de luzes competindo na regiao de baixo.

// Removedores de atrito, ancorados no que a pagina ja afirma. Nenhum inventa
// promessa nova.
const assurances: { icon: Icon; label: string }[] = [
  { icon: WindowsLogo, label: "Windows 10 e 11" },
  { icon: DownloadSimple, label: "Instala em minutos" },
  { icon: Prohibit, label: "Cancele quando quiser" },
];

export default function CallToAction() {
  const reduce = useReducedMotion();

  return (
    <section className="relative overflow-hidden border-t border-white/[0.08] bg-ink-900 px-6 py-28 sm:py-36">
      {/* Glow central suave por tras do fechamento: profundidade sem o show de
          luzes que havia na base. */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[380px] w-[720px] max-w-[92%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] bg-white/[0.05] blur-[120px]"
      />

      <motion.div
        initial={reduce ? false : { opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative mx-auto flex max-w-2xl flex-col items-center text-center"
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
          className="group relative mt-12 inline-flex items-center gap-3 overflow-hidden rounded-full bg-[#FAFAFA] px-10 py-5 text-base font-semibold text-ink-950 shadow-[inset_0_1px_0_rgba(255,255,255,1),0_18px_55px_-14px_rgba(255,255,255,0.55)] transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[inset_0_1px_0_rgba(255,255,255,1),0_26px_70px_-14px_rgba(255,255,255,0.8)] active:translate-y-0 active:scale-[0.98]"
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

      {/* Removedores de atrito, agora dentro de um cartao de vidro com o mesmo
          material do header: mesma borda, mesmo fundo translucido, mesmo blur
          saturado e o realce de luz interno no topo. Pilula no desktop,
          cartao arredondado com os itens empilhados no mobile. */}
      <div className="mt-14 flex justify-center px-2">
        <motion.ul
          initial={reduce ? false : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{
            duration: 0.6,
            delay: reduce ? 0 : 0.18,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="glass-surface relative inline-flex flex-col items-center gap-4 rounded-card border border-white/[0.14] bg-ink-900/40 px-6 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.16),inset_0_-1px_0_rgba(255,255,255,0.04),0_18px_50px_-16px_rgba(0,0,0,0.7)] backdrop-blur-2xl backdrop-saturate-150 sm:flex-row sm:gap-0 sm:rounded-full sm:px-3 sm:py-2.5"
        >
          {assurances.map(({ icon: Glyph, label }) => (
            <li
              key={label}
              className="flex items-center gap-2.5 sm:border-l sm:border-white/[0.12] sm:px-6 sm:first:border-l-0"
            >
              <Glyph
                size={18}
                weight="light"
                aria-hidden
                className="shrink-0 text-white/50"
              />
              <span className="text-sm text-white/65">{label}</span>
            </li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
