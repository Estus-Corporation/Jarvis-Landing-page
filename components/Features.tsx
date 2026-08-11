"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useReducedMotionSafe } from "@/components/ui/use-reduced-motion-safe";
import {
  Keyboard,
  TextAa,
  SkipBack,
  SkipForward,
  Pause,
  SpeakerLow,
  Checks,
  MagnifyingGlass,
  Microphone,
  ArrowDown,
  FolderSimple,
  GitBranch,
  GitCommit,
  LockSimple,
  Heart,
  ShuffleAngular,
  Repeat,
  Broadcast,
  GlobeSimple,
  TrendUp,
  Cpu,
  HardDrive,
  WifiHigh,
  PaperPlaneTilt,
  Plus,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";
import SectionEyebrow from "@/components/ui/section-eyebrow";

// SECAO RECONSTRUIDA DO ZERO — antes era um bento grid de cartoes estaticos.
// Depois virou um console de comandos com 5 capacidades abstratas (memoria,
// voz, tom...). Esta e a 2a reconstrucao do miolo: esta secao passa a ser a
// vitrine REAL de integracoes/capacidades do Jarvis (a secao "Integracoes"
// mais abaixo na pagina sera remodelada depois) — por isso agora sao 7 apps/
// capacidades concretas, cada uma com o app real (logo) ou o icone da
// capacidade, em vez de conceitos genericos.
//
// Cada capacidade e uma cena de 3 atos, e os 3 atos sao BLOCOS IRMAOS dentro
// da janela do console — nao mais uma confirmacao escondida dentro de cada
// demo:
//   1. cartao "Usuário": o comando falado, grande o bastante pra ler sem
//      esforco;
//   2. a tela da acao: a demo, cada uma usando o espaco todo — nao so uma
//      amostra, o app inteiro (abas, barra de favoritos, fila de reproducao,
//      lista de arquivos alterados, paineis de sistema...);
//   3. cartao "Jarvis": a resposta, que so aparece depois que a acao termina
//      (ate la o cartao mostra os pontinhos de "pensando", entao a altura do
//      bloco nao muda no meio da cena).
// Mecanica de fora continua igual: lista de "comandos" selecionaveis a
// esquerda (com auto-play), janela de sistema simulada a direita.

type Kind =
  | "spotify"
  | "whatsapp"
  | "git"
  | "chrome"
  | "windows"
  | "type"
  | "screen";

type Cap = {
  id: string;
  tab: string;
  hint: string;
  brand?: string;
  icon?: Icon;
  command: string;
  // Resposta do Jarvis + quantos segundos ela espera antes de aparecer. O
  // atraso acompanha a duracao da animacao de cada demo, pra resposta cair
  // sempre DEPOIS da acao terminar (nunca antes, o que quebraria a leitura de
  // causa e efeito).
  reply: string;
  replyDelay: number;
  kind: Kind;
};

const CAPS: Cap[] = [
  {
    id: "spotify",
    tab: "Spotify",
    hint: "Toca, pausa e ajusta o volume das músicas",
    brand: "/brands/spotify.svg",
    command: "Jarvis, toca minha playlist de foco e abaixa um pouco o volume.",
    reply: "Tocando baixinho, do jeito que você pediu.",
    replyDelay: 2.3,
    kind: "spotify",
  },
  {
    id: "whatsapp",
    tab: "WhatsApp",
    hint: "Manda mensagens para os seus contatos salvos",
    brand: "/brands/whatsapp.svg",
    command: "Jarvis, diga ao Lucas que estarei lá em 15 minutos.",
    reply: "Avisei o Lucas que você chega em 15 minutos.",
    replyDelay: 2.8,
    kind: "whatsapp",
  },
  {
    id: "git",
    tab: "Git",
    hint: "Clona repositórios e executa comandos Git",
    brand: "/brands/git.svg",
    command: "Jarvis, clona esse repositório e sobe minhas alterações.",
    reply: "Prontinho, subi tudo pro GitHub em 3 commits.",
    replyDelay: 2.6,
    kind: "git",
  },
  {
    id: "chrome",
    tab: "Chrome",
    hint: "Navega, preenche formulários e pesquisa no Google",
    brand: "/brands/google-chrome.svg",
    command: "Jarvis, pesquisa o preço do dólar hoje.",
    reply: "O dólar está a R$ 5,42 hoje, alta de 0,3%.",
    replyDelay: 1.6,
    kind: "chrome",
  },
  {
    id: "windows",
    tab: "Windows",
    hint: "Abre programas, lê sua configuração e roda comandos",
    brand: "/brands/windows.svg",
    command: "Jarvis, fecha o Spotify e me diz quanta memória está livre.",
    reply: "Fechei o Spotify. Restam 9,2 GB de memória livre.",
    replyDelay: 2.1,
    kind: "windows",
  },
  {
    id: "type",
    tab: "Digita por você",
    hint: "Escreve no campo que você selecionar",
    icon: Keyboard,
    command: "Jarvis, me escreva uma receita de bolo completa no Word.",
    reply: "Pronto! Escrevi a receita completa no documento.",
    replyDelay: 2.7,
    kind: "type",
  },
  {
    id: "screen",
    tab: "Leitura de tela",
    hint: "Observa e analisa o que está na sua tela",
    icon: TextAa,
    command: "Jarvis, o que esse gráfico na tela está mostrando?",
    reply: "Achei um erro na linha 42: falta multiplicar pela quantidade.",
    replyDelay: 1.6,
    kind: "screen",
  },
];

const AUTOPLAY_MS = 5800;

// ---- Icone do botao: logo do app (svg de marca, sempre em branco sobre o
// chip escuro) ou icone Phosphor da capacidade (herda a cor do chip via
// currentColor). ---------------------------------------------------------
function CapGlyph({ cap }: { cap: Cap }) {
  if (cap.brand) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={cap.brand}
        alt=""
        width={24}
        height={24}
        aria-hidden
        className="h-6 w-6 brightness-0 invert"
      />
    );
  }
  const Glyph = cap.icon!;
  return <Glyph size={24} weight="light" aria-hidden />;
}

// ---- Marca de 4 pontos do Jarvis (mesma do header/footer), em miniatura:
// serve de "avatar" do cartao de resposta, do mesmo jeito que o microfone
// marca o cartao do usuario. ----------------------------------------------
function JarvisMark() {
  return (
    <span className="relative block h-3.5 w-3.5" aria-hidden>
      <span className="absolute left-1/2 top-0 h-1 w-1 -translate-x-1/2 rounded-full bg-white" />
      <span className="absolute left-0 top-1/2 h-1 w-1 -translate-y-1/2 rounded-full bg-white" />
      <span className="absolute right-0 top-1/2 h-1 w-1 -translate-y-1/2 rounded-full bg-white" />
      <span className="absolute bottom-0 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-white" />
    </span>
  );
}

// ---- Corpo do cartao "Jarvis": pontinhos de "pensando" enquanto a demo roda
// e a resposta quando ela termina. Remontado a cada capacidade (key no pai),
// entao o timer sempre recomeca junto com a cena. -------------------------
function JarvisReply({ text, delay }: { text: string; delay: number }) {
  const reduce = useReducedMotionSafe();
  const [answered, setAnswered] = useState(false);

  useEffect(() => {
    // Com "reduzir movimento" a resposta entra de imediato. Sem esse ramo o
    // componente ficaria preso nos pontinhos pra sempre: useReducedMotionSafe
    // devolve false no primeiro render e so vira true depois de montar, entao
    // o efeito roda de novo, limpa o timer e nunca marcaria a resposta.
    if (reduce) {
      setAnswered(true);
      return;
    }
    const t = setTimeout(() => setAnswered(true), delay * 1000);
    return () => clearTimeout(t);
  }, [reduce, delay]);

  if (!answered) {
    return (
      <span className="flex items-center gap-1.5" aria-hidden>
        <span className="h-2 w-2 animate-bounce rounded-full bg-white/35" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-white/35 [animation-delay:0.15s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-white/35 [animation-delay:0.3s]" />
      </span>
    );
  }

  return (
    <motion.p
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="text-lg leading-snug text-white/90 sm:text-xl"
    >
      {text}
    </motion.p>
  );
}

// ---- Mini estatistica quadrada, reaproveitada no painel do Windows. -------
function StatTile({
  icon: Glyph,
  label,
  value,
}: {
  icon: Icon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-chip border border-white/[0.08] bg-white/[0.02] py-2.5">
      <Glyph size={14} aria-hidden className="text-white/35" />
      <span className="text-[9px] uppercase tracking-[0.08em] text-white/30">{label}</span>
      <span className="text-xs font-medium text-white/80">{value}</span>
    </div>
  );
}

// ---- Visualizacoes por capacidade (o "miolo" da tela do console) ----------
// Cada uma usa o espaco inteiro da janela — chrome completo do app (abas,
// favoritos, paineis, listas), nao so um recorte — pra parecer uma gravacao
// de tela de verdade em vez de um resumo.

const UP_NEXT = [
  { title: "Chuva Leve", artist: "Ambient Mix" },
  { title: "Piano & Café", artist: "Foco Profundo" },
];

function SpotifyViz() {
  const bars = Array.from({ length: 5 });
  return (
    <div className="flex h-full flex-col gap-4 overflow-hidden rounded-xl border border-white/[0.08] bg-ink-950 p-6">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/35">
          Tocando agora
        </p>
        <span className="flex items-center gap-1.5 rounded-full border border-white/[0.1] bg-white/[0.04] px-2.5 py-1 text-[11px] text-white/45">
          <Broadcast size={12} aria-hidden />
          Alto-falantes da sala
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div
          className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-white/[0.12] shadow-[0_0_30px_-6px_rgba(255,255,255,0.25)]"
          style={{
            background:
              "conic-gradient(from 180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.16), rgba(255,255,255,0.02))",
          }}
        >
          <span className="absolute inset-2 rounded-full border border-white/[0.1]" aria-hidden />
          <div className="animate-spin" style={{ animationDuration: "7s" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brands/spotify.svg"
              alt=""
              width={20}
              height={20}
              aria-hidden
              className="h-5 w-5 brightness-0 invert opacity-85"
            />
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-medium text-white/90">
            Foco Profundo
          </p>
          <p className="truncate text-sm text-white/40">Playlist · Jarvis</p>
        </div>
        <Heart size={18} aria-hidden className="shrink-0 text-white/25" />
        <div className="flex h-4 items-end gap-[3px]" aria-hidden>
          {bars.map((_, i) => (
            <span
              key={i}
              className="wave-bar w-[3px] rounded-full bg-white/55"
              style={{ height: "100%", animationDelay: `${i * 0.18}s` }}
            />
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className="h-1 w-full overflow-hidden rounded-full bg-white/[0.1]">
          <motion.div
            initial={{ width: "22%" }}
            animate={{ width: "68%" }}
            transition={{ duration: 2.4, ease: [0.16, 1, 0.3, 1] }}
            className="h-full rounded-full bg-white/70"
          />
        </div>
        <div className="flex justify-between text-[11px] text-white/35">
          <span>1:42</span>
          <span>3:58</span>
        </div>
      </div>

      <div className="flex items-center justify-center gap-6 text-white/45">
        <ShuffleAngular size={16} aria-hidden />
        <SkipBack size={20} weight="fill" aria-hidden className="text-white/70" />
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-ink-950 shadow-[0_4px_20px_-4px_rgba(255,255,255,0.45)]">
          <Pause size={18} weight="fill" aria-hidden />
        </span>
        <SkipForward size={20} weight="fill" aria-hidden className="text-white/70" />
        <Repeat size={16} aria-hidden />
      </div>

      <div className="flex items-center gap-3 rounded-chip border border-white/[0.08] bg-white/[0.02] px-3.5 py-2.5">
        <SpeakerLow size={16} aria-hidden className="shrink-0 text-white/40" />
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/[0.1]">
          <motion.div
            initial={{ width: "85%" }}
            animate={{ width: "30%" }}
            transition={{ duration: 1.4, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="h-full rounded-full bg-white/50"
          />
        </div>
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.9, duration: 0.3 }}
          className="w-8 shrink-0 text-right text-[11px] text-white/40"
        >
          30%
        </motion.span>
      </div>

      <div className="space-y-1.5 border-t border-white/[0.06] pt-3">
        <p className="text-[10px] uppercase tracking-[0.14em] text-white/25">A seguir</p>
        {UP_NEXT.map((t) => (
          <div key={t.title} className="flex items-center justify-between gap-3 text-xs text-white/35">
            <span className="truncate">{t.title}</span>
            <span className="shrink-0 truncate text-white/20">{t.artist}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const WHATS_WORDS = "Estarei lá em 15 minutos.".split(" ");

function WhatsAppViz() {
  const [sent, setSent] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setSent(true), 2300);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-white/[0.08] bg-ink-950">
      <div className="flex items-center gap-3 border-b border-white/[0.08] px-5 py-3.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/[0.12] bg-white/[0.06] text-xs font-semibold text-white/80">
          L
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-white/85">Lucas</p>
          <p className="flex items-center gap-1.5 text-[11px] text-white/40">
            <span className="led-dot" aria-hidden /> online
          </p>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brands/whatsapp.svg"
          alt=""
          width={16}
          height={16}
          aria-hidden
          className="h-4 w-4 shrink-0 brightness-0 invert opacity-25"
        />
      </div>

      <div className="flex flex-1 flex-col justify-end gap-1.5 px-5 pb-3 pt-4">
        <div className="mr-auto max-w-[72%]">
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="rounded-2xl rounded-bl-sm bg-white/[0.05] px-4 py-2.5 text-sm leading-relaxed text-white/60"
          >
            Bora sair daqui a pouco?
          </motion.div>
          <p className="mt-1 text-[10px] text-white/20">14:02</p>
        </div>

        <div className="mr-auto max-w-[72%]">
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.3 }}
            className="rounded-2xl rounded-bl-sm bg-white/[0.05] px-4 py-2.5 text-sm leading-relaxed text-white/60"
          >
            Alguma novidade? 👀
          </motion.div>
          <p className="mt-1 text-[10px] text-white/20">14:03</p>
        </div>

        <div className="ml-auto max-w-[78%]">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.3 }}
            className="rounded-2xl rounded-br-sm bg-white/[0.1] px-4 py-2.5 text-sm leading-relaxed text-white/90"
          >
            {WHATS_WORDS.map((w, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.4 + i * 0.16, duration: 0.15 }}
              >
                {w}{" "}
              </motion.span>
            ))}
          </motion.div>
          {sent && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="mt-1 flex items-center justify-end gap-1.5 text-[10px] text-white/25"
            >
              14:03
              <Checks size={13} weight="bold" aria-hidden className="text-white/45" />
            </motion.p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2.5 border-t border-white/[0.08] bg-white/[0.02] px-4 py-3">
        <Plus size={16} aria-hidden className="shrink-0 text-white/25" />
        <span className="flex-1 truncate text-xs text-white/25">Mensagem</span>
        <PaperPlaneTilt size={16} aria-hidden className="shrink-0 text-white/25" />
      </div>
    </div>
  );
}

const GIT_LINES = [
  { text: "git clone github.com/você/projeto.git", cmd: true },
  { text: "Cloning into 'projeto'… done.", cmd: false },
  { text: 'git add . && git commit -m "update"', cmd: true },
  { text: "2 files changed, 47 insertions(+), 12 deletions(-)", cmd: false },
  { text: "git push origin main", cmd: true },
];

const GIT_FILES = [
  { name: "src/app.ts", add: 32, del: 4 },
  { name: "src/utils.ts", add: 10, del: 6 },
  { name: "README.md", add: 5, del: 2 },
];

function GitViz() {
  const filesDelay = 0.15 + GIT_LINES.length * 0.28 + 0.35;
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-white/[0.08] bg-ink-950">
      <div className="flex items-center gap-2.5 border-b border-white/[0.08] px-4 py-2.5">
        <FolderSimple size={15} weight="fill" aria-hidden className="text-white/30" />
        <span className="text-xs text-white/60">projeto</span>
        <span className="ml-auto flex items-center gap-1.5 rounded-full border border-white/[0.1] bg-white/[0.04] px-2.5 py-1 text-[11px] text-white/50">
          <GitBranch size={12} aria-hidden />
          main
        </span>
      </div>

      <div className="flex-1 space-y-1.5 p-5 font-mono text-[12.5px] leading-relaxed">
        {GIT_LINES.map((line, i) => (
          <motion.p
            key={i}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 + i * 0.28, duration: 0.3 }}
            className={line.cmd ? "text-white/85" : "text-white/35"}
          >
            {line.cmd && <span className="text-white/35">$ </span>}
            {line.text}
          </motion.p>
        ))}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 + GIT_LINES.length * 0.28, duration: 0.2 }}
          className="text-white/85"
        >
          <span className="text-white/35">$ </span>
          <span className="caret-blink inline-block h-3.5 w-2 translate-y-0.5 bg-white/80" />
        </motion.p>
      </div>

      <div className="space-y-1.5 border-t border-white/[0.06] px-5 py-3">
        <p className="text-[10px] uppercase tracking-[0.14em] text-white/25">
          Arquivos alterados
        </p>
        {GIT_FILES.map((f, i) => (
          <motion.div
            key={f.name}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: filesDelay + i * 0.12, duration: 0.25 }}
            className="flex items-center justify-between gap-3 text-xs"
          >
            <span className="truncate font-mono text-white/55">{f.name}</span>
            <span className="shrink-0 font-mono text-[11px] text-white/35">
              +{f.add} −{f.del}
            </span>
          </motion.div>
        ))}
      </div>

      <div className="flex items-center gap-2 border-t border-white/[0.08] bg-white/[0.02] px-4 py-2.5 text-[11px] text-white/40">
        <GitCommit size={13} aria-hidden />3 commits hoje · +47 −12
      </div>
    </div>
  );
}

const CHROME_BOOKMARKS = ["Finance", "Gmail", "Drive", "Docs"];
const CHROME_RESULTS = [
  { title: "Cotação Dólar Comercial — Investing.com", url: "investing.com/currencies/usd-brl" },
  { title: "Conversor de Moedas — Banco Central", url: "bcb.gov.br/conversao" },
];

function ChromeViz() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-white/[0.08] bg-ink-950">
      <div className="flex items-center gap-1.5 border-b border-white/[0.08] px-3 pt-2.5">
        <div className="flex items-center gap-2 rounded-t-md bg-white/[0.05] px-3 py-1.5 text-[11px] text-white/70">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brands/google-chrome.svg"
            alt=""
            width={11}
            height={11}
            aria-hidden
            className="h-[11px] w-[11px] brightness-0 invert opacity-70"
          />
          google.com
        </div>
        <div className="flex items-center gap-1.5 rounded-t-md px-3 py-1.5 text-[11px] text-white/25">
          <GlobeSimple size={11} aria-hidden />
          Nova aba
        </div>
      </div>

      <div className="relative border-b border-white/[0.06]">
        <div className="flex items-center gap-2 px-4 py-2.5 text-xs text-white/45">
          <LockSimple size={12} aria-hidden className="text-white/30" />
          google.com/search?q=preço+do+dólar+hoje
        </div>
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          style={{ transformOrigin: "left" }}
          className="absolute inset-x-0 bottom-0 h-[2px] bg-white/40"
        />
      </div>

      <div className="flex items-center gap-3 border-b border-white/[0.06] px-4 py-2 text-[11px] text-white/30" aria-hidden>
        {CHROME_BOOKMARKS.map((b) => (
          <span key={b} className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-white/15" />
            {b}
          </span>
        ))}
      </div>

      <div className="flex-1 space-y-4 overflow-hidden p-5">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          <p className="flex items-center gap-1.5 text-[11px] text-white/30">
            <MagnifyingGlass size={11} aria-hidden />
            Resultado da pesquisa
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-3">
            <p className="text-sm text-white/90">Dólar hoje</p>
            <span className="flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-xs font-medium text-white/80">
              <TrendUp size={11} aria-hidden />
              R$ 5,42 · +0,3%
            </span>
            <svg viewBox="0 0 60 20" className="h-4 w-14" aria-hidden>
              <polyline
                points="0,16 10,14 20,15 30,10 40,11 50,6 60,4"
                fill="none"
                stroke="rgba(255,255,255,0.45)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <p className="mt-1 text-xs text-white/35">
            google.com/finance › quote › USD-BRL
          </p>
        </motion.div>

        <div className="space-y-3 border-t border-white/[0.06] pt-3">
          {CHROME_RESULTS.map((r, i) => (
            <motion.div
              key={r.url}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 + i * 0.15, duration: 0.3 }}
            >
              <p className="truncate text-xs font-medium text-white/50">{r.title}</p>
              <p className="truncate text-[11px] text-white/25">{r.url}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function WindowsViz() {
  const r = 25;
  const c = 2 * Math.PI * r;
  const freePct = 0.57; // 9,2 GB livres de 16 GB

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-white/[0.08] bg-ink-950 p-5">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex-1 rounded-chip border border-white/[0.08] bg-white/[0.02] px-3.5 py-2.5">
          <p className="text-[11px] text-white/35">Sistema</p>
          <p className="mt-0.5 truncate text-sm text-white/80">Windows 11 Pro</p>
          <p className="mt-2 text-[11px] text-white/30">64 bits · build 26100</p>
        </div>

        <div className="relative flex h-[72px] w-[72px] shrink-0 items-center justify-center">
          <svg viewBox="0 0 60 60" className="h-full w-full -rotate-90" aria-hidden>
            <circle cx="30" cy="30" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="5" />
            <motion.circle
              cx="30"
              cy="30"
              r={r}
              fill="none"
              stroke="rgba(255,255,255,0.75)"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={c}
              initial={{ strokeDashoffset: c }}
              animate={{ strokeDashoffset: c * (1 - freePct) }}
              transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-sm font-semibold text-white/90">57%</span>
            <span className="text-[9px] text-white/35">livre</span>
          </div>
        </div>
      </div>

      <div className="mb-3 grid grid-cols-3 gap-2">
        <StatTile icon={Cpu} label="CPU" value="18%" />
        <StatTile icon={HardDrive} label="Disco" value="212 GB" />
        <StatTile icon={WifiHigh} label="Rede" value="86 Mbps" />
      </div>

      <div className="flex-1 space-y-1.5 overflow-hidden rounded-chip border border-white/[0.08] bg-white/[0.02] p-4 font-mono text-[12.5px] leading-relaxed">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-white/85"
        >
          <span className="text-white/35">PS&gt; </span>Stop-Process -Name spotify
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-white/35"
        >
          Processo encerrado.
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.05 }}
          className="text-white/85"
        >
          <span className="text-white/35">PS&gt; </span>Get-Volume C | Select FreeSpace
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="text-white/35"
        >
          FreeSpace: 9,2 GB
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.7 }}
          className="text-white/85"
        >
          <span className="text-white/35">PS&gt; </span>
          <span className="caret-blink inline-block h-3.5 w-2 translate-y-0.5 bg-white/80" />
        </motion.p>
      </div>
    </div>
  );
}

const RECIPE_LINES: { text: string; heading?: boolean; sub?: boolean }[] = [
  { text: "Bolo de Chocolate Simples", heading: true },
  { text: "Ingredientes", sub: true },
  { text: "• 2 xícaras de farinha de trigo" },
  { text: "• 1 xícara de açúcar" },
  { text: "• 3 ovos" },
  { text: "• 1/2 xícara de chocolate em pó" },
  { text: "• 1 colher de fermento em pó" },
  { text: "Modo de preparo", sub: true },
  { text: "Misture os secos, adicione os ovos e" },
  { text: "leve ao forno preaquecido por 40 min." },
];

function WordViz() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-white/[0.08] bg-ink-950">
      <div className="flex items-center gap-2 border-b border-white/[0.08] px-4 py-3">
        <span className="flex gap-1.5" aria-hidden>
          <span className="h-2 w-2 rounded-full bg-white/15" />
          <span className="h-2 w-2 rounded-full bg-white/15" />
          <span className="h-2 w-2 rounded-full bg-white/15" />
        </span>
        <span className="ml-1 text-xs font-medium text-white/50">
          Receita de Bolo.docx — Word
        </span>
      </div>

      {/* faixa de ferramentas, so decorativa, pra vender "app de verdade" */}
      <div
        className="flex items-center gap-1.5 border-b border-white/[0.08] bg-white/[0.02] px-4 py-2"
        aria-hidden
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <span key={i} className="h-5 w-5 rounded bg-white/[0.05]" />
        ))}
      </div>

      {/* p-3/p-4 e space-y-1 (em vez de p-4/p-5 e space-y-1.5): a receita tem
          10 linhas e esta e a demo mais alta das sete, entao ela e a que
          define a altura minima da janela — esse aperto mantem a ultima linha
          dentro da area visivel com folga. */}
      <div className="flex-1 overflow-hidden bg-white/[0.015] p-3">
        <div className="mx-auto h-full max-w-[440px] space-y-1 rounded-lg border border-white/[0.06] bg-ink-900/40 p-4 text-[13.5px] leading-relaxed text-white/80">
          {RECIPE_LINES.map((line, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 + i * 0.2, duration: 0.22 }}
              className={
                line.heading
                  ? "font-display text-base font-semibold text-white/95"
                  : line.sub
                  ? "mt-1 font-semibold text-white/70"
                  : "text-white/70"
              }
            >
              {line.text}
              {i === RECIPE_LINES.length - 1 && (
                <span className="caret-blink ml-1 inline-block h-4 w-[2px] translate-y-0.5 bg-white/80" />
              )}
            </motion.p>
          ))}
        </div>
      </div>

      {/* barra de status do Word — o "pronto, escrevi" agora mora no cartao
          do Jarvis, entao aqui fica so o que o proprio app mostraria. */}
      <div className="flex items-center justify-between border-t border-white/[0.06] bg-ink-950/80 px-5 py-1.5 text-[10px] text-white/25">
        <span>Página 1 de 1 · Português (Brasil)</span>
        <span>68 palavras</span>
      </div>
    </div>
  );
}

const SCREEN_LINES = [
  { n: 38, text: "import { cart } from './store';" },
  { n: 39, text: "" },
  { n: 40, text: "function total(items) {" },
  { n: 41, text: "  return items.reduce((a, b) =>" },
  { n: 42, text: "    a + b.price, 0)", error: true },
  { n: 43, text: "}" },
  { n: 44, text: "" },
  { n: 45, text: "export default total;" },
];

function ScreenViz() {
  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-xl border border-white/[0.08] bg-ink-950">
      <div className="flex items-center gap-2 border-b border-white/[0.08] px-4 py-2.5 text-[11px] text-white/35">
        <span className="h-1.5 w-1.5 rounded-full bg-white/25" aria-hidden />
        carrinho.js
      </div>

      <div className="relative flex flex-1 overflow-hidden font-mono text-[12px] leading-relaxed">
        <div className="select-none space-y-0 px-3 py-4 text-right text-white/20" aria-hidden>
          {SCREEN_LINES.map((l) => (
            <p key={l.n}>{l.n}</p>
          ))}
        </div>
        <div className="flex-1 space-y-0 py-4 pr-4">
          {SCREEN_LINES.map((l) => (
            <p
              key={l.n}
              className={`whitespace-pre border-l-2 pl-3 ${
                l.error
                  ? "border-white/50 bg-white/[0.06] text-white/85"
                  : "border-transparent text-white/50"
              }`}
            >
              {l.text || " "}
            </p>
          ))}
        </div>
        <div
          className="hidden w-4 shrink-0 flex-col gap-[3px] border-l border-white/[0.06] px-1.5 py-4 sm:flex"
          aria-hidden
        >
          {SCREEN_LINES.map((l) => (
            <span
              key={l.n}
              className={`h-[3px] rounded-full ${l.error ? "bg-white/55" : "bg-white/10"}`}
              style={{ width: `${Math.min(100, (l.text.length / 32) * 100)}%` }}
            />
          ))}
        </div>
        <div className="pointer-events-none absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-transparent via-white/[0.14] to-transparent scan-y" />
      </div>

      {/* barra de status do editor — o diagnostico agora mora no cartao do
          Jarvis, entao aqui fica so o que o proprio app mostraria. */}
      <div className="flex items-center justify-between border-t border-white/[0.06] bg-ink-950/80 px-5 py-1.5 text-[10px] text-white/25">
        <span className="flex items-center gap-1.5">
          <GitBranch size={10} aria-hidden />
          main
        </span>
        <span>Ln 42, Col 18 · JavaScript</span>
      </div>
    </div>
  );
}

function ConsoleBody({ cap }: { cap: Cap }) {
  switch (cap.kind) {
    case "spotify":
      return <SpotifyViz />;
    case "whatsapp":
      return <WhatsAppViz />;
    case "git":
      return <GitViz />;
    case "chrome":
      return <ChromeViz />;
    case "windows":
      return <WindowsViz />;
    case "type":
      return <WordViz />;
    case "screen":
      return <ScreenViz />;
  }
}

export default function Features() {
  const reduce = useReducedMotionSafe();
  const [activeIdx, setActiveIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  // Auto-play: percorre as capacidades sozinho, como uma demo rodando. Para
  // no hover/foco (o visitante assumiu o controle) e em reduced-motion.
  useEffect(() => {
    if (reduce || paused) return;
    const id = setInterval(
      () => setActiveIdx((i) => (i + 1) % CAPS.length),
      AUTOPLAY_MS
    );
    return () => clearInterval(id);
  }, [reduce, paused]);

  const active = CAPS[activeIdx];

  return (
    <section
      id="recursos"
      className="relative overflow-hidden bg-ink-900 px-6 pb-28 pt-14 sm:pb-36 sm:pt-20 lg:px-10 wide:px-16"
    >
      {/* halo suave atras do console */}
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 top-1/3 h-[460px] w-[620px] translate-x-1/4 rounded-full bg-white/[0.04] blur-[140px]"
      />

      <div className="relative mx-auto max-w-6xl wide:max-w-shell">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto max-w-2xl text-center"
        >
          <SectionEyebrow>Capacidades</SectionEyebrow>
          <h2 className="mt-5 text-balance font-display text-3xl font-semibold tracking-[-0.025em] text-[#FAFAFA] sm:text-5xl lg:text-6xl">
            Ele age no computador, não só no chat.
          </h2>
          <p className="mx-auto mt-6 max-w-[54ch] text-lg font-light leading-relaxed text-white/55">
            Não é mais um chat que responde e para por aí. Escolha uma
            capacidade e veja o Jarvis executando de verdade.
          </p>
        </motion.div>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={() => setPaused(false)}
          className="mt-14 grid grid-cols-1 gap-4 lg:grid-cols-[0.9fr_1.35fr] lg:gap-5"
        >
          {/* Coluna esquerda: seletor de capacidades */}
          <div className="flex flex-col gap-2.5">
            {CAPS.map((cap, i) => {
              const isActive = i === activeIdx;
              return (
                <button
                  key={cap.id}
                  type="button"
                  onClick={() => setActiveIdx(i)}
                  aria-pressed={isActive}
                  className={`glow-ring group relative flex items-center gap-4 overflow-hidden rounded-card border px-5 py-4 text-left transition-colors duration-300 ${
                    isActive
                      ? "glow-ring--active border-white bg-[#FAFAFA]"
                      : "border-white/[0.08] bg-ink-900/60 hover:border-white/20 hover:bg-ink-800/60"
                  }`}
                >
                  <span
                    aria-hidden
                    className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-chip border transition-colors duration-300 ${
                      isActive
                        ? "border-ink-950 bg-ink-950 text-white"
                        : "border-white/[0.1] text-white/55 group-hover:text-white/80"
                    }`}
                  >
                    <CapGlyph cap={cap} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className={`block font-display text-[0.95rem] font-semibold tracking-[-0.01em] transition-colors duration-300 ${
                        isActive ? "text-ink-950" : "text-white/75"
                      }`}
                    >
                      {cap.tab}
                    </span>
                    <span
                      className={`mt-0.5 block truncate text-xs transition-colors duration-300 ${
                        isActive ? "text-ink-950/80" : "text-white/40"
                      }`}
                    >
                      {cap.hint}
                    </span>
                  </span>
                  {isActive && (
                    <span
                      className="ml-1 h-1.5 w-1.5 shrink-0 rounded-full bg-ink-950"
                      aria-hidden
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Coluna direita: a janela do console. glow-ring SEM --active: o
              anel girando e um conic-gradient animado via @property, que o
              navegador precisa REPINTAR a cada frame (nao e so compositor
              como transform/opacity) — deixado sempre ligado, isso e um
              repaint continuo pra sempre numa janela grande e sempre
              visivel. Vira hover/focus (:is(:hover,:focus-within), ja
              definido em globals.css), igual o resto dos usos de
              glow-ring no site. */}
          <div className="glow-ring relative flex min-h-[620px] flex-col overflow-hidden rounded-card border border-white/[0.12] bg-ink-800/70 shadow-[0_40px_120px_-50px_rgba(0,0,0,0.9)]">
            {/* barra de titulo */}
            <div className="flex items-center gap-3 border-b border-white/[0.08] px-5 py-3.5">
              <span className="flex gap-1.5" aria-hidden>
                <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
              </span>
              <span className="ml-1 font-display text-xs font-semibold uppercase tracking-[0.15em] text-white/45">
                Jarvis Console
              </span>
              <span className="ml-auto flex items-center gap-2 text-xs text-white/40">
                <span className="led-dot" aria-hidden />
                ativo
              </span>
            </div>

            {/* corpo. Os dois cartoes de fala usam o mesmo esqueleto de UMA
                linha — avatar, rotulo, divisor e frase lado a lado. O rotulo
                tem largura fixa (w-20) nos dois pra frase do usuario e a do
                Jarvis comecarem exatamente na mesma coluna: sem isso
                "USUÁRIO" e "JARVIS" tem larguras diferentes e os dois textos
                ficariam desalinhados um do outro. Dentro dessa caixa o texto
                e centralizado, entao cada rotulo fica no meio do vao entre o
                avatar e o divisor, independente do tamanho da palavra. */}
            <div className="flex flex-1 flex-col gap-4 p-5">
              {/* 1o ato — o pedido, sem truncar, pra ler numa boa */}
              <div className="flex items-center gap-3 rounded-chip border border-white/[0.08] bg-ink-950/60 px-5 py-3.5">
                <span className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/[0.12] bg-white/[0.04]">
                  <span
                    aria-hidden
                    className="core-ping absolute inset-0 rounded-full border border-white/20"
                    style={{ animationDuration: "2.4s" }}
                  />
                  <Microphone
                    size={16}
                    weight="light"
                    aria-hidden
                    className="text-white/60"
                  />
                </span>
                {/* font-mono (Geist Mono) em vez da Exo 2 dos titulos: aqui o
                    rotulo faz papel de etiqueta de terminal, e a monoespacada
                    e o que casa com o resto da linguagem do console. */}
                <span className="w-20 shrink-0 text-center font-mono text-xs font-medium uppercase tracking-[0.14em] text-white/40">
                  Usuário
                </span>
                <span aria-hidden className="mx-1 h-6 w-px shrink-0 bg-white/15" />
                {/* min-h de uma linha: com AnimatePresence "wait" a frase
                    antiga desmonta antes da nova entrar, e sem essa reserva o
                    cartao encolheria nesse intervalo. */}
                <div className="flex min-h-[1.75rem] min-w-0 flex-1 items-center">
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={active.id}
                      initial={reduce ? false : { opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={reduce ? undefined : { opacity: 0, y: -6 }}
                      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                      className="text-lg italic leading-snug text-white/90 sm:text-xl"
                    >
                      “{active.command}”
                    </motion.p>
                  </AnimatePresence>
                </div>
              </div>

              {/* 2o ato — a tela da acao */}
              <div className="relative min-h-[450px] flex-1">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={active.id}
                    initial={reduce ? false : { opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduce ? undefined : { opacity: 0, y: -12 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute inset-0"
                  >
                    <ConsoleBody cap={active} />
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* 3o ato — a resposta. Mais clara que o cartao do usuario de
                  proposito: e a "voz" do produto, o fim da historia. */}
              <div className="flex items-center gap-3 rounded-chip border border-white/[0.16] bg-white/[0.05] px-5 py-3.5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/25 bg-white/[0.08] shadow-[0_0_14px_-2px_rgba(255,255,255,0.4)]">
                  <JarvisMark />
                </span>
                <span className="w-20 shrink-0 text-center font-mono text-xs font-medium uppercase tracking-[0.14em] text-white/60">
                  Jarvis
                </span>
                <span aria-hidden className="mx-1 h-6 w-px shrink-0 bg-white/20" />
                {/* mesma reserva de uma linha: aqui ela absorve a troca dos
                    pontinhos de "pensando" pela frase. */}
                <div className="flex min-h-[1.75rem] min-w-0 flex-1 items-center">
                  <JarvisReply
                    key={active.id}
                    text={active.reply}
                    delay={active.replyDelay}
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Ponte para Integracoes */}
        <motion.a
          href="#integracoes"
          initial={reduce ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.8 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="group mt-14 flex items-center justify-center gap-2 text-sm font-medium text-white/45 transition-colors duration-300 hover:text-white/85"
        >
          Veja tudo que ele já conecta
          <ArrowDown
            size={15}
            weight="bold"
            aria-hidden
            className="transition-transform duration-300 group-hover:translate-y-0.5"
          />
        </motion.a>
      </div>
    </section>
  );
}
