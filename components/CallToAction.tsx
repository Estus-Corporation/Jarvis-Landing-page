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
// O fundo nao repete foto de produto. No lugar entra o motivo que a pagina
// inteira ja construiu: a forma de uma voz. A onda vira horizonte, e a secao
// fecha com o desenho do que o produto e.

// Envelope de onda: pico no centro, decaindo para as bordas, com variacao
// deterministica por indice. Nada de Math.random, senao servidor e cliente
// desenham alturas diferentes e a hidratacao quebra.
const BAR_COUNT = 96;
const HORIZON = Array.from({ length: BAR_COUNT }, (_, i) => {
  const envelope = Math.sin((Math.PI * i) / (BAR_COUNT - 1));
  const jitter = 0.32 + 0.68 * Math.abs(Math.sin(i * 1.7) * Math.cos(i * 0.61));
  return Math.max(0.06, envelope * jitter);
});

// Removedores de atrito, todos ancorados no que a pagina ja afirma: os
// requisitos vem de Signals, o preco de lancamento e o cancelamento vem da
// tabela de precos. Nenhum inventa promessa nova.
const assurances: { icon: Icon; label: string }[] = [
  { icon: WindowsLogo, label: "Windows 10 e 11" },
  { icon: DownloadSimple, label: "Instala em minutos" },
  { icon: Prohibit, label: "Cancele quando quiser" },
];

export default function CallToAction() {
  const reduce = useReducedMotion();

  return (
    <section className="relative overflow-hidden border-t border-white/[0.08] bg-ink-900 px-6 pb-44 pt-32 sm:pb-56 sm:pt-44">
      {/* Camada 1: luz nascendo da borda de baixo, como um amanhecer. Fica
          atras da onda e e o que da volume ao horizonte. */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-1/2 h-[560px] w-[1100px] -translate-x-1/2 translate-y-1/3 rounded-[50%] bg-white/[0.07] blur-[120px]"
      />
      {/* Camada 2: nucleo mais quente e concentrado dentro do halo. */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-1/2 h-[260px] w-[560px] -translate-x-1/2 translate-y-1/2 rounded-[50%] bg-white/[0.09] blur-[90px]"
      />
      {/* Camada 3: vinheta lateral, para a luz nao encostar nas bordas. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_75%_60%_at_50%_100%,transparent_35%,rgb(14,14,16)_100%)]"
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

      {/* Removedores de atrito. Sem cartao: so icone e texto, separados por
          hairline no desktop. A fileira le como assinatura de rodape do
          fechamento, sem competir com o botao logo acima. */}
      <motion.ul
        initial={reduce ? false : { opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{
          duration: 0.6,
          delay: reduce ? 0 : 0.18,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="relative mx-auto mt-14 flex max-w-3xl flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-0"
      >
        {assurances.map(({ icon: Glyph, label }) => (
          <li
            key={label}
            className="flex items-center gap-2.5 sm:border-l sm:border-white/[0.14] sm:px-6 sm:first:border-l-0"
          >
            <Glyph
              size={18}
              weight="light"
              aria-hidden
              className="shrink-0 text-white/50"
            />
            <span className="text-sm text-white/60">{label}</span>
          </li>
        ))}
      </motion.ul>

      {/* Horizonte de onda. Estatico de proposito: a pagina ja tem chuva de
          codigo, halo pulsando, onda viva na secao de voz e ping no console.
          O fechamento e a expiracao, nao mais um loop competindo por atencao.
          A unica animacao e a subida das barras quando a secao entra em cena. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 flex h-[150px] items-end justify-center gap-[3px] px-4 sm:h-[190px]"
        style={{
          maskImage:
            "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
        }}
      >
        {HORIZON.map((h, i) => (
          <motion.span
            key={i}
            className="w-full max-w-[7px] origin-bottom rounded-t-full bg-gradient-to-t from-white/[0.32] to-white/[0.06]"
            style={{ height: `${h * 100}%` }}
            initial={reduce ? false : { scaleY: 0.05, opacity: 0 }}
            whileInView={{ scaleY: 1, opacity: 1 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{
              duration: 0.9,
              // Sobe do centro para as pontas: a onda "acende" a partir de
              // onde a voz seria mais forte.
              delay: reduce ? 0 : Math.abs(i - BAR_COUNT / 2) * 0.008,
              ease: [0.16, 1, 0.3, 1],
            }}
          />
        ))}
      </div>
    </section>
  );
}
