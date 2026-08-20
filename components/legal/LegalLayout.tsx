import React from "react";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import Footer from "@/components/Footer";
import SectionEyebrow from "@/components/ui/section-eyebrow";

// Layout compartilhado das duas paginas legais (Termos de Uso, Politica de
// Privacidade). Nao reusa o <Header/> da home: aquele componente e fixo,
// pesado (glass + filtro SVG) e sua nav/scrollspy so faz sentido em cima das
// secoes da "/" — aqui o conteudo e um documento comprido, entao um cabecalho
// simples com "voltar" cobre a necessidade real (sair da pagina legal) sem
// herdar logica que nao se aplica.
export default function LegalLayout({
  eyebrow,
  title,
  updatedAt,
  children,
}: {
  eyebrow: string;
  title: string;
  updatedAt: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-[100dvh] bg-ink-950">
      <header className="border-b border-white/[0.08] px-6 py-6 lg:px-10 wide:px-16">
        <div className="mx-auto flex max-w-3xl items-center justify-between wide:max-w-shell">
          <a
            href="/#top"
            className="flex items-center gap-2.5 text-sm font-semibold tracking-[0.18em] text-white"
          >
            <div className="relative flex h-5 w-5 items-center justify-center">
              <span className="absolute left-1/2 top-0 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-white/90" />
              <span className="absolute left-0 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-white/90" />
              <span className="absolute right-0 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-white/90" />
              <span className="absolute bottom-0 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-white/90" />
            </div>
            JARVIS
          </a>
          <a
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-white/50 transition-colors hover:text-white"
          >
            <ArrowLeft size={15} weight="bold" aria-hidden />
            Voltar ao site
          </a>
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-6 py-16 sm:py-20 lg:px-10">
        <SectionEyebrow>{eyebrow}</SectionEyebrow>
        <h1 className="mt-5 font-display text-3xl font-semibold tracking-[-0.02em] text-[#FAFAFA] sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 text-sm text-white/40">
          Última atualização: {updatedAt}
        </p>

        {/* prose "na mao": sem plugin de tipografia no projeto (ver
            tailwind.config.ts), entao os elementos do conteudo (h2, p, li,
            strong, a) ganham estilo aqui mesmo, no espirito monocromatico do
            resto do site — sem cor de acento, hierarquia por peso/opacidade. */}
        <div
          className="
            mt-10 space-y-5 text-[15px] leading-relaxed text-white/60
            [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:tracking-[-0.01em] [&_h2]:text-[#FAFAFA]
            [&_h2:first-child]:mt-0
            [&_h3]:mt-6 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-white/85
            [&_p]:leading-relaxed
            [&_strong]:font-semibold [&_strong]:text-white/85
            [&_a]:text-white/80 [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-white
            [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5
            [&_li]:leading-relaxed
            [&_table]:w-full [&_table]:border-collapse [&_table]:text-sm
            [&_th]:border-b [&_th]:border-white/[0.12] [&_th]:py-2 [&_th]:pr-4 [&_th]:text-left [&_th]:font-semibold [&_th]:text-white/80
            [&_td]:border-b [&_td]:border-white/[0.06] [&_td]:py-2 [&_td]:pr-4 [&_td]:align-top
          "
        >
          {children}
        </div>
      </article>

      <Footer />
    </main>
  );
}
