"use client";

import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { useLenis } from "lenis/react";
import {
  CheckCircle,
  ShieldCheck,
  CursorClick,
  ArrowRight,
  GithubLogo,
  Seal,
} from "@phosphor-icons/react/dist/ssr";
import { useReducedMotionSafe } from "@/components/ui/use-reduced-motion-safe";

// POPUP DEPOIS DO "BAIXAR GRATIS" (pedido do usuario, 01/10/2026).
//
// O instalador ainda NAO tem assinatura de codigo (code signing) — ver
// DISTRIBUICAO-EXE.md no Project-Jarvis: o certificado que funciona a partir
// do Brasil custa ~US$250-400/ano e a decisao foi lancar sem ele. Resultado:
// TODO mundo que abre o Jarvis-Setup.exe ve a tela azul "O Windows protegeu o
// computador", com o botao de executar escondido atras de "Mais informacoes".
// Quem nao espera por isso acha que baixou virus e desiste.
//
// Este popup abre JUNTO com o download (o link continua sendo o <a href> do
// instalador; o clique so abre isto por cima) e existe pra ser lido num
// relance: a miniatura da propria tela do Windows, com os 2 cliques marcados
// em ordem, e uma explicacao curta e honesta do porque.
//
// A miniatura usa o AZUL do SmartScreen de proposito — a unica cor fora do
// preto-e-branco do site. A pessoa tem que RECONHECER a tela quando ela
// aparecer, e a tela real e azul; uma versao cinza nao seria reconhecida.
//
// Textos da tela copiados do SmartScreen em portugues (Windows 10/11). Nao
// prometer que o aviso "some na hora" com a assinatura: certificado novo
// tambem precisa acumular reputacao (ver o mesmo documento).

const EASE = [0.16, 1, 0.3, 1] as const;
const SMARTSCREEN_BLUE = "#0f5ea8";

// Miniatura da tela do SmartScreen. `step` 1 = primeira tela (o link "Mais
// informacoes" em destaque); 2 = depois de clicar nele (aparecem aplicativo,
// editor e o botao "Executar assim mesmo", em destaque).
function SmartScreenMock({ step }: { step: 1 | 2 }) {
  return (
    <div
      aria-hidden
      className="relative flex h-full flex-col px-4 pb-3.5 pt-4 text-left text-white"
      style={{ background: SMARTSCREEN_BLUE }}
    >
      <p className="text-[15px] font-light leading-tight">O Windows protegeu o computador</p>
      <p className="mt-2 text-[9.5px] leading-snug text-white/85">
        O Microsoft Defender SmartScreen impediu a inicialização de um aplicativo não
        reconhecido. A execução desse aplicativo pode colocar seu computador em risco.
      </p>

      {step === 1 ? (
        <span className="relative mt-2 self-start text-[9.5px] font-semibold underline underline-offset-2">
          Mais informações
          <Highlight />
        </span>
      ) : (
        <div className="mt-2 space-y-0.5 text-[9.5px] text-white/85">
          <p>
            Aplicativo: <span className="text-white">Jarvis-Setup.exe</span>
          </p>
          <p>
            Editor: <span className="text-white">Editor desconhecido</span>
          </p>
        </div>
      )}

      <div className="mt-auto flex justify-end gap-1.5 pt-5 sm:pt-3">
        {step === 2 && (
          <span className="relative border border-white/80 px-2 py-1 text-[9px] font-medium">
            Executar assim mesmo
            <Highlight />
          </span>
        )}
        <span className="border border-white/40 px-2 py-1 text-[9px] text-white/80">
          Não executar
        </span>
      </div>
    </div>
  );
}

// Anel branco pulsando em volta do que tem que ser clicado. O ponteiro do
// mouse no canto completa a leitura "clique aqui" sem precisar de texto.
function Highlight() {
  return (
    <>
      {/* Pulso so de brilho (opacidade), sem crescer: o `animate-ping` do
          Tailwind dobrava o tamanho do anel e virava um retangulo enorme. */}
      <span className="pointer-events-none absolute -inset-1.5 animate-pulse rounded-[3px] border-2 border-white shadow-[0_0_14px_rgba(255,255,255,0.75)]" />
      <CursorClick
        size={18}
        weight="fill"
        className="pointer-events-none absolute -bottom-4 -right-3 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]"
      />
    </>
  );
}

function StepCard({ n, title, children }: { n: number; title: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex flex-col">
      {/* min-h: "Executar assim mesmo" quebra em duas linhas no desktop;
          sem a reserva, a miniatura do passo 2 descia e desalinhava da 1. */}
      <div className="mb-3 flex items-center gap-2.5 sm:min-h-[2.75rem]">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#FAFAFA] font-mono text-sm font-bold text-ink-950">
          {n}
        </span>
        <p className="text-sm font-semibold text-[#FAFAFA] sm:text-[15px]">{title}</p>
      </div>
      {/* Moldura de "janela": a miniatura em proporcao fixa, igual nas duas. */}
      <div className="overflow-hidden rounded-lg border border-white/15 shadow-[0_18px_40px_-18px_rgba(0,0,0,0.9)]">
        {/* Proporcao fixa so lado a lado (as duas iguais); no celular, uma
            embaixo da outra, a altura e a do conteudo — 4/3 sobrava vazio. */}
        <div className="sm:aspect-[4/3]">{children}</div>
      </div>
    </div>
  );
}

export default function SmartScreenNotice({
  open,
  onClose,
  downloadUrl,
}: {
  open: boolean;
  onClose: () => void;
  downloadUrl: string;
}) {
  const reduce = useReducedMotionSafe();
  const lenis = useLenis();
  const okRef = useRef<HTMLButtonElement>(null);

  // SO FECHA NO "ENTENDI" (pedido do usuario, 01/10/2026): sem X, sem clique
  // no fundo e sem Esc. A ideia e que ninguem descarte o aviso sem querer e
  // depois se assuste com a tela do Windows. O foco vai direto pro botao, entao
  // pelo teclado basta um Enter.
  //
  // Mesma trava de rolagem do lightbox de Showcase.tsx: o Lenis tem loop
  // proprio (overflow hidden nao o alcanca), e o overflow cobre o resto.
  useEffect(() => {
    if (!open) return;
    lenis?.stop();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    okRef.current?.focus({ preventScroll: true });
    return () => {
      lenis?.start();
      document.body.style.overflow = previous;
    };
  }, [open, lenis]);

  // Portal so depois de montar: no servidor nao existe `document.body`.
  const [mounted, setMounted] = React.useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduce ? undefined : { opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-sm sm:items-center sm:p-6"
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="smartscreen-title"
            initial={reduce ? false : { opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? undefined : { opacity: 0, y: 8, scale: 0.99 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="relative my-auto w-full max-w-[640px] rounded-[22px] border border-white/[0.12] bg-ink-900 p-6 shadow-[0_40px_120px_-30px_rgba(0,0,0,0.95)] sm:p-8"
          >
            {/* 1. Confirmacao: o download ja comecou. */}
            <p className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.04] px-3 py-1 text-xs font-medium text-white/75">
              <CheckCircle size={14} weight="fill" aria-hidden className="text-white" />
              Seu download começou
            </p>

            {/* 2. A mensagem principal, pra quem so le o titulo. */}
            <h2
              id="smartscreen-title"
              className="mt-4 text-[1.5rem] font-semibold leading-tight tracking-[-0.02em] text-[#FAFAFA] sm:text-[1.75rem]"
            >
              O Windows vai mostrar um aviso.
              <span className="block text-white/55">Pode ficar tranquilo, é normal.</span>
            </h2>

            {/* 3. O que fazer: a tela de verdade, com os 2 cliques. */}
            <div className="mt-6 grid gap-5 sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:gap-3">
              <StepCard n={1} title={<>Clique em <span className="underline underline-offset-2">Mais informações</span></>}>
                <SmartScreenMock step={1} />
              </StepCard>
              <ArrowRight
                size={22}
                weight="bold"
                aria-hidden
                className="mx-auto hidden text-white/35 sm:mt-10 sm:block"
              />
              <StepCard n={2} title={<>Clique em <span className="underline underline-offset-2">Executar assim mesmo</span></>}>
                <SmartScreenMock step={2} />
              </StepCard>
            </div>

            {/* 4. Por que acontece + por que e seguro. */}
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
                <p className="flex items-center gap-2 text-sm font-semibold text-[#FAFAFA]">
                  <Seal size={17} weight="light" aria-hidden className="shrink-0 text-white/70" />
                  Por que aparece?
                </p>
                <p className="mt-1.5 text-[13px] leading-relaxed text-white/55">
                  O Jarvis está em lançamento e ainda não tem o certificado de assinatura digital
                  da Microsoft, que custa caro. Por isso o Windows mostra &quot;Editor
                  desconhecido&quot;. Assim que juntarmos o valor, o desenvolvedor passa a ser
                  reconhecido e o aviso deixa de aparecer.
                </p>
              </div>
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
                <p className="flex items-center gap-2 text-sm font-semibold text-[#FAFAFA]">
                  <ShieldCheck size={17} weight="light" aria-hidden className="shrink-0 text-white/70" />
                  É seguro?
                </p>
                <p className="mt-1.5 text-[13px] leading-relaxed text-white/55">
                  Sim. O aviso não quer dizer que o arquivo tem problema, só que o Windows ainda
                  não conhece o editor. O instalador vem direto do repositório oficial do Jarvis no
                  GitHub.
                </p>
              </div>
            </div>

            {/* 5. Saida. */}
            <div className="mt-6 flex flex-col-reverse items-center gap-3 sm:flex-row sm:justify-between">
              <a
                href={downloadUrl}
                className="inline-flex items-center gap-1.5 text-xs text-white/45 underline-offset-2 transition-colors hover:text-white hover:underline"
              >
                <GithubLogo size={14} aria-hidden />
                O download não começou? Baixar de novo
              </a>
              <button
                ref={okRef}
                type="button"
                onClick={onClose}
                className="w-full rounded-full bg-[#FAFAFA] px-8 py-3 text-sm font-semibold text-ink-950 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white active:translate-y-0 active:scale-[0.98] sm:w-auto"
              >
                Entendi
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
