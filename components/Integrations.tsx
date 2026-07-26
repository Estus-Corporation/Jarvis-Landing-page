"use client";

import React, { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";

// Estilo novo desta secao.
//
// Antes: duas grades de cartoes iguais, um por app, com o rotulo impresso
// embaixo de cada logo. Lia como catalogo estatico e repetia o mesmo layout de
// grade que a pagina ja usa em outros lugares.
//
// Agora: os logos correm em duas esteiras, em sentidos opostos, e o rotulo saiu
// de dentro de cada cartao. Ele passou a viver numa legenda unica embaixo, que
// troca conforme o app apontado. Ganhos: a secao ganha movimento continuo (o
// agente alcancando coisa o tempo todo), o bloco fica muito mais leve de ler, e
// a informacao de "o que ele faz com esse app" continua toda na pagina.
//
// A esteira PARA no hover, entao o alvo nunca foge do cursor.
type Integration = { name: string; label: string; src: string };

const rowOne: Integration[] = [
  { name: "Spotify", label: "Toca no aparelho que você pedir", src: "/brands/spotify.svg" },
  { name: "YouTube", label: "Pausa e comanda o vídeo no Chrome", src: "/brands/youtube.svg" },
  { name: "Chrome", label: "Navega, abre abas e busca por você", src: "/brands/google-chrome.svg" },
  { name: "Google", label: "Pesquisa na web em tempo real", src: "/brands/google.svg" },
  { name: "GitHub", label: "Clona repositórios e roda Git", src: "/brands/github.svg" },
];

const rowTwo: Integration[] = [
  { name: "WhatsApp", label: "Envia mensagens ditadas por você", src: "/brands/whatsapp.svg" },
  { name: "Steam", label: "Detecta o jogo em execução", src: "/brands/steam.svg" },
  { name: "PowerShell", label: "Executa comandos de terminal", src: "/brands/powershell.svg" },
  { name: "Windows", label: "Abre e fecha programas", src: "/brands/windows.svg" },
];

const brains: Integration[] = [
  { name: "OpenAI", label: "Interpreta o que você pede", src: "/brands/openai.svg" },
  { name: "ElevenLabs", label: "Devolve a resposta na sua voz", src: "/brands/elevenlabs.svg" },
];

const ALL = [...rowOne, ...rowTwo];

function Chip({
  item,
  active,
  onFocusItem,
  clone = false,
}: {
  item: Integration;
  active: boolean;
  onFocusItem: (item: Integration) => void;
  clone?: boolean;
}) {
  return (
    <button
      type="button"
      onMouseEnter={() => onFocusItem(item)}
      onFocus={() => onFocusItem(item)}
      // As copias da segunda metade saem da ordem de tabulacao. Sem isso o
      // teclado pararia num botao dentro de uma area aria-hidden, que e foco
      // preso em conteudo que o leitor de tela nao anuncia.
      tabIndex={clone ? -1 : undefined}
      aria-hidden={clone || undefined}
      // O botao existe para o teclado tambem: quem navega por Tab percorre os
      // apps e a legenda acompanha, sem depender de mouse.
      aria-label={`${item.name}: ${item.label}`}
      className={`group flex h-[74px] w-[184px] shrink-0 cursor-pointer items-center justify-center gap-3 rounded-chip border px-5 transition-colors duration-300 ${
        active
          ? "border-white/30 bg-ink-700"
          : "border-white/[0.08] bg-ink-800/60 hover:border-white/25 hover:bg-ink-700"
      }`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={item.src}
        alt=""
        width={28}
        height={28}
        aria-hidden
        className={`h-7 w-7 shrink-0 brightness-0 invert transition-opacity duration-300 ${
          active ? "opacity-100" : "opacity-60 group-hover:opacity-100"
        }`}
      />
      <span
        className={`truncate text-sm transition-colors duration-300 ${
          active ? "text-[#FAFAFA]" : "text-white/60 group-hover:text-[#FAFAFA]"
        }`}
      >
        {item.name}
      </span>
    </button>
  );
}

function Track({
  items,
  direction,
  activeName,
  onFocusItem,
}: {
  items: Integration[];
  direction: "left" | "right";
  activeName: string;
  onFocusItem: (item: Integration) => void;
}) {
  // A trilha e composta por DUAS METADES IDENTICAS e a animacao anda -50%,
  // ou seja, exatamente uma metade. No fim do ciclo a segunda metade esta onde
  // a primeira comecou e o corte fica invisivel.
  //
  // Cada metade repete a lista REPEAT vezes por um motivo pratico: com uma
  // copia so, cinco chips dao cerca de 940px, e num monitor de 1920px a metade
  // seria mais estreita que a tela, abrindo um vao vazio a cada volta. Tres
  // copias levam cada metade a ~2800px, que cobre telas largas com folga.
  const REPEAT = 3;
  const half = Array.from({ length: REPEAT }, (_, r) =>
    items.map((item) => ({ item, key: `${r}-${item.name}` }))
  ).flat();

  // Nada de `gap` aqui de proposito. Com gap, N itens somam N*larg + (N-1)*gap,
  // e metade disso nao cai num limite de item: sobra um gap e o loop da um
  // pulinho a cada volta. Com margem direita fixa cada item ocupa exatamente
  // larg+margem, entao -50% cai sempre no mesmo ponto do ciclo.
  return (
    <div className="group/track flex overflow-hidden">
      <div
        className={`flex shrink-0 ${
          direction === "left"
            ? "animate-marquee-left"
            : "animate-marquee-right"
        } group-hover/track:[animation-play-state:paused]`}
      >
        {half.map(({ item, key }) => (
          <div key={key} className="mr-3 shrink-0">
            <Chip
              item={item}
              active={activeName === item.name}
              onFocusItem={onFocusItem}
            />
          </div>
        ))}
        {/* Segunda metade: puramente visual. Fica fora da arvore de
            acessibilidade para o leitor de tela nao anunciar os mesmos apps
            varias vezes. */}
        {half.map(({ item, key }) => (
          <div key={`dup-${key}`} className="mr-3 shrink-0" aria-hidden>
            <Chip
              item={item}
              active={activeName === item.name}
              onFocusItem={onFocusItem}
              clone
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Integrations() {
  const reduce = useReducedMotion();
  // A legenda nunca fica vazia: ela nasce no primeiro app e troca conforme o
  // ponteiro ou o foco anda. Em touch, onde nao existe hover, o visitante ainda
  // ve um par nome/acao completo.
  const [active, setActive] = useState<Integration>(rowOne[0]);
  const handleFocusItem = React.useCallback(
    (item: Integration) => setActive(item),
    []
  );

  return (
    <section id="integracoes" className="relative overflow-hidden bg-ink-900 px-6 py-28 sm:py-36">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.045) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage:
              "radial-gradient(ellipse 75% 55% at 50% 0%, #000 30%, transparent 100%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 75% 55% at 50% 0%, #000 30%, transparent 100%)",
          }}
        />
        <div className="absolute left-1/2 top-0 h-[440px] w-[880px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-white/[0.05] blur-[130px]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      </div>

      <div className="relative mx-auto max-w-shell">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-white/35">
            Integrações
          </span>
          <h2 className="mt-4 text-balance text-3xl font-semibold tracking-[-0.02em] text-[#FAFAFA] sm:text-5xl">
            Ele já fala com os seus apps.
          </h2>
          <p className="mx-auto mt-5 max-w-[52ch] text-lg font-light leading-relaxed text-white/55">
            Sem clicar, sem caçar janela. Você diz o que quer e o Jarvis aciona
            o app certo, no aparelho certo, na hora.
          </p>
        </motion.div>

        {/* Esteiras. Sangram para fora do container e recebem mascara nas
            pontas, entao os chips entram e saem de cena em vez de aparecerem
            cortados na borda. */}
        <motion.div
          initial={reduce ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative mt-16 flex flex-col gap-3"
          style={{
            maskImage:
              "linear-gradient(to right, transparent, #000 8%, #000 92%, transparent)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent, #000 8%, #000 92%, transparent)",
          }}
        >
          {reduce ? (
            // Sem movimento: as esteiras viram uma grade estatica, com todos os
            // apps visiveis de uma vez.
            <div className="flex flex-wrap justify-center gap-3">
              {ALL.map((item) => (
                <Chip
                  key={item.name}
                  item={item}
                  active={active.name === item.name}
                  onFocusItem={handleFocusItem}
                />
              ))}
            </div>
          ) : (
            <>
              <Track
                items={rowOne}
                direction="left"
                activeName={active.name}
                onFocusItem={handleFocusItem}
              />
              <Track
                items={rowTwo}
                direction="right"
                activeName={active.name}
                onFocusItem={handleFocusItem}
              />
            </>
          )}
        </motion.div>

        {/* Legenda viva. min-h fixo: sem isso a caixa pula de altura quando a
            frase troca por uma de comprimento diferente. */}
        <div className="mt-10 flex min-h-[3.25rem] items-center justify-center px-4">
          <AnimatePresence mode="wait">
            <motion.p
              key={active.name}
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
              className="text-center text-lg font-light text-white/60"
              aria-live="polite"
            >
              <span className="font-medium text-[#FAFAFA]">{active.name}</span>{" "}
              {active.label.charAt(0).toLowerCase() + active.label.slice(1)}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* O cerebro e a voz. Dois itens, tratamento proprio: cartoes largos em
            duas colunas, deliberadamente diferentes dos chips que correm acima,
            porque aqui nao e mais "no que ele mexe" e sim "o que o move". */}
        <div className="mt-20">
          <h3 className="text-center text-sm font-medium uppercase tracking-[0.15em] text-white/35">
            O cérebro e a voz por trás
          </h3>
          <div className="mx-auto mt-7 grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-2">
            {brains.map((item, i) => (
              <motion.div
                key={item.name}
                initial={reduce ? false : { opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{
                  duration: 0.6,
                  delay: reduce ? 0 : i * 0.09,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="group relative flex items-center gap-5 overflow-hidden rounded-card border border-white/[0.08] bg-ink-800/60 px-7 py-7 transition-colors duration-300 hover:border-white/25 hover:bg-ink-700"
              >
                <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.src}
                  alt=""
                  width={40}
                  height={40}
                  aria-hidden
                  className="h-10 w-10 shrink-0 opacity-70 brightness-0 invert transition-opacity duration-300 group-hover:opacity-100"
                />
                <div className="min-w-0">
                  <p className="text-base font-medium text-[#FAFAFA]">
                    {item.name}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-white/45">
                    {item.label}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
