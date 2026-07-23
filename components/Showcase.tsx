"use client";

import React from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";

// Prova visual da secao: uma imagem so, a captura real da dashboard.
//
// A segunda foto saiu a pedido. E, com ela fora, a lista de widgets nao podia
// continuar como cartao ao lado: a propria imagem ja mostra clima, relogio,
// Spotify e tarefas. Nomear em texto o que a foto exibe e dizer duas vezes.
// Os nomes viram indice discreto embaixo, e a imagem ganha o palco inteiro.
const widgets = [
  "Clima e relógio",
  "Spotify com capa do álbum",
  "Timer e pomodoro",
  "Jogo em execução",
  "Tarefas, agenda e lembretes",
  "Chat de texto com imagens",
];

export default function Showcase() {
  const reduce = useReducedMotion();

  return (
    <section className="relative overflow-hidden bg-ink-900 px-6 py-28 sm:py-36">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[900px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-white/[0.04] blur-[130px]"
      />

      <div className="relative mx-auto max-w-shell">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-3xl"
        >
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-white/35">
            Interface
          </span>
          <h2 className="mt-4 text-balance text-3xl font-semibold tracking-[-0.025em] text-[#FAFAFA] sm:text-5xl lg:text-6xl">
            Uma dashboard viva na sua tela.
          </h2>
          <p className="mt-6 max-w-[54ch] text-lg font-light leading-relaxed text-white/55">
            A esfera reage à conversa no centro. Em volta, widgets que você
            arrasta, reorganiza e tinge com o seu tema de cor.
          </p>
        </motion.div>

        {/* Palco da imagem. Moldura de bisel duplo: uma casca externa com
            respiro e um nucleo interno com realce no topo. Nao e cromo de
            janela falsa, e um porta-retrato: a imagem e real, a moldura nao
            finge ser sistema operacional. */}
        <motion.figure
          initial={reduce ? false : { opacity: 0, y: 32, scale: 0.965 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="relative mt-16"
        >
          {/* Luz sob a imagem: separa o painel do fundo e dá volume. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-12 bottom-0 h-40 translate-y-1/2 rounded-[50%] bg-white/[0.09] blur-[80px]"
          />

          <div className="relative rounded-[26px] border border-white/[0.09] bg-white/[0.03] p-1.5 shadow-[0_50px_140px_-50px_rgba(0,0,0,0.95)] sm:p-2">
            <div className="overflow-hidden rounded-[20px] border border-white/[0.07] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
              <Image
                src="/images/jarvis-dashboard.png"
                alt="Interface do Jarvis: esfera de rede geodésica no centro, com widgets de tarefas, clima, relógio e Spotify ao redor."
                width={1918}
                height={1062}
                sizes="(max-width: 1200px) 100vw, 1200px"
                quality={90}
                className="block w-full"
              />
            </div>
          </div>
        </motion.figure>

        {/* Indice do que aparece na imagem. Sem cartao e sem icone: a secao ja
            tem um ativo visual forte, e competir com ele aqui embaixo so
            rouba atencao da captura. */}
        <div className="mt-16">
          <h3 className="text-sm font-medium text-white/45">
            O que já vem na tela
          </h3>
          <ul className="mt-6 grid gap-x-10 sm:grid-cols-2 lg:grid-cols-3">
            {widgets.map((widget, i) => (
              <motion.li
                key={widget}
                initial={reduce ? false : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{
                  duration: 0.5,
                  delay: reduce ? 0 : i * 0.06,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="border-t border-white/[0.1] py-4 text-sm text-white/65"
              >
                {widget}
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
