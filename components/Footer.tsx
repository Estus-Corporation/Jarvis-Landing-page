"use client";

import React from "react";
import { motion } from "motion/react";
import { useReducedMotionSafe } from "@/components/ui/use-reduced-motion-safe";
import {
  GithubLogo,
  XLogo,
  InstagramLogo,
  LinkedinLogo,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";

const footerLinks = [
  {
    title: "Produto",
    links: [
      { label: "Recursos", href: "#recursos" },
      { label: "Integrações", href: "#integracoes" },
      { label: "Interface", href: "#interface" },
      { label: "Depoimentos", href: "#depoimentos" },
      { label: "Preços", href: "#precos" },
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

const socialLinks: { icon: Icon; href: string; label: string }[] = [
  { icon: GithubLogo, href: "#", label: "GitHub" },
  { icon: XLogo, href: "#", label: "X" },
  { icon: InstagramLogo, href: "#", label: "Instagram" },
  { icon: LinkedinLogo, href: "#", label: "LinkedIn" },
];

export default function Footer() {
  const year = new Date().getFullYear();
  const reduce = useReducedMotionSafe();

  // Era o unico bloco da pagina sem entrada por scroll: todo o resto ja
  // aparece com fade+subida ao entrar na tela, e o rodape so surgia estatico.
  // ink-900, nao ink-950: a secao anterior (Precos) ja e ink-950. Antes havia
  // o fechamento (CTA) em ink-900 entre as duas, dando a costura visual; sem
  // ele, o rodape precisa ser quem quebra a cor.
  return (
    <footer className="relative overflow-hidden border-t border-white/[0.08] bg-ink-900 px-6 py-16 sm:py-20 lg:px-10 wide:px-16">
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
          className="inline-block whitespace-nowrap font-sans font-bold uppercase leading-none text-transparent"
          style={{
            WebkitTextStroke: "1px rgba(255,255,255,0.1)",
            fontSize: "clamp(8rem, 22vw, 22rem)",
            letterSpacing: "0.02em",
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
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
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
                    aria-label={social.label}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/50 transition-colors duration-200 hover:border-white/30 hover:bg-white/[0.06] hover:text-white"
                  >
                    <Glyph size={16} weight="light" aria-hidden />
                  </a>
                );
              })}
            </div>
          </div>

          {footerLinks.map((group) => (
            <div key={group.title}>
              <h3 className="text-sm font-medium text-white/40">
                {group.title}
              </h3>
              <ul className="mt-5 flex flex-col gap-3">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-white/60 transition-colors duration-200 hover:text-white"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col justify-between gap-3 border-t border-white/[0.08] pt-8 text-sm text-white/30 sm:flex-row">
          <span>© {year} Jarvis. Todos os direitos reservados.</span>
          <span>Feito pela Estus Corporation.</span>
        </div>
      </motion.div>
    </footer>
  );
}
