"use client";

import React from "react";
import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    title: "Ative",
    description:
      'Diga a palavra de ativação — "Jarvis" — ou pressione o atalho global configurado por você.',
  },
  {
    number: "02",
    title: "Fale naturalmente",
    description:
      "Sem decorar comandos. Fale como falaria com uma pessoa: \"pausa o vídeo\", \"abre o VS Code\", \"toca minha playlist\".",
  },
  {
    number: "03",
    title: "O Jarvis executa",
    description:
      "Ele interpreta o pedido e aciona a ferramenta certa: navegador, terminal, apps, Spotify, WhatsApp ou memória.",
  },
  {
    number: "04",
    title: "Ele responde com a sua voz",
    description:
      "A resposta chega falada, na sua própria voz clonada — curta, direta e sem enrolação.",
  },
];

export default function HowItWorks() {
  return (
    <section id="como-funciona" className="relative bg-black px-6 py-28">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-[#333] bg-[rgba(31,31,31,0.62)] px-4 py-1.5 text-xs font-medium tracking-wide text-gray-300">
            Como funciona
          </span>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Da sua voz até a ação, em segundos.
          </h2>
          <p className="mt-4 text-base font-light text-white/60 sm:text-lg">
            Nenhuma etapa manual entre o que você pede e o que o Jarvis faz.
          </p>
        </motion.div>

        <div className="relative mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="absolute left-0 right-0 top-6 hidden h-px bg-gradient-to-r from-transparent via-white/15 to-transparent lg:block" />

          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, ease: "easeOut", delay: i * 0.1 }}
              className="relative flex flex-col"
            >
              <span className="relative z-10 w-fit rounded-full border border-white/15 bg-black px-3 py-1 text-xs font-semibold tracking-wider text-white/70">
                {step.number}
              </span>
              <h3 className="mt-5 text-lg font-semibold text-white">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-white/50">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
