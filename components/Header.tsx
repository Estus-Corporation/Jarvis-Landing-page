"use client";

import React, { useEffect, useRef, useState } from "react";

// Rotulos de navegacao e ancoras preservados do layout anterior: mudar slug
// quebra link salvo e memoria muscular de quem ja conhece a pagina.
const navLinksData = [
  { label: "Recursos", href: "#recursos" },
  { label: "Como funciona", href: "#como-funciona" },
  { label: "Demonstração", href: "#demo" },
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
  const [shapeClass, setShapeClass] = useState("rounded-full");
  const shapeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (shapeTimeout.current) clearTimeout(shapeTimeout.current);
    if (isOpen) {
      setShapeClass("rounded-card");
    } else {
      shapeTimeout.current = setTimeout(() => setShapeClass("rounded-full"), 300);
    }
    return () => {
      if (shapeTimeout.current) clearTimeout(shapeTimeout.current);
    };
  }, [isOpen]);

  const signupButton = (
    <a
      href="#precos"
      className="block w-full rounded-full bg-[#FAFAFA] px-4 py-1.5 text-center text-sm font-semibold text-ink-950 transition-colors duration-200 hover:bg-white sm:w-auto"
    >
      Começar agora
    </a>
  );

  return (
    <header
      className={`fixed left-1/2 top-5 z-50 flex w-[calc(100%-2rem)] -translate-x-1/2 flex-col items-center border border-white/10 bg-ink-900/70 px-5 py-2.5 backdrop-blur-xl transition-[border-radius] duration-300 sm:w-auto ${shapeClass}`}
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
          className="flex h-8 w-8 items-center justify-center text-white/70 lg:hidden"
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
