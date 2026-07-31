"use client";

import React, { useState } from "react";

// Navegacao. Uma ancora por secao real da pagina, na mesma ordem em que elas
// aparecem ao rolar: Recursos, Integracoes, Interface (o showcase da
// dashboard), Depoimentos e Precos. As antigas "Como funciona" e
// "Demonstracao" sairam com a secao que elas linkavam.
const navLinksData = [
  { label: "Recursos", href: "#recursos" },
  { label: "Integrações", href: "#integracoes" },
  { label: "Interface", href: "#interface" },
  { label: "Depoimentos", href: "#depoimentos" },
  { label: "Preços", href: "#precos" },
];

const AnimatedNavLink = ({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) => (
  <a
    href={href}
    className="group relative inline-block h-5 overflow-hidden text-sm"
  >
    <div className="flex flex-col transition-transform duration-300 ease-out group-hover:-translate-y-1/2">
      <span className="text-white/60">{children}</span>
      <span className="text-white">{children}</span>
    </div>
  </a>
);

const Logo = () => (
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
);

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  const signupButton = (
    <a
      href="#precos"
      className="block w-full rounded-full bg-[#FAFAFA] px-6 py-2.5 text-center text-sm font-semibold text-ink-950 transition-colors duration-200 hover:bg-white sm:w-auto"
    >
      Começar agora
    </a>
  );

  return (
    <header
      // Cartao de vidro fixo. Radius um pouco maior (rounded-3xl) que antes.
      // Vidro LEVE de proposito: fundo bem mais translucido (/16 em vez de
      // /40) e blur reduzido (lg em vez de 2xl), entao o vidro fica sutil,
      // quase so uma sugestao, em vez do efeito pesado de antes. A linha de
      // luz interna no topo (refracao da borda) continua, e e o que mantem a
      // leitura de "vidro" mesmo com o blur baixo. Largura reduzida (5xl em
      // vez de 6xl) deixa a barra mais compacta.
      className="glass-surface fixed left-1/2 top-5 z-50 flex w-[calc(100%-2rem)] max-w-5xl -translate-x-1/2 flex-col items-center rounded-3xl border border-white/[0.1] bg-ink-900/16 px-6 py-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.14),inset_0_-1px_0_rgba(255,255,255,0.03),0_18px_50px_-16px_rgba(0,0,0,0.65)] backdrop-blur-lg backdrop-saturate-125"
    >
      <div className="flex w-full items-center justify-between gap-x-8 sm:gap-x-12">
        <Logo />

        <nav className="hidden items-center gap-x-7 lg:flex">
          {navLinksData.map((link) => (
            <AnimatedNavLink key={link.href} href={link.href}>
              {link.label}
            </AnimatedNavLink>
          ))}
        </nav>

        <div className="hidden items-center lg:flex">{signupButton}</div>

        <button
          className="flex h-8 w-8 cursor-pointer items-center justify-center text-white/70 transition-colors hover:text-white lg:hidden"
          onClick={() => setIsOpen((v) => !v)}
          aria-expanded={isOpen}
          aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 7h16M4 12h16M4 17h16"}
            />
          </svg>
        </button>
      </div>

      <div
        className={`flex w-full flex-col items-center overflow-hidden transition-all duration-300 lg:hidden ${
          isOpen
            ? "max-h-[420px] pt-5 opacity-100"
            : "pointer-events-none max-h-0 pt-0 opacity-0"
        }`}
      >
        <nav className="flex w-full flex-col items-center gap-4">
          {navLinksData.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="w-full text-center text-sm text-white/70 transition-colors hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className="mt-5 w-full">{signupButton}</div>
      </div>
    </header>
  );
}
