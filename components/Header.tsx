"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

// Navegacao. Uma ancora por secao real da pagina, na mesma ordem em que elas
// aparecem ao rolar: Recursos, Interface (o showcase da dashboard),
// Organizacao (tarefas/agenda/lembretes), Futuro (spoilers de atualizacoes),
// Depoimentos e Precos. As antigas "Como funciona" e "Demonstracao" sairam com
// a secao que elas linkavam, e "Integracoes" virou "Organizacao" quando aquela
// secao trocou de assunto (as integracoes agora moram em "Recursos").
const navLinksData = [
  { label: "Recursos", href: "#recursos" },
  { label: "Interface", href: "#interface" },
  { label: "Organização", href: "#organizacao" },
  { label: "Futuro", href: "#futuro" },
  { label: "Depoimentos", href: "#depoimentos" },
  { label: "Preços", href: "#precos" },
];

// Indicador da secao ativa: uma linha fina embaixo do link, nao mais o
// fundo em pilula. Continua o mesmo truque do AnimatedTabs (layoutId
// compartilhado + spring) pra deslizar de um link pro outro, com initial/
// exit de opacidade pra suavizar as duas pontas sem instancia anterior
// (saindo da Hero, onde nenhum link esta ativo, e voltando pra ela).
// Sem hover de crescer aqui — isso ficou so pro "Comecar agora"; aqui e so
// a cor do texto clareando.
const AnimatedNavLink = ({
  href,
  isActive,
  children,
}: {
  href: string;
  isActive: boolean;
  children: React.ReactNode;
}) => (
  <a
    href={href}
    className={cn(
      "relative inline-flex items-center px-3 py-1.5 text-sm transition-colors duration-200 ease-out",
      isActive ? "text-white" : "text-white/60 hover:text-white"
    )}
  >
    <span className="relative z-10 inline-block">
      {children}
      <AnimatePresence>
        {isActive && (
          <motion.span
            layoutId="nav-active-underline"
            className="absolute inset-x-0 -bottom-2 h-[2px] rounded-full bg-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              layout: { type: "spring", bounce: 0.2, duration: 0.6 },
              opacity: { duration: 0.25, ease: "easeOut" },
            }}
          />
        )}
      </AnimatePresence>
    </span>
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
  // Nenhum link comeca ativo: a Hero (#top) e a primeira coisa na tela, e
  // ela nao tem link correspondente no menu, entao nada deve acender ate a
  // pessoa rolar ate a primeira secao de verdade.
  const [activeHref, setActiveHref] = useState<string | null>(null);

  // Observa a Hero (#top) + as seis secoes (mesmos ids dos hrefs) e troca o
  // link ativo conforme cada uma cruza uma faixa perto do topo da tela — nao
  // quando ocupa mais area visivel, o que faria o destaque trocar tarde
  // demais em secoes bem altas. Enquanto #top e quem esta cruzando a faixa,
  // activeHref volta a null: nenhum botao do menu selecionado na Hero.
  useEffect(() => {
    const hero = document.getElementById("top");
    const sections = navLinksData
      .map((link) => document.querySelector(link.href))
      .filter((el): el is Element => el !== null);

    const watched = hero ? [hero, ...sections] : sections;
    if (watched.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          setActiveHref(entry.target.id === "top" ? null : `#${entry.target.id}`);
        });
      },
      { rootMargin: "-15% 0px -70% 0px", threshold: 0 }
    );

    watched.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  // Hover minimo, igual ao CTA da Hero: so levanta 2px e o fundo clareia.
  // Sem mola e sem brilho/sombra no hover (ambos rejeitados).
  const signupButton = (
    <a
      href="#precos"
      className="block w-full rounded-full bg-[#FAFAFA] px-6 py-2.5 text-center text-sm font-semibold text-ink-950 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-white active:translate-y-0 active:scale-[0.97] sm:w-auto"
    >
      Começar agora
    </a>
  );

  return (
    <header
      // Cartao de vidro fixo, radius rounded-3xl. O que passa atras (Hero,
      // particulas, gradientes) sai REFRATADO — nao so borrado — igual ao
      // "Liquid Glass" (Apple) e as listras curvando na imagem de referencia
      // do pedido. Blur baixo de proposito (14px, nao 28+): blur forte demais
      // esconde a curvatura, que e o efeito que da o nome "liquid" — aqui
      // quem carrega o "vidro" e a distorcao (feDisplacementMap scale 42), o
      // blur so amacia. baseFrequency baixo (0.006-0.01) da onda GRANDE e
      // suave — "liquida" — em vez da estatica fina de frequencia alta. A
      // curvatura vem do filtro SVG #header-liquid-glass logo abaixo:
      // feTurbulence gera um mapa de ruido, feGaussianBlur suaviza (ruido cru
      // deixa a distorcao granulada em vez de "liquida"), feDisplacementMap
      // usa esse ruido pra empurrar cada pixel do fundo pro lado — SEM afetar
      // o conteudo do proprio header (logo, nav, botao), que fica em cima do
      // backdrop-filter, nao dentro dele.
      // Suporte: Chrome/Edge/Firefox aplicam o filtro completo (blur + url()
      // de refracao). Safari tem suporte instavel pra filtro SVG referenciado
      // dentro de backdrop-filter, entao a versao prefixada (-webkit-) so leva
      // blur+saturacao, sem o url() — cai pro vidro forte sem a curvatura em
      // vez de quebrar.
      //
      // O aro de luz (proximo <div>, mask-composite: exclude — mesma tecnica
      // do brilho do botao Mensal em Pricing.tsx) e o sheen no topo (o <div>
      // depois) substituem a borda lisa de antes: vidro de verdade nao tem
      // contorno solido uniforme, tem luz pegando mais forte no topo/bordas
      // e quase nada no meio — e o que da o "brilho de vidro" da Apple.
      className="glass-surface fixed left-1/2 top-5 z-50 flex w-[calc(100%-2rem)] max-w-5xl -translate-x-1/2 flex-col items-center rounded-3xl bg-ink-900/20 px-6 py-3.5 shadow-[0_18px_50px_-16px_rgba(0,0,0,0.65)]"
      style={{
        backdropFilter:
          "blur(14px) saturate(1.9) brightness(1.05) url(#header-liquid-glass)",
        WebkitBackdropFilter: "blur(14px) saturate(1.9) brightness(1.05)",
      }}
    >
      <svg aria-hidden className="absolute h-0 w-0 overflow-hidden">
        <filter
          id="header-liquid-glass"
          x="-20%"
          y="-20%"
          width="140%"
          height="140%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.007 0.011"
            numOctaves={3}
            seed={9}
            result="noise"
          />
          <feGaussianBlur in="noise" stdDeviation={6} result="softNoise" />
          <feDisplacementMap
            in="SourceGraphic"
            in2="softNoise"
            scale={42}
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </svg>

      {/* Aro: 1px de luz que envolve a pilula inteira, forte no topo e
          esmaecendo pros lados/embaixo — nao uma borda solida. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit]"
        style={{
          padding: 1,
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.75) 0%, rgba(255,255,255,0.16) 30%, rgba(255,255,255,0.05) 55%, rgba(255,255,255,0.2) 100%)",
          WebkitMask:
            "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          WebkitMaskComposite: "xor",
          mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          maskComposite: "exclude",
        }}
      />

      {/* Sheen: luz ambiente batendo de cima, mais clara perto do topo. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit]"
        style={{
          background:
            "radial-gradient(130% 80% at 50% -30%, rgba(255,255,255,0.22), transparent 55%)",
        }}
      />

      <div className="relative z-10 flex w-full items-center justify-between gap-x-8 sm:gap-x-12">
        <Logo />

        <nav className="hidden items-center gap-x-1 lg:flex">
          {navLinksData.map((link) => (
            <AnimatedNavLink
              key={link.href}
              href={link.href}
              isActive={activeHref === link.href}
            >
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
        className={`relative z-10 flex w-full flex-col items-center overflow-hidden transition-all duration-300 lg:hidden ${
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
