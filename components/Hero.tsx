"use client";

import React from "react";
import { motion } from "framer-motion";
import { CanvasRevealEffect } from "@/components/ui/canvas-reveal-effect";

export default function Hero() {
  return (
    <section
      id="top"
      className="relative flex min-h-screen w-full flex-col overflow-hidden bg-black"
    >
      {/* Background layer */}
      <div className="absolute inset-0 z-0">
        <CanvasRevealEffect
          animationSpeed={3}
          containerClassName="bg-black"
          colors={[
            [255, 255, 255],
            [255, 255, 255],
          ]}
          dotSize={6}
          reverse={false}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(0,0,0,0.9)_0%,_transparent_100%)]" />
        <div className="absolute left-0 right-0 top-0 h-1/3 bg-gradient-to-b from-black to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black to-transparent" />
      </div>

      {/* Content layer */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pt-40 pb-24 text-center sm:pt-44">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#333] bg-[rgba(31,31,31,0.62)] px-4 py-1.5 backdrop-blur-sm"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-white" />
          <span className="text-xs font-medium tracking-wide text-gray-300">
            Seu Windows, agora com um mordomo de IA
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
          className="max-w-3xl text-[2.5rem] font-bold leading-[1.1] tracking-tight text-white sm:text-6xl"
        >
          Fale. O Jarvis executa.
          <br className="hidden sm:block" /> Sem tocar no teclado.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
          className="mt-6 max-w-xl text-base font-light text-white/60 sm:text-lg"
        >
          Um assistente de voz que vive no seu Windows: controla navegador,
          abre e fecha programas, roda comandos de terminal, mexe no Spotify
          e no WhatsApp, e responde com a sua própria voz clonada.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
          className="mt-10 flex w-full max-w-md flex-col items-center gap-3 sm:w-auto sm:flex-row sm:justify-center"
        >
          <a href="#precos" className="group relative block w-full sm:w-auto">
            <div className="pointer-events-none absolute inset-0 -m-2 hidden rounded-full bg-gray-100 opacity-40 blur-lg transition-all duration-300 ease-out group-hover:-m-3 group-hover:opacity-60 group-hover:blur-xl sm:block" />
            <button className="relative z-10 w-full rounded-full bg-gradient-to-br from-gray-100 to-gray-300 px-6 py-3 text-sm font-semibold text-black transition-all duration-200 hover:from-gray-200 hover:to-gray-400 sm:w-auto">
              Começar agora
            </button>
          </a>

          <a
            href="#demo"
            className="w-full rounded-full border border-[#333] bg-[rgba(31,31,31,0.62)] px-6 py-3 text-center text-sm text-gray-300 backdrop-blur-sm transition-colors duration-200 hover:border-white/50 hover:text-white sm:w-auto"
          >
            Ver demonstração
          </a>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.45 }}
          className="mt-8 text-xs text-white/40"
        >
          Windows 10/11 · Configuração em minutos · Sua voz, sua privacidade
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.55 }}
          className="mt-16 grid w-full max-w-3xl grid-cols-2 gap-6 border-t border-white/10 pt-10 sm:grid-cols-4"
        >
          {[
            { value: "10+", label: "integrações nativas" },
            { value: "100%", label: "controle por voz" },
            { value: "1", label: "voz clonada, a sua" },
            { value: "24/7", label: "sempre em espera" },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center">
              <span className="text-2xl font-bold text-white sm:text-3xl">
                {stat.value}
              </span>
              <span className="mt-1 text-xs text-white/40">{stat.label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
