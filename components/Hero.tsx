"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import { useReducedMotionSafe } from "@/components/ui/use-reduced-motion-safe";
import { JarvisOrb } from "@/components/ui/jarvis-sphere";
import { useOrbSize } from "@/components/ui/use-orb-size";
import { SpokenCaption } from "@/components/ui/spoken-caption";
import CodeRain from "@/components/ui/code-rain";

const HEADLINE = ["Fale.", "O", "Jarvis", "executa."];

// Frases proprias do hero. Sao diferentes das da secao de Voz clonada de
// proposito: a mesma legenda datilografada aparece em dois pontos da pagina, e
// repetir texto identico faria a segunda parecer um bug de copia. Todas
// descrevem coisas que o produto realmente faz.
const HERO_PHRASES = [
  "Abrindo o Chrome e buscando os documentos.",
  "Comando executado. Terminal pronto.",
  "Notificações silenciadas. Modo foco ligado.",
  "Claro. Enviando a mensagem agora.",
];

export default function Hero() {
  const reduce = useReducedMotionSafe();
  // O teto acompanha a largura da coluna do orb, alargada logo abaixo no grid.
  // A caixa desenhada e (size + 144) por causa do padding dos aneis, entao o
  // limite util da coluna de ~640px e 496. O hook ainda corta por altura de
  // viewport, o que mantem o hero inteiro visivel em telas baixas.
  // Teto menor que antes (era 480). A legenda falada agora divide a coluna com
  // a esfera, e o hero continua tendo que caber na primeira tela: o espaco que
  // a caixa de texto ocupa saiu do diametro da esfera.
  const { containerRef, size } = useOrbSize({ min: 220, max: 480 });

  // A esfera segue a legenda, exatamente como na secao de Voz clonada: fala
  // enquanto o texto e datilografado e se acalma quando a frase termina. Antes
  // ela so trocava de "idle" para "listening" uma vez e parava ali.
  const [speaking, setSpeaking] = useState(false);
  const handleSpeakingChange = React.useCallback(
    (value: boolean) => setSpeaking(value),
    []
  );

  return (
    <section
      id="top"
      className="relative flex min-h-[100dvh] w-full items-center overflow-hidden bg-ink-950 px-6 pb-20 pt-24"
    >
      <CodeRain />

      {/* Halo com respiro lento, unico loop continuo do fundo. */}
      <motion.div
        animate={
          reduce ? undefined : { scale: [1, 1.06, 1], opacity: [0.85, 1, 0.85] }
        }
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute right-0 top-1/2 h-[640px] w-[640px] -translate-y-1/2 translate-x-1/4 rounded-full bg-white/[0.045] blur-[130px]"
      />

      <div className="relative mx-auto grid w-full max-w-shell grid-cols-1 items-center gap-14 lg:grid-cols-[0.95fr_1.15fr] lg:gap-8">
        <div className="order-2 lg:order-1">
          {/* Revelacao palavra a palavra: o titulo se monta como uma frase
              sendo dita, em vez de aparecer inteiro de uma vez. */}
          <h1 className="flex max-w-[15ch] flex-wrap gap-x-[0.28em] text-[2.75rem] font-semibold leading-[1.05] tracking-[-0.03em] text-[#FAFAFA] sm:text-6xl lg:text-7xl">
            {HEADLINE.map((word, i) => (
              <span key={word + i} className="overflow-hidden pb-[0.08em]">
                <motion.span
                  className="inline-block"
                  initial={reduce ? false : { y: "100%", opacity: 0 }}
                  animate={{ y: "0%", opacity: 1 }}
                  transition={{
                    duration: 0.75,
                    delay: reduce ? 0 : i * 0.08,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  {word}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p
            initial={reduce ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.42, ease: [0.16, 1, 0.3, 1] }}
            className="mt-7 max-w-[46ch] text-lg font-light leading-relaxed text-white/60"
          >
            Um assistente de voz que vive no seu Windows. Controla o navegador,
            abre programas e roda comandos de terminal.
          </motion.p>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.52, ease: [0.16, 1, 0.3, 1] }}
            className="mt-10 flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center"
          >
            <a
              href="#precos"
              className="rounded-full bg-[#FAFAFA] px-9 py-4 text-center text-base font-semibold text-ink-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_10px_30px_-12px_rgba(255,255,255,0.35)] transition-colors duration-200 hover:bg-white active:scale-[0.98] sm:w-fit"
            >
              Começar agora
            </a>

            <a
              href="#recursos"
              className="rounded-full border border-white/15 px-9 py-4 text-center text-base text-white/70 transition-all duration-300 hover:border-white/40 hover:bg-white/[0.04] hover:text-white active:scale-[0.98] sm:w-fit"
            >
              Ver recursos
            </a>
          </motion.div>
        </div>

        <motion.div
          initial={reduce ? false : { opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="order-1 flex flex-col items-center lg:order-2"
        >
          <div ref={containerRef} className="flex w-full justify-center">
            <JarvisOrb
              state={speaking ? "speaking" : "idle"}
              sphereSize={size}
              paused={!!reduce}
            />
          </div>

          {/* O orb ja traz 72px de padding transparente embaixo, entao a
              legenda encosta sem precisar de margem propria grande. */}
          <div className="flex w-full justify-center px-2">
            <SpokenCaption
              phrases={HERO_PHRASES}
              onSpeakingChange={handleSpeakingChange}
              // Acima da dobra: entra por tempo, junto com os CTAs, e nao por
              // scroll, que aqui nunca aconteceria.
              reveal="immediate"
              revealDelay={0.75}
              className="max-w-md"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
