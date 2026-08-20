"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { useReducedMotionSafe } from "@/components/ui/use-reduced-motion-safe";
import { WhatsappLogo, LinkedinLogo } from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";

// Mesmo link/padrao de override da Comunidade do WhatsApp usado em
// Formulario.tsx — ver o comentario la para o motivo do link ficar
// hardcoded como default (nao e segredo, existe pra ser divulgado).
const WHATSAPP_COMMUNITY_URL =
  process.env.NEXT_PUBLIC_WHATSAPP_COMMUNITY_URL ??
  "https://chat.whatsapp.com/CmCz8lGmQVuD3NsLRSnvxV";

const footerLinks = [
  {
    title: "Produto",
    links: [
      { label: "Recursos", href: "#recursos" },
      { label: "Interface", href: "#interface" },
      { label: "Organização", href: "#organizacao" },
      { label: "Depoimentos", href: "#depoimentos" },
      { label: "Lista de espera", href: "#formulario" },
    ],
  },
  {
    title: "Empresa",
    links: [
      { label: "Sobre a Estus Corporation", href: "#" },
      { label: "Contato", href: "#" },
      { label: "Carreiras", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Termos de uso", href: "#" },
      { label: "Política de privacidade", href: "#" },
    ],
  },
];

// Folga no espacamento do wordmark de fundo. 1 = as pontas do "JARVIS" caem
// exatamente sobre as pontas da linha do rodape, que era o comportamento
// original; acima disso a palavra fica um pouco mais larga que a linha e
// sangra alguns pixels pra cada lado (ela e centrada, entao a sobra se divide
// nas duas pontas). Proporcional de proposito, e nao um valor fixo em px: a
// linha muda muito de largura entre celular e monitor, e uma folga fixa seria
// enorme numa ponta e imperceptivel na outra.
const SPREAD = 1.015;

const socialLinks: { icon: Icon; href: string; label: string }[] = [
  { icon: WhatsappLogo, href: WHATSAPP_COMMUNITY_URL, label: "WhatsApp" },
  { icon: LinkedinLogo, href: "#", label: "LinkedIn" },
];

export default function Footer() {
  const reduce = useReducedMotionSafe();

  // Espacamento das letras do "JARVIS" de fundo calculado por JS pra ele
  // comecar e terminar exatamente em cima da linha do rodape (a borda acima
  // do copyright). Um valor fixo (em em ou %) nao da conta disso: a largura
  // da linha muda de proporcao com o container (max-w-6xl ate 1800px, depois
  // max-w-shell) enquanto o texto usa clamp(8rem, 22vw, 22rem) — as duas
  // curvas nao crescem juntas, entao so medindo os dois de verdade em tempo
  // real garante o encontro exato nas pontas em qualquer largura de tela.
  // Formula: letter-spacing soma espaco depois de CADA letra (as 6 de
  // "Jarvis", a ultima inclusive) — entao pra a palavra inteira crescer ate
  // `targetWidth`, cada letra recebe (alvo - largura natural) / 6. O alvo nao
  // e mais a largura crua da linha: passa pelo SPREAD (ver la em cima), que
  // abre um respiro a mais entre as letras.
  const wordmarkRef = useRef<HTMLSpanElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const [tracking, setTracking] = useState<number | null>(null);

  useEffect(() => {
    const word = wordmarkRef.current;
    const line = lineRef.current;
    if (!word || !line) return;

    const measure = () => {
      const text = word.textContent ?? "";
      if (!text.length) return;

      // Mede a largura "natural" (letter-spacing zero) num CLONE invisivel,
      // nunca no elemento de verdade: esse span e controlado pelo React (o
      // proprio `tracking` que estamos calculando vira o `letterSpacing`
      // dele), entao mutar seu style diretamente aqui brigava com o proximo
      // render do React e o valor calculado nao "pegava" (ficava preso em
      // 0px). O clone herda fonte/peso/tamanho (mesmas classes + mesmo
      // style inline) sem tocar no elemento real.
      const clone = word.cloneNode(true) as HTMLElement;
      clone.style.letterSpacing = "0px";
      clone.style.position = "absolute";
      clone.style.visibility = "hidden";
      clone.style.left = "-99999px";
      clone.style.top = "0";
      document.body.appendChild(clone);
      const naturalWidth = clone.getBoundingClientRect().width;
      document.body.removeChild(clone);

      const targetWidth = line.getBoundingClientRect().width * SPREAD;
      setTracking((targetWidth - naturalWidth) / text.length);
    };

    measure();
    window.addEventListener("resize", measure);
    document.fonts?.ready?.then(measure).catch(() => {});
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Era o unico bloco da pagina sem entrada por scroll: todo o resto ja
  // aparece com fade+subida ao entrar na tela, e o rodape so surgia estatico.
  // ink-900: a secao anterior (Formulario) usa #0C0C0E — quebra o tom o
  // suficiente pra costura ficar visivel sem precisar de um bloco de
  // transicao a mais entre as duas.
  return (
    <footer className="relative overflow-hidden border-t border-white/[0.08] bg-ink-900 px-6 py-16 sm:py-20 lg:px-10 wide:px-16">
      {/* linha divisoria: mesmo brilho estatico (sem animacao) das outras
          secoes — ver Showcase.tsx/Roadmap.tsx. Fica por cima do border-t
          solido do <footer>, que continua ali por baixo. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent"
      />

      {/* Wordmark de fundo de verdade: absolute, atras de tudo (o conteudo
          real usa z-10 la embaixo), entao nao empurra mais nada no fluxo —
          antes ele vivia entre o grid e a linha do copyright como um bloco
          normal, o que o deixava "separado" (abaixo dos elementos) em vez de
          atras deles. items-end + padding-bottom encosta ele perto da linha
          do copyright sem precisar medir pixel a pixel. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex select-none items-end justify-center overflow-hidden pb-28 sm:pb-32"
      >
        <span
          ref={wordmarkRef}
          className="inline-block whitespace-nowrap font-sans font-bold uppercase leading-none text-transparent"
          style={{
            WebkitTextStroke: "1px rgba(255,255,255,0.06)",
            fontSize: "clamp(8rem, 22vw, 22rem)",
            // 0.02em e o valor de antes: usado so como fallback ate a
            // medicao em JS rodar (evita um "pulo" visivel de um valor pra
            // outro logo depois do primeiro paint).
            letterSpacing: tracking !== null ? `${tracking}px` : "0.02em",
          }}
        >
          Jarvis
        </span>
      </div>

      <motion.div
        initial={reduce ? false : { opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 mx-auto max-w-6xl wide:max-w-shell"
      >
        {/* grid-cols-1 no celular (era grid-cols-2 desde o inicio, nao so a
            partir de sm): com 2 colunas e 3 grupos de links (Produto/
            Empresa/Legal) depois da marca, a ultima linha ficava 1-de-2 —
            "Legal" sozinho a esquerda com uma coluna vazia do lado, torto
            (pedido do usuario pra organizar melhor o rodape no celular).
            Empilhado numa coluna so, cada grupo (marca + os 3) vira uma
            linha inteira, sem sobra nenhuma. sm:grid-cols-4 continua igual:
            o layout de desktop (marca + 3 grupos lado a lado) nao mudou. */}
        <div className="grid grid-cols-1 gap-y-10 sm:grid-cols-4 sm:gap-10">
          <div>
            <a href="#top" className="flex items-center gap-2.5">
              <div className="relative flex h-5 w-5 items-center justify-center">
                <span className="absolute left-1/2 top-0 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-white/90" />
                <span className="absolute left-0 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-white/90" />
                <span className="absolute right-0 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-white/90" />
                <span className="absolute bottom-0 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-white/90" />
              </div>
              <span className="text-sm font-semibold tracking-[0.18em] text-white">
                JARVIS
              </span>
            </a>
            <p className="mt-5 max-w-[24ch] text-sm leading-relaxed text-white/40">
              Seu assistente de voz para Windows. Fale, e ele executa.
            </p>

            <div className="mt-7 flex items-center gap-2.5">
              {socialLinks.map((social) => {
                const Glyph = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 text-white/70 transition-colors duration-200 hover:border-white/30 hover:bg-white/[0.06] hover:text-white"
                  >
                    <Glyph size={22} weight="regular" aria-hidden />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Hierarquia espelhada na da coluna da marca, ao lado: o titulo do
              grupo usa o mesmo branco cheio do "JARVIS", e os links usam o
              mesmo white/40 da frase "Seu assistente de voz para Windows".
              Antes era o contrario — titulo mais apagado (white/40) que os
              proprios links (white/60). */}
          {footerLinks.map((group) => (
            <div key={group.title}>
              <h3 className="text-sm font-medium text-white">{group.title}</h3>
              <ul className="mt-5 flex flex-col gap-3">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-white/40 transition-colors duration-200 hover:text-white"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          ref={lineRef}
          className="mt-16 flex flex-col items-center justify-center gap-3 border-t border-white/[0.08] pt-8 text-center text-sm text-white/30"
        >
          <span>Feito pela Estus Corporation.</span>
        </div>
      </motion.div>
    </footer>
  );
}
