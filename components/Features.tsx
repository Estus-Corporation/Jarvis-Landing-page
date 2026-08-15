"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  animate,
  useMotionValue,
  type PanInfo,
} from "motion/react";
import { useReducedMotionSafe } from "@/components/ui/use-reduced-motion-safe";
import { useLowPowerDevice } from "@/components/ui/use-low-power";
import { useMediaQuery } from "@/components/ui/use-media-query";
import {
  Keyboard,
  Eye,
  SkipBack,
  SkipForward,
  Pause,
  SpeakerLow,
  Checks,
  Check,
  X,
  MagnifyingGlass,
  Microphone,
  FolderSimple,
  GitBranch,
  GitCommit,
  LockSimple,
  Heart,
  ShuffleAngular,
  Repeat,
  Broadcast,
  DeviceMobile,
  Desktop,
  SpeakerHifi,
  GlobeSimple,
  TrendUp,
  WifiHigh,
  PaperPlaneTilt,
  Plus,
  CaretDown,
  CaretLeft,
  CheckCircle,
  CloudArrowUp,
  GitPullRequest,
  Terminal,
  ArrowUp,
  ArrowsClockwise,
  CaretRight,
  ArrowClockwise,
  VideoCamera,
  Phone,
  DotsThreeVertical,
  Smiley,
  Paperclip,
  Camera,
  Star,
  Play,
  ThumbsUp,
  ShareFat,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";
import SectionEyebrow from "@/components/ui/section-eyebrow";

// SECAO RECONSTRUIDA DO ZERO — antes era um bento grid de cartoes estaticos.
// Depois virou um console de comandos com 5 capacidades abstratas (memoria,
// voz, tom...). Esta e a 2a reconstrucao do miolo: esta secao passa a ser a
// vitrine REAL de integracoes/capacidades do Jarvis — por isso agora sao 7
// apps/capacidades concretas, cada uma com o app real (logo) ou o icone da
// capacidade, em vez de conceitos genericos. (A secao logo abaixo, que era um
// segundo mostruario de integracoes, virou "Organizacao" justamente por ter
// ficado redundante com esta: ver Organization.tsx.)
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
  | "screen"
  | "youtube";

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

// ---- Aparelhos onde a musica pode tocar ----------------------------------
// Esta lista e o unico lugar que sabe como cada aparelho se chama: ela monta a
// FRASE do pedido ("...na Alexa") e a resposta do Jarvis. O visitante troca o
// aparelho no seletor dentro da demo do Spotify, e o cartao "Usuário" muda
// junto — a demo vira, na pratica, um exemplo de COMO FALAR com o Jarvis pra
// mandar o som pra cada lugar.
//
// O pedido ja falou tambem em abaixar o volume ("...e abaixa o volume"), mas
// no aparelho padrao a frase inteira nao cabia numa linha do cartao e quebrava
// pra baixo. Cortar essa segunda ordem economizou 18 caracteres e deixou o
// exemplo com UMA acao so, que e mais claro de qualquer forma. As respostas
// abaixo e a `hint` do cartao pararam de mencionar volume junto — o Jarvis nao
// pode responder que baixou algo que ninguem pediu.
type DeviceId = "computador" | "celular" | "alexa";

const SPOTIFY_DEVICES: {
  id: DeviceId;
  name: string;
  detail: string;
  icon: Icon;
  say: string;
  reply: string;
}[] = [
  {
    id: "computador",
    name: "Computador",
    detail: "Este dispositivo",
    icon: Desktop,
    say: "aqui no computador",
    reply: "Pronto, tocando aqui no computador.",
  },
  {
    id: "celular",
    name: "Celular",
    detail: "Galaxy S24",
    icon: DeviceMobile,
    say: "no meu celular",
    reply: "Pronto, tocando no seu celular.",
  },
  {
    id: "alexa",
    name: "Alexa",
    detail: "Sala",
    icon: SpeakerHifi,
    say: "na Alexa",
    reply: "Pronto, tocando na Alexa da sala.",
  },
];

const DEFAULT_DEVICE: DeviceId = "computador";

const findDevice = (id: DeviceId) =>
  SPOTIFY_DEVICES.find((d) => d.id === id) ?? SPOTIFY_DEVICES[0];

const spotifyCommand = (id: DeviceId) =>
  `Jarvis, toca minha playlist de foco ${findDevice(id).say}.`;

const CAPS: Cap[] = [
  {
    id: "spotify",
    tab: "Spotify",
    hint: "Toca a música no aparelho que você escolher",
    brand: "/brands/spotify.svg",
    // texto do aparelho padrao; quando o visitante troca o seletor, a secao
    // recalcula os dois a partir de SPOTIFY_DEVICES.
    command: spotifyCommand(DEFAULT_DEVICE),
    reply: findDevice(DEFAULT_DEVICE).reply,
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
    // a cena do WhatsApp so termina quando a mensagem e entregue (READ_AT, la
    // embaixo, em ~3,3s) — a resposta cai logo depois dos dois tiques.
    replyDelay: 3.7,
    kind: "whatsapp",
  },
  {
    id: "youtube",
    tab: "YouTube",
    hint: "Procura e toca o vídeo que você pedir",
    brand: "/brands/youtube.svg",
    command: "Jarvis, procura um tutorial de violão no YouTube e toca o primeiro vídeo.",
    reply: "Encontrei um tutorial ótimo e já coloquei pra tocar.",
    // a cena troca da lista de resultados pro video tocando em YOUTUBE_PLAY_AT
    // (1,9s, ver mais abaixo) — a resposta cai logo depois, com o video ja
    // rodando (nao espera a barra de progresso encher, mesmo padrao do
    // Spotify: a acao "comecou" e o suficiente pra resposta fazer sentido).
    replyDelay: 2.6,
    kind: "youtube",
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
    hint: "Fecha e abre os programas do seu computador",
    brand: "/brands/windows.svg",
    command: "Jarvis, fecha o Spotify e abre o Chrome pra mim.",
    reply: "Fechei o Spotify e abri o Chrome pra você.",
    // a janela do Spotify some em 1,1s e a do Chrome nasce em 2,0s (WIN_*, la
    // embaixo) — a resposta so faz sentido depois das duas.
    replyDelay: 2.8,
    kind: "windows",
  },
  {
    id: "git",
    tab: "Git",
    hint: "Clona repositórios e executa comandos Git",
    brand: "/brands/git.svg",
    command: "Jarvis, clona esse repositório e sobe minhas alterações.",
    reply: "Prontinho, subi tudo pro GitHub em 3 commits.",
    // a cena do Git e a mais longa das oito: o terminal digita 3 comandos e
    // sobe o push antes de a resposta fazer sentido (GIT_END, ~4,2s).
    replyDelay: 4.4,
    kind: "git",
  },
  {
    id: "type",
    tab: "Digita por você",
    hint: "Escreve no campo que você selecionar",
    icon: Keyboard,
    // "completa" saiu: com ela o pedido nao cabia em 2 linhas na largura do
    // celular e o line-clamp-2 do cartao "Usuario" cortava a frase no meio
    // (ver comentario grande no 1o ato, em ConsoleWindow).
    command: "Jarvis, me escreva uma receita de bolo no Word.",
    reply: "Pronto! Escrevi a receita completa no documento.",
    replyDelay: 2.7,
    kind: "type",
  },
  {
    id: "screen",
    tab: "Leitura de tela",
    hint: "Observa e analisa o que está na sua tela",
    icon: Eye,
    command: "Jarvis, o que esse gráfico na tela está mostrando?",
    reply: "Achei um erro na linha 42: falta multiplicar pela quantidade.",
    replyDelay: 1.6,
    kind: "screen",
  },
];

// Velocidade de digitacao do pedido do usuario (1o ato) — mesma familia da
// GIT_CHAR (comandos digitados no terminal), so que mais lenta: aqui e uma
// frase "falada", nao um comando de terminal, entao o ritmo de WhatsApp
// digitando fica mais natural um pouco mais devagar.
const COMMAND_CHAR_MS = 28;

// ---- Arrasto lateral (so no celular) -------------------------------------
// Gatilho por DISTANCIA ou por VELOCIDADE: um peteleco curto e rapido conta
// tanto quanto um arrasto lento e longo. Com so um dos dois, metade dos
// gestos naturais nao trocaria de cartao.
const SWIPE_DISTANCE = 56; // px percorridos
const SWIPE_VELOCITY = 380; // px/s no momento em que o dedo solta

// SEM espiada de vizinho (pedido do usuario — antes um pedaco do proximo
// cartao ficava parado na borda direita o tempo todo, mesma ideia do
// carrossel de Organization.tsx). O cartao ativo deixava sempre uma leve
// sensacao de "puxado pra esquerda" (a espiada so aparecia na direita, e o
// primeiro cartao — o estado inicial da pagina — nao tinha vizinho
// espiando na esquerda pra compensar). Agora cada cartao ocupa a janela de
// recorte inteira e fica sempre centralizado, sem ceder largura nenhuma
// pro vizinho — mesmo padrao "sem peek" que o carrossel de Updates
// (Roadmap.tsx) ja usa.
const SLIDE_GAP = 16; // px de vao entre cartoes (= gap-4, igual Organization.tsx)

// ---- Icone do botao: logo do app (svg de marca) ou icone Phosphor da
// capacidade (herda a cor do chip via currentColor, entao nao precisa de
// `dark` — so o `size` importa pra ele).
// `dark`: as logos de marca sao arquivos de UMA cor so, entao "branco" tem
// que ser forcado via filtro CSS (brightness-0 depois invert), nao da pra
// pintar como currentColor. Por padrao (dark=false) ficam brancas — o caso
// de sempre, cor clara sobre chip/botao escuro. So quando `dark` e true
// (botao com fundo BRANCO, ver isActive em CapButton) o invert sai e a logo
// fica preta (so o brightness-0, sem inverter de volta) — sem isso ela
// ficava branca-sobre-branco, ilegivel, no botao selecionado.
// `size`: em px, controla os dois formatos (Phosphor usa a prop nativa;
// a logo de marca usa width/height + style, ja que Tailwind nao gera
// classes de tamanho arbitrario a partir de uma variavel em runtime). */
function CapGlyph({
  cap,
  size = 24,
  dark = false,
}: {
  cap: Cap;
  size?: number;
  dark?: boolean;
}) {
  if (cap.brand) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={cap.brand}
        alt=""
        width={size}
        height={size}
        aria-hidden
        style={{ width: size, height: size }}
        className={`shrink-0 brightness-0 ${dark ? "" : "invert"}`}
      />
    );
  }
  const Glyph = cap.icon!;
  return <Glyph size={size} weight="light" aria-hidden />;
}

// ---- Botao SO ICONE de capacidade, SEMPRE redondo — o nome aparece do
// LADO de fora no hover, o botao em si nunca muda de forma (pedido do
// usuario: a versao anterior fazia o proprio botao crescer/virar pilula
// pra caber o nome dentro dele; agora o circulo fica intacto e o nome e
// uma peca a parte, flutuando ao lado). Usado nas DUAS colunas do desktop
// (ver Features(), mais abaixo), que flanqueiam o console dos dois lados.
// O celular continua com o desenho rico original (icone + nome + frase,
// sempre visivel), escrito direto em Features() pra UM botao so — nao usa
// este componente.
//
// MECANICA do hover:
//   1. O NOME e um <span> `position: absolute`, colado do lado de fora do
//      botao (`left-full`/`right-full`, ver `side`), com opacity 0 e um
//      pequeno deslocamento em repouso — no hover (`group-hover`, o grupo
//      e o wrapper) ele desliza pro lugar e some o deslocamento, uma
//      entrada com uma sensacao de "saindo de tras do botao".
//      `position: absolute` de proposito: NAO participa do layout (ao
//      contrario da versao anterior, que mudava o `max-width` do proprio
//      botao — um valor que afeta o fluxo/grid) — entao nao ha risco de
//      empurrar a coluna ou o cartao do console, nao importa o quao
//      comprido o nome seja.
//   2. `side` decide de qual lado o nome nasce (`left-full` pra direita,
//      `right-full` pra esquerda) — a mesma logica de sempre: esquerda
//      mostra o nome pra esquerda (longe do console), direita pra direita.
function CapButton({
  cap,
  isActive,
  onClick,
  side,
}: {
  cap: Cap;
  isActive: boolean;
  onClick: () => void;
  side: "left" | "right";
}) {
  return (
    // wrapper `group relative inline-flex`: `group` pro nome (mais abaixo)
    // reagir ao hover de QUALQUER coisa dentro (o botao). inline-flex:
    // encolhe exatamente pro tamanho do botao, que agora e FIXO (w-24,
    // nunca muda) — o wrapper nunca precisa recalcular nada.
    <div className="group relative inline-flex shrink-0">
      {isActive && (
        <>
          {/* Raios de luz ESTATICOS (cap-rays, ver globals.css) — halo tipo
              sol, somado ao anel pulsante (cap-pulse, logo abaixo).
              <span> PROPRIO, fora do botao: o botao nao tem mais
              overflow-hidden (nao precisa mais esconder nome nenhum), mas
              o raio ainda precisa ficar fora dele pra nao ser limitado
              pelo tamanho fixo do botao (-inset-6 e bem maior). */}
          <span
            aria-hidden
            className="cap-rays pointer-events-none absolute -inset-6 rounded-full"
          />
          {/* Anel PULSANTE (cap-pulse): <span> separado dos raios acima —
              a animacao CSS dele anima box-shadow em cada frame, entao
              dividir em elementos diferentes evita que uma propriedade
              atropele a outra no mesmo elemento. */}
          <span
            aria-hidden
            className="cap-pulse pointer-events-none absolute inset-0 rounded-full"
          />
        </>
      )}
      <button
        type="button"
        onClick={onClick}
        aria-pressed={isActive}
        aria-label={cap.tab}
        // SEM glow-ring (pedido do usuario): o anel girando deixava um
        // "detalhe branco" visivel nas laterais do circulo — mesma reclamacao
        // e mesma solucao dos cartoes de Organizacao (ver comentario la). A
        // borda estatica (branca no ativo, translucida com hover:border no
        // resto) ja basta pra marcar o botao, sem precisar de anel animado.
        // h-24/w-24 (nao mais max-w-24): largura FIXA agora, nunca muda —
        // o botao fica sempre um circulo perfeito, hover ou nao (pedido do
        // usuario). O nome saiu pra um <span> a parte, ver mais abaixo.
        className={`relative z-10 flex h-24 w-24 shrink-0 items-center justify-center rounded-full border transition-colors duration-300 ${
          isActive
            ? "border-white bg-[#FAFAFA]"
            : "border-white/[0.08] bg-ink-900/60 hover:border-white/20 hover:bg-ink-800/60"
        }`}
      >
        <span
          aria-hidden
          className={`flex shrink-0 items-center justify-center transition-colors duration-300 ${
            isActive ? "text-ink-950" : "text-white/55 group-hover:text-white/80"
          }`}
        >
          {/* dark={isActive}: no botao selecionado (fundo branco) a logo de
              marca precisa ficar PRETA — pedido do usuario. Sem isso ela
              continuava branca (filtro fixo de CapGlyph) sobre um fundo
              branco, ilegivel. Os icones Phosphor (Keyboard/Eye) ja seguiam a
              cor do <span> acima via currentColor e nao precisavam do
              ajuste, mas o prop nao afeta esse caminho. */}
          <CapGlyph cap={cap} size={48} dark={isActive} />
        </span>
      </button>

      {/* Nome, FORA do botao — aparece deslizando + esmaecendo no hover, SO
          o texto, sem pilula/cartao ao redor (pedido do usuario: nao
          precisa de moldura, so a escrita mesmo).
          top-1/2 -translate-y-1/2: centralizado na altura do botao.
          `pointer-events-none`: e so um rotulo, nao deve interceptar o
          mouse (senao "sair do hover" ao entrar no rotulo apagaria ele
          mesmo, um flicker). z-20: por cima de tudo (raios, pulso, botao). */}
      <span
        aria-hidden
        className={`pointer-events-none absolute top-1/2 z-20 -translate-y-1/2 whitespace-nowrap font-display text-sm font-semibold text-white/90 opacity-0 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:opacity-100 ${
          side === "right"
            ? "left-full ml-4 -translate-x-1 group-hover:translate-x-0"
            : "right-full mr-4 translate-x-1 group-hover:translate-x-0"
        }`}
      >
        {cap.tab}
      </span>
    </div>
  );
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

// ---- "Pensando": 3 pontinhos que piscam UM DE CADA VEZ (delay escalonado
// na mesma animacao CSS, ver .thinking-dot em globals.css), enquanto a
// resposta do Jarvis ainda nao chegou. Ocupa o cartao antes de showReply
// virar true — o cartao de resposta agora fica SEMPRE visivel (pedido do
// usuario: nao pode mais aparecer "por ultimo"), entao precisa de algo pra
// mostrar enquanto espera a vez dele, em vez de ficar vazio ou escondido.
function ThinkingDots() {
  return (
    <span className="inline-flex items-center gap-1.5" aria-hidden>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="thinking-dot h-1.5 w-1.5 rounded-full bg-white/70"
          style={{ animationDelay: `${i * 0.2}s` }}
        />
      ))}
    </span>
  );
}

// ---- Corpo do cartao "Jarvis": texto digitado letra a letra, MESMA
// animacao do pedido do usuario (ver `commandChars`/cursor no 1o ato, em
// ConsoleWindow) — pedido do usuario. `chars` vem de `replyChars`, que
// tambem so mora em Features() (a decisao de QUANDO mostrar isto ou os
// pontinhos de ThinkingDots continua no chamador, ver comentario la). O
// cursor pisca so enquanto ainda falta digitar; ao terminar, some sozinho
// (mesma logica do `typed` do pedido). -------------------------------------
function JarvisReply({ text, chars }: { text: string; chars: number }) {
  const typed = chars >= text.length;
  return (
    <p className="line-clamp-2 text-[0.95rem] leading-snug text-white/90 sm:text-xl laptop:text-base">
      {text.slice(0, chars)}
      {!typed && (
        <span className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[2px] animate-pulse bg-white/70 align-middle" />
      )}
    </p>
  );
}

// ---- Visualizacoes por capacidade (o "miolo" da tela do console) ----------
// Cada uma usa o espaco inteiro da janela — chrome completo do app (abas,
// favoritos, paineis, listas), nao so um recorte — pra parecer uma gravacao
// de tela de verdade em vez de um resumo.

// A fila da playlist. `now` e a faixa que esta tocando: ela troca o numero por
// um equalizador e e a unica linha acesa, igual na lista do app.
const SPOTIFY_TRACKS: {
  title: string;
  artist: string;
  time: string;
  now?: boolean;
}[] = [
  { title: "Chuva Leve", artist: "Ambient Mix", time: "3:58", now: true },
  { title: "Piano & Café", artist: "Foco Profundo", time: "4:12" },
  { title: "Ruído Branco", artist: "Sono Leve", time: "5:04" },
  { title: "Lo-fi Noturno", artist: "Night Study", time: "3:21" },
];

// Barrinhas de equalizador, reaproveitadas na faixa que esta tocando e no
// cabecalho da lista.
function EqBars({ className = "" }: { className?: string }) {
  return (
    <span className={`flex h-3 items-end gap-[2px] ${className}`} aria-hidden>
      {Array.from({ length: 4 }).map((_, i) => (
        <span
          key={i}
          className="wave-bar w-[2px] rounded-full bg-white/70"
          style={{ height: "100%", animationDelay: `${i * 0.18}s` }}
        />
      ))}
    </span>
  );
}

// Layout refeito: antes era uma pilha de blocos (dispositivos, faixa, barra,
// controles, volume, "a seguir") que nao lembrava o app em nada. Agora e a
// arquitetura do Spotify de verdade — capa grande com os dados da playlist em
// cima, a FILA no meio ocupando o vao, e a barra do tocador colada embaixo.
//
// Esta e a UNICA demo com que da pra interagir: o seletor la em cima e de
// verdade, e quem manda no aparelho. Quem escolhe e o pai (Features), porque a
// escolha reescreve o cartao "Usuário" e a resposta do Jarvis, que vivem fora
// desta janela.
function SpotifyViz({
  device,
  onDevice,
  lowPower,
}: {
  device: DeviceId;
  onDevice: (id: DeviceId) => void;
  lowPower: boolean;
}) {
  const [open, setOpen] = useState(false);
  const current = findDevice(device);
  const CurrentGlyph = current.icon;
  const others = SPOTIFY_DEVICES.filter((d) => d.id !== device);

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-xl border border-white/[0.08] bg-ink-950">
      {/* brilho da capa vazando pro topo, como o degrade do app */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-56"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 70% 100% at 18% 0%, rgba(255,255,255,0.11), transparent 65%)",
        }}
      />

      <div className="relative flex items-center gap-2.5 border-b border-white/[0.06] px-4 py-3 sm:px-5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brands/spotify.svg"
          alt=""
          width={15}
          height={15}
          aria-hidden
          className="h-[15px] w-[15px] shrink-0 brightness-0 invert opacity-70"
        />
        {/* hidden no celular: o rotulo + o seletor de aparelho ja disputam a
            linha toda a essa largura, e o icone do Spotify sozinho ja diz
            "tocando agora" o bastante — ver mobileCarousel* em outras
            demos pra mesma ideia de cortar rotulo antes de cortar
            controle. */}
        <span className="hidden text-[11px] font-medium uppercase tracking-[0.14em] text-white/40 sm:inline">
          Tocando agora
        </span>

        {/* seletor de aparelho — o unico controle vivo das sete demos. O
            ml-auto fica no GRUPO: o rotulo some em telas estreitas, e se ele
            carregasse o ml-auto sozinho o botao deixaria de ser empurrado pra
            direita junto. */}
        <div className="ml-auto flex min-w-0 items-center gap-2.5">
          <span className="hidden items-center gap-1.5 text-[10px] text-white/35 sm:flex">
            <Broadcast size={11} aria-hidden />
            Especifique o dispositivo a ser tocado
          </span>
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-label={`Tocar em: ${current.name}`}
              className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/[0.07] px-2.5 py-1 text-[10px] text-white/75 transition-colors duration-200 hover:border-white/40 hover:bg-white/[0.13] hover:text-white"
            >
              <CurrentGlyph size={11} aria-hidden />
              {current.name}
              <CaretDown
                size={9}
                weight="bold"
                aria-hidden
                className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
              />
            </button>

            <AnimatePresence>
              {open && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute right-0 top-full z-20 mt-1.5 w-48 rounded-chip border border-white/[0.12] bg-ink-800 p-1 shadow-[0_24px_50px_-20px_rgba(0,0,0,1)]"
                >
                  {others.map((d) => {
                    const Glyph = d.icon;
                    return (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => {
                          onDevice(d.id);
                          setOpen(false);
                        }}
                        className="flex w-full items-center gap-2.5 rounded-chip px-2 py-1.5 text-left transition-colors duration-200 hover:bg-white/[0.08]"
                      >
                        <Glyph size={15} aria-hidden className="shrink-0 text-white/50" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[11px] text-white/80">
                            {d.name}
                          </span>
                          <span className="block truncate text-[9px] text-white/30">
                            {d.detail}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* capa + dados da playlist. gap-9 e nao gap-4 (a partir de sm:): o
          disco e absoluto, entao ele nao entra na conta do gap — 16px dele
          vazam pra fora da capa e comiam quase todo o respiro ate o texto.
          No celular a capa/disco encolhem (86px/74px -> 56px/44px) e o gap
          cai pra 3: sem isso a coluna de texto sobrava tao estreita que o
          nome da playlist truncava pra "Foc…" — ver medicao no comentario
          da altura da janela, mais acima em ConsoleWindow. */}
      <div className="relative flex items-end gap-3 px-4 pb-3 pt-4 sm:gap-9 sm:px-5 sm:pb-4 sm:pt-5">
        <div className="relative shrink-0">
          {/* O disco assoma so um pedaco por tras da capa. Duas caixas de
              proposito: a de fora POSICIONA (o -translate-y-1/2 que centraliza)
              e a de dentro GIRA. Juntar as duas era o bug do disco "caindo": o
              animate-spin do Tailwind escreve `transform: rotate(...)`, que
              apaga o translate — a cada volta o disco pulava meia altura pra
              baixo. */}
          <div
            className="absolute -right-2 top-1/2 h-8 w-8 -translate-y-1/2 sm:-right-4 sm:h-[74px] sm:w-[74px]"
            aria-hidden
          >
            <div
              // lowPower: disco para de girar — maquina fraca ja tem uma
              // demo inteira rodando (motion, timers), e um giro continuo de
              // 9s que ninguem esta cronometrando e o primeiro candidato a
              // sair (ver useLowPowerDevice em Features()).
              className={`relative h-full w-full rounded-full border border-white/[0.12] ${
                lowPower ? "" : "animate-spin"
              }`}
              style={{
                animationDuration: "9s",
                background:
                  "conic-gradient(from 180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.14), rgba(255,255,255,0.02))",
              }}
            >
              <span className="absolute inset-[10px] rounded-full border border-white/20 sm:inset-[29px]" />
            </div>
          </div>
          {/* bg-ink-800 sob o degrade: sem essa base opaca o disco aparecia
              ATRAVES da capa (o degrade e todo em branco transparente), que era
              a sobreposicao esquisita no meio da arte. */}
          <div
            className="relative flex h-14 w-14 items-center justify-center rounded-chip border border-white/[0.12] bg-ink-800 shadow-[0_18px_40px_-18px_rgba(0,0,0,1)] sm:h-[86px] sm:w-[86px]"
            style={{
              backgroundImage:
                "linear-gradient(145deg, rgba(255,255,255,0.16), rgba(255,255,255,0.03) 55%, rgba(255,255,255,0.09))",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brands/spotify.svg"
              alt=""
              width={26}
              height={26}
              aria-hidden
              className="h-4 w-4 brightness-0 invert opacity-80 sm:h-[26px] sm:w-[26px]"
            />
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35">
            Playlist
          </p>
          <p className="mt-1 truncate font-display text-lg font-semibold tracking-[-0.02em] text-white/95 sm:text-2xl">
            Foco Profundo
          </p>
          <p className="mt-1 truncate text-[11px] text-white/40">
            Jarvis · 24 músicas · 1 h 32 min
          </p>
        </div>

        <Heart
          size={19}
          weight="fill"
          aria-hidden
          className="shrink-0 text-white/30"
        />
      </div>

      {/* a fila. min-h-0 + overflow-hidden: se a janela do console encolher, e
          a lista que cede — sem isso ela empurraria a barra do tocador pra
          fora da moldura. */}
      <div className="relative min-h-0 flex-1 overflow-hidden px-4 pb-2 sm:px-5">
        <div className="flex items-center gap-3 border-b border-white/[0.07] pb-1.5 text-[9px] uppercase tracking-[0.14em] text-white/25">
          <span className="w-4 text-center">#</span>
          <span className="flex-1">Título</span>
          <span>Duração</span>
        </div>
        {SPOTIFY_TRACKS.map((t, i) => (
          <motion.div
            key={t.title}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35 + i * 0.1, duration: 0.35 }}
            className={`-mx-2 flex items-center gap-3 rounded-chip px-2 py-[7px] text-xs ${
              t.now ? "bg-white/[0.06]" : ""
            }`}
          >
            <span className="flex w-4 justify-center">
              {t.now ? (
                <EqBars />
              ) : (
                <span className="text-[11px] text-white/25">{i + 1}</span>
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span
                className={`block truncate ${t.now ? "text-white/90" : "text-white/60"}`}
              >
                {t.title}
              </span>
              <span className="block truncate text-[10px] text-white/30">
                {t.artist}
              </span>
            </span>
            <span className="shrink-0 text-[11px] text-white/25">{t.time}</span>
          </motion.div>
        ))}
      </div>

      {/* Barra do tocador, tudo numa linha so: controles, progresso e mixer. A
          faixa "saída de áudio" saiu daqui — quem diz onde o som esta tocando
          agora e o proprio seletor no topo da janela. Vao menor no celular e
          o mixer de volume some abaixo de sm: a largura fixa dele (w-36) nao
          sobrava depois dos controles + barra de progresso, que sao mais
          essenciais. */}
      <div className="relative flex items-center gap-2 border-t border-white/[0.08] bg-white/[0.02] px-4 py-2.5 sm:gap-4 sm:px-5 sm:py-3">
        <div className="flex shrink-0 items-center gap-2.5 text-white/45 sm:gap-4">
          <ShuffleAngular size={15} aria-hidden />
          <SkipBack size={17} weight="fill" aria-hidden className="text-white/70" />
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-ink-950 shadow-[0_4px_18px_-4px_rgba(255,255,255,0.5)] sm:h-9 sm:w-9">
            <Pause size={15} weight="fill" aria-hidden />
          </span>
          <SkipForward size={17} weight="fill" aria-hidden className="text-white/70" />
          <Repeat size={15} aria-hidden />
        </div>

        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          <span className="shrink-0 text-[10px] tabular-nums text-white/35">
            1:42
          </span>
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/[0.1]">
            <motion.div
              initial={{ width: "22%" }}
              animate={{ width: "68%" }}
              transition={{ duration: 2.4, ease: [0.16, 1, 0.3, 1] }}
              className="h-full rounded-full bg-white/70"
            />
          </div>
          <span className="shrink-0 text-[10px] tabular-nums text-white/35">
            3:58
          </span>
        </div>

        {/* mixer, vizinho do progresso na mesma linha — so a partir de sm: */}
        <div className="hidden w-36 shrink-0 items-center gap-2 sm:flex">
          <SpeakerLow size={14} aria-hidden className="shrink-0 text-white/40" />
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
            className="w-7 shrink-0 text-right text-[10px] tabular-nums text-white/40"
          >
            30%
          </motion.span>
        </div>
      </div>
    </div>
  );
}

const WHATS_TEXT = "Estarei lá em 15 minutos.";
const WHATS_CHARS = Array.from(WHATS_TEXT);

// Papel de parede da conversa. A 1a versao era a grade de rabiscos do app, mas
// os icones brigavam com os baloes; agora e uma textura de trama (duas series
// de fios finos cruzados) com um brilho suave descendo do topo — le como
// "papel de parede de conversa" sem virar desenho, e some atras do texto.
function WhatsWallpaper() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, rgba(255,255,255,0.03) 0 1px, transparent 1px 10px), repeating-linear-gradient(-45deg, rgba(255,255,255,0.022) 0 1px, transparent 1px 10px)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 85% 55% at 50% 0%, rgba(255,255,255,0.05), transparent 70%)",
        }}
      />
    </div>
  );
}

// Balao de mensagem: a hora (e os dois tiques, quando e sua) mora DENTRO do
// balao, no canto inferior direito — e assim no app, e era o detalhe que mais
// faltava aqui. O pr-* extra abre o vao pra essa etiqueta nao encostar no
// texto, e o "rabinho" e o canto reto virado pro lado de quem falou.
function WhatsBubble({
  mine,
  time,
  delay,
  children,
  meta,
}: {
  mine?: boolean;
  time: string;
  delay: number;
  children: React.ReactNode;
  meta?: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      // fundo solido (ink-600/700 da escala) em vez de branco translucido: por
      // cima da textura do papel de parede o balao transparente deixava a
      // trama aparecer atras do texto e sujava a leitura.
      className={`relative max-w-[76%] rounded-lg px-3 py-2 text-sm leading-relaxed text-white/90 ${
        mine
          ? "ml-auto rounded-br-none bg-ink-600 pr-[4.25rem]"
          : "mr-auto rounded-bl-none bg-ink-700 pr-11"
      }`}
    >
      {/* rabinho do balao */}
      <span
        aria-hidden
        className={`absolute bottom-0 h-2.5 w-2.5 ${
          mine
            ? "-right-[9px] bg-ink-600 [clip-path:polygon(0_0,0_100%,100%_0)]"
            : "-left-[9px] bg-ink-700 [clip-path:polygon(100%_0,100%_100%,0_0)]"
        }`}
      />
      {children}
      {/* absoluto (e nao float) pra hora ficar colada no canto de baixo do
          balao; o pr-* la em cima e o vao reservado pra ela. */}
      <span className="absolute bottom-1.5 right-2.5 flex items-center gap-1 text-[10px] text-white/40">
        {time}
        {meta}
      </span>
    </motion.div>
  );
}

// Grupo de acoes do WhatsApp (video + ligacao no topo, anexo + camera na
// barra de baixo): UM card so abrigando os dois icones — nao um card pra cada,
// que picotava a barra. Raio full (e nao chip) pra casar com a pilula da caixa
// de mensagem, que e a vizinha direta dele na barra de baixo.
function WhatsActions({
  items,
  size,
  box,
}: {
  items: { icon: Icon; rotate?: boolean }[];
  size: number;
  box: string;
}) {
  return (
    <div className="flex shrink-0 items-center gap-0.5 rounded-full border border-white/[0.09] bg-white/[0.05] p-1 text-white/45">
      {items.map(({ icon: Glyph, rotate }, i) => (
        <span key={i} className={`flex items-center justify-center ${box}`}>
          <Glyph
            size={size}
            weight="fill"
            aria-hidden
            className={rotate ? "-rotate-45" : undefined}
          />
        </span>
      ))}
    </div>
  );
}

// A cena do WhatsApp e uma sequencia, nao um monte de delays soltos: a frase e
// DIGITADA na caixa de escrever, o botao de enviar pulsa, e so entao a
// mensagem cai no chat (com um tique, depois dois). Cada fase e um estado, e
// os tempos abaixo sao a linha do tempo inteira em segundos — mexer num numero
// aqui move a cena toda junto.
type WhatsPhase = "idle" | "typing" | "pulse" | "sent" | "read";

const TYPE_START = 0.9; // a caixa comeca a ser preenchida
const TYPE_CHAR_MS = 46; // uma LETRA a cada — antes era uma palavra inteira
const TYPE_END = TYPE_START + (WHATS_CHARS.length * TYPE_CHAR_MS) / 1000;
const PULSE_AT = TYPE_END + 0.2;
const SEND_AT = PULSE_AT + 0.45;
const READ_AT = SEND_AT + 0.7;

function WhatsAppViz() {
  const [phase, setPhase] = useState<WhatsPhase>("idle");
  const [typed, setTyped] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase("typing"), TYPE_START * 1000),
      setTimeout(() => setPhase("pulse"), PULSE_AT * 1000),
      setTimeout(() => setPhase("sent"), SEND_AT * 1000),
      setTimeout(() => setPhase("read"), READ_AT * 1000),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  // Maquina de escrever: uma letra por tique enquanto a fase e "typing". Ao
  // sair dela a frase e completada de uma vez, pra nenhuma sobra de letra ficar
  // faltando se o intervalo e o cronometro desencontrarem por um frame.
  useEffect(() => {
    if (phase === "idle") return;
    if (phase !== "typing") {
      setTyped(WHATS_CHARS.length);
      return;
    }
    const id = setInterval(() => {
      setTyped((n) => {
        if (n >= WHATS_CHARS.length) return n;
        return n + 1;
      });
    }, TYPE_CHAR_MS);
    return () => clearInterval(id);
  }, [phase]);

  const typing = phase === "typing" || phase === "pulse";
  const delivered = phase === "sent" || phase === "read";
  const done = typed >= WHATS_CHARS.length;

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-white/[0.08] bg-ink-950">
      {/* HUD do topo, na ordem do app: voltar, foto, nome + status, e os
          atalhos de chamada de video, ligacao e menu. */}
      <div className="flex items-center gap-3 border-b border-white/[0.08] bg-white/[0.03] px-4 py-3">
        <CaretLeft
          size={16}
          weight="bold"
          aria-hidden
          className="shrink-0 text-white/35"
        />
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/[0.12] bg-white/[0.06] text-xs font-semibold text-white/80">
          L
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-white/85">Lucas</p>
          {/* o status acompanha a cena: vira "digitando…" enquanto a frase
              esta sendo escrita, como no app de verdade */}
          <p className="flex items-center gap-1.5 text-[11px] text-white/40">
            <span className="led-dot" aria-hidden />
            {typing ? "digitando…" : "online"}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <WhatsActions
            items={[{ icon: VideoCamera }, { icon: Phone }]}
            size={19}
            box="h-7 w-8"
          />
          <DotsThreeVertical
            size={16}
            weight="bold"
            aria-hidden
            className="ml-0.5 text-white/35"
          />
        </div>
      </div>

      <div className="relative flex flex-1 flex-col justify-end gap-2 overflow-hidden px-4 pb-3 pt-4">
        <WhatsWallpaper />

        {/* etiqueta de data + aviso de criptografia: os dois primeiros
            elementos de qualquer conversa aberta no app */}
        <div className="relative mb-1 space-y-2 text-center">
          <span className="inline-block rounded-md bg-white/[0.06] px-2.5 py-1 text-[10px] uppercase tracking-[0.1em] text-white/35">
            Hoje
          </span>
          <p className="mx-auto flex max-w-[85%] items-center justify-center gap-1.5 rounded-md bg-white/[0.04] px-3 py-1.5 text-[10px] leading-snug text-white/30">
            <LockSimple
              size={10}
              weight="fill"
              aria-hidden
              className="shrink-0"
            />
            As mensagens são protegidas com criptografia de ponta a ponta.
          </p>
        </div>

        <div className="relative flex flex-col gap-2">
          <WhatsBubble time="14:02" delay={0}>
            Bora sair daqui a pouco?
          </WhatsBubble>

          <WhatsBubble time="14:03" delay={0.4}>
            Alguma novidade? 👀
          </WhatsBubble>

          {/* so entra no chat depois que o botao de enviar pulsa */}
          {delivered && (
            <WhatsBubble
              mine
              time="14:03"
              delay={0}
              meta={
                phase === "read" ? (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="flex"
                  >
                    <Checks
                      size={13}
                      weight="bold"
                      aria-hidden
                      className="text-white/60"
                    />
                  </motion.span>
                ) : (
                  <Check
                    size={12}
                    weight="bold"
                    aria-hidden
                    className="text-white/35"
                  />
                )
              }
            >
              {WHATS_TEXT}
            </WhatsBubble>
          )}
        </div>
      </div>

      {/* barra de escrever: a caixa de texto termina antes; o anexo e a camera
          moram num card proprio, do lado de fora dela, e depois vem o botao
          redondo de enviar. E aqui que a frase e digitada antes de virar
          mensagem. */}
      <div className="flex items-center gap-2 border-t border-white/[0.08] bg-white/[0.02] px-3 py-2.5">
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.04] px-3 py-2">
          <Smiley size={16} aria-hidden className="shrink-0 text-white/30" />
          <span className="min-w-0 flex-1 truncate text-xs">
            {typing ? (
              // cada letra entra por conta propria (opacidade + um empurrao de
              // 2px), entao a frase parece batida na tecla em vez de aparecer
              // em blocos. O cursor so pisca quando a digitacao acaba — durante
              // ela ele fica aceso, como um cursor de verdade.
              <span className="text-white/85">
                {WHATS_CHARS.slice(0, typed).map((ch, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 2 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.12, ease: "easeOut" }}
                    className="inline-block whitespace-pre"
                  >
                    {ch}
                  </motion.span>
                ))}
                <span
                  className={`ml-px inline-block h-3 w-[1.5px] translate-y-[2px] bg-white/70 ${
                    done ? "caret-blink" : ""
                  }`}
                />
              </span>
            ) : (
              <span className="text-white/25">Mensagem</span>
            )}
          </span>
        </div>

        <WhatsActions
          items={[{ icon: Paperclip, rotate: true }, { icon: Camera }]}
          size={19}
          box="h-7 w-8"
        />

        {/* o botao dá o pulso no instante em que a mensagem sai: a bolinha
            cresce e volta e um anel se abre por fora dela. Enquanto nao ha
            texto o icone e o microfone, como no app. */}
        <motion.span
          animate={phase === "pulse" ? { scale: [1, 1.22, 1] } : { scale: 1 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/[0.14] bg-white/[0.1]"
        >
          {phase === "pulse" && (
            <motion.span
              aria-hidden
              initial={{ scale: 1, opacity: 0.75 }}
              animate={{ scale: 1.9, opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="absolute inset-0 rounded-full border border-white/45"
            />
          )}
          {typing ? (
            <PaperPlaneTilt
              size={15}
              weight="fill"
              aria-hidden
              className="text-white/80"
            />
          ) : (
            <Microphone
              size={15}
              weight="fill"
              aria-hidden
              className="text-white/50"
            />
          )}
        </motion.span>
      </div>
    </div>
  );
}

// ---- Git ------------------------------------------------------------------
// A demo mais "cinematografica" das sete, e de proposito: aqui o terminal e o
// protagonista (ocupa a largura inteira, em cima), e os dois paineis de baixo
// — o que mudou e o historico em grafo — REAGEM ao que o terminal acabou de
// rodar, em vez de aparecerem por conta propria num tempo qualquer.
//
// A cena e um roteiro: cada entrada tem um tipo e uma duracao, e as horas de
// entrada saem somadas dai (GIT_STARTS). Mexer numa duracao reacomoda tudo o
// que vem depois, sem numero magico espalhado pelo JSX.

type GitEntry = {
  kind: "cmd" | "out" | "bar" | "ok";
  text: string;
};

const GIT_SCRIPT: GitEntry[] = [
  { kind: "cmd", text: "git clone github.com/você/projeto.git" },
  { kind: "out", text: "Cloning into 'projeto'…" },
  { kind: "bar", text: "Receiving objects: 100% (312/312)" },
  { kind: "cmd", text: 'git add . && git commit -m "feat: filtros do carrinho"' },
  { kind: "out", text: "[main a1b2c3d] 3 arquivos alterados, +47 −12" },
  { kind: "cmd", text: "git push origin main" },
  { kind: "bar", text: "Writing objects: 100% (27/27)" },
  { kind: "ok", text: "main → main · tudo enviado" },
];

// indices que os paineis de baixo observam
const GIT_COMMIT_CMD = 3;
const GIT_COMMIT_OUT = 4;

const GIT_CHAR = 0.014; // segundos por letra digitada
const GIT_BAR_FILL = 0.6;

const gitDuration = (e: GitEntry) =>
  e.kind === "cmd"
    ? 0.1 + e.text.length * GIT_CHAR
    : e.kind === "bar"
    ? GIT_BAR_FILL + 0.05
    : e.kind === "ok"
    ? 0.35
    : 0.3;

const GIT_STARTS: number[] = [];
const GIT_END = GIT_SCRIPT.reduce((t, e) => {
  GIT_STARTS.push(t);
  return t + gitDuration(e);
}, 0.2);

const GIT_FILES = [
  { name: "src/app.ts", status: "M", add: 32, del: 4 },
  { name: "src/utils.ts", status: "M", add: 10, del: 6 },
  { name: "README.md", status: "A", add: 5, del: 2 },
];

const GIT_LOG = [
  { hash: "a1b2c3d", msg: "feat: filtros do carrinho", when: "agora", fresh: true },
  { hash: "9f4e8b2", msg: "fix: total do pedido", when: "2 min" },
  { hash: "77c1a90", msg: "chore: limpa imports", when: "5 min" },
];

// Comando batido letra por letra. Monta na hora certa (o pai so renderiza a
// linha quando chega a vez dela), entao a digitacao comeca junto com o mount e
// nao precisa carregar atraso proprio. O cursor cheio acompanha as letras e
// some quando a linha termina — quem pisca e so o prompt final.
function GitTyped({ text }: { text: string }) {
  const [n, setN] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setN((v) => {
        if (v >= text.length) {
          clearInterval(id);
          return v;
        }
        return v + 1;
      });
    }, GIT_CHAR * 1000);
    return () => clearInterval(id);
  }, [text]);

  return (
    <p className="break-all text-white/90">
      <span className="text-white/45">$</span> {text.slice(0, n)}
      {n < text.length && (
        <span className="ml-px inline-block h-3 w-[6px] translate-y-[1px] bg-white/80" />
      )}
    </p>
  );
}

// Rotulo e barra na MESMA linha: em duas linhas as duas barras do roteiro
// custavam ~30px cada, e o terminal passava da altura da moldura (a ultima
// linha, o prompt piscando, ficava cortada).
function GitBar({ text }: { text: string }) {
  return (
    <p className="flex items-center gap-2 text-white/40">
      <CloudArrowUp size={12} aria-hidden className="shrink-0" />
      <span className="shrink-0">{text}</span>
      <span className="h-1 w-24 shrink-0 overflow-hidden rounded-full bg-white/[0.1]">
        <motion.span
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: GIT_BAR_FILL, ease: [0.16, 1, 0.3, 1] }}
          className="block h-full rounded-full bg-white/70"
        />
      </span>
    </p>
  );
}

function GitViz({ lowPower }: { lowPower: boolean }) {
  // quantas entradas do roteiro ja entraram em cena
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const timers = GIT_STARTS.map((s, i) =>
      setTimeout(() => setStep(i + 1), s * 1000)
    );
    timers.push(setTimeout(() => setDone(true), GIT_END * 1000));
    return () => timers.forEach(clearTimeout);
  }, []);

  const staged = step > GIT_COMMIT_CMD;
  const committed = step > GIT_COMMIT_OUT;

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-white/[0.08] bg-ink-950">
      {/* cabecalho do repositorio */}
      <div className="flex shrink-0 items-center gap-2.5 border-b border-white/[0.08] bg-white/[0.02] px-4 py-2">
        <FolderSimple size={15} weight="fill" aria-hidden className="shrink-0 text-white/35" />
        <span className="text-xs text-white/70">projeto</span>
        <span className="flex items-center gap-1.5 rounded-full border border-white/[0.1] bg-white/[0.04] px-2.5 py-1 text-[11px] text-white/55">
          <GitBranch size={12} aria-hidden />
          main
        </span>

        {/* o estado do repo conta a historia sozinho: trabalhando → 3 commits
            na frente do servidor → sincronizado */}
        <div className="ml-auto text-[11px]">
          <AnimatePresence mode="wait">
            {done ? (
              <motion.span
                key="sync"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center gap-1.5 rounded-full border border-white/25 bg-white/[0.08] px-2.5 py-1 text-white/85"
              >
                <CheckCircle size={12} weight="fill" aria-hidden />
                sincronizado
              </motion.span>
            ) : committed ? (
              <motion.span
                key="ahead"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.25 }}
                className="flex items-center gap-1 rounded-full border border-white/[0.14] bg-white/[0.05] px-2.5 py-1 text-white/60"
              >
                <ArrowUp size={11} weight="bold" aria-hidden />3 à frente
              </motion.span>
            ) : (
              <motion.span
                key="work"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.25 }}
                className="flex items-center gap-1.5 rounded-full border border-white/[0.1] bg-white/[0.03] px-2.5 py-1 text-white/40"
              >
                <ArrowsClockwise
                  size={11}
                  weight="bold"
                  aria-hidden
                  // lowPower: para de girar — mesmo raciocinio do disco do
                  // Spotify, ver comentario la.
                  className={lowPower ? "" : "animate-spin"}
                  style={{ animationDuration: "1.6s" }}
                />
                trabalhando
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ---- o terminal, agora ocupando a largura inteira ----
          flex-[1.6] (era 1.35): pedido do usuario foi encolher os paineis
          de baixo (Alteracoes/Historico) pra caber TUDO na altura do
          cartao — a fatia que sobra vai pro terminal, que e onde moram os
          comandos (o "codigo" do Git), reduzindo o risco dele cortar linha
          por falta de espaco. */}
      <div className="flex min-h-0 flex-[1.6] flex-col border-b border-white/[0.08]">
        <div className="flex shrink-0 items-center gap-2 border-b border-white/[0.06] bg-white/[0.02] px-4 py-1.5">
          <span className="flex gap-1.5" aria-hidden>
            <span className="h-2 w-2 rounded-full bg-white/15" />
            <span className="h-2 w-2 rounded-full bg-white/15" />
            <span className="h-2 w-2 rounded-full bg-white/15" />
          </span>
          <span className="ml-1 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-white/30">
            <Terminal size={12} aria-hidden />
            bash — projeto
          </span>
        </div>

        <div className="min-h-0 flex-1 space-y-1 overflow-hidden px-4 py-2.5 font-mono text-[11.5px] leading-snug">
          {GIT_SCRIPT.slice(0, step).map((entry, i) => {
            if (entry.kind === "cmd") return <GitTyped key={i} text={entry.text} />;
            if (entry.kind === "bar") return <GitBar key={i} text={entry.text} />;
            return (
              <motion.p
                key={i}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25 }}
                className={
                  entry.kind === "ok"
                    ? "flex items-center gap-1.5 text-white/70"
                    : "text-white/35"
                }
              >
                {entry.kind === "ok" && (
                  <CheckCircle size={12} weight="fill" aria-hidden />
                )}
                {entry.text}
              </motion.p>
            );
          })}

          {done && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="text-white/90"
            >
              <span className="text-white/45">$</span>{" "}
              <span className="caret-blink inline-block h-3 w-[6px] translate-y-[1px] bg-white/80" />
            </motion.p>
          )}
        </div>
      </div>

      {/* ---- os dois paineis, reagindo ao terminal ----
          No celular so o de "Alterações" fica de pe, ocupando a largura
          inteira — os dois lado a lado (w-1/2 cada) nao sobravam espaco
          nenhum pra nome de arquivo ou numero, e o "Histórico" media, medido
          num iPhone comum, sumia por completo (0px de largura util depois do
          nome do commit truncar). O terminal acima ja narra a historia
          inteira (os 3 comandos, incluindo o push); o footer da janela (mais
          abaixo) tambem resume "3 commits hoje" — entao cortar Histórico no
          celular nao perde informacao nova, so a redundancia visual.
          flex-[0.85] (era 1, o padrao): pedido do usuario foi encolher
          justo esta faixa — py-3 virou py-2, mb-2 virou mb-1.5 — pra abrir
          espaco pro terminal acima (ver flex-[1.6] la em cima) sem cortar
          nenhuma linha dos dois paineis. */}
      <div className="flex min-h-0 flex-[0.85]">
        <div className="flex w-full shrink-0 flex-col overflow-hidden px-4 py-2 sm:w-1/2 sm:border-r sm:border-white/[0.06]">
          <p className="mb-1.5 flex items-center gap-1.5 text-[9px] uppercase tracking-[0.14em] text-white/25">
            Alterações
            <motion.span
              initial={false}
              animate={{ opacity: staged ? 1 : 0.35 }}
              className="rounded-full bg-white/[0.08] px-1.5 py-px text-[9px] text-white/45"
            >
              {staged ? GIT_FILES.length : 0}
            </motion.span>
          </p>
          <div className="space-y-1">
            {GIT_FILES.map((f, i) => (
              <motion.div
                key={f.name}
                initial={{ opacity: 0, x: -8 }}
                animate={staged ? { opacity: 1, x: 0 } : { opacity: 0, x: -8 }}
                transition={{
                  delay: staged ? i * 0.09 : 0,
                  duration: 0.3,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="flex items-center gap-2 text-[11px]"
              >
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded border border-white/[0.12] bg-white/[0.05] font-mono text-[9px] text-white/60">
                  {f.status}
                </span>
                <span className="min-w-0 flex-1 truncate font-mono text-white/60">
                  {f.name}
                </span>
                <span className="shrink-0 font-mono text-[10px] text-white/70">
                  +{f.add}
                </span>
                <span className="shrink-0 font-mono text-[10px] text-white/30">
                  −{f.del}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* historico em grafo: o fio ligando os commits e o que faz isso
            parecer Git, e nao uma lista qualquer. O commit de cima so nasce
            quando o terminal termina o commit de verdade. hidden no celular
            — ver comentario grande no painel "Alterações", ao lado. */}
        <div className="hidden min-w-0 flex-1 overflow-hidden px-4 py-2 sm:block">
          <p className="mb-1.5 text-[9px] uppercase tracking-[0.14em] text-white/25">
            Histórico
          </p>
          <div className="relative pl-1">
            <span
              aria-hidden
              className="absolute bottom-3 left-[7px] top-2 w-px bg-white/[0.12]"
            />
            {GIT_LOG.map((c, i) => (
              <motion.div
                key={c.hash}
                initial={{ opacity: 0, x: -6 }}
                animate={
                  c.fresh && !committed
                    ? { opacity: 0, x: -6 }
                    : { opacity: 1, x: 0 }
                }
                transition={{
                  delay: c.fresh ? 0 : 0.4 + i * 0.1,
                  duration: 0.35,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="relative flex gap-2.5 pb-2"
              >
                <span
                  className={`relative z-10 mt-[3px] h-[7px] w-[7px] shrink-0 rounded-full ring-4 ring-ink-950 ${
                    c.fresh ? "bg-white" : "bg-white/30"
                  }`}
                  aria-hidden
                />
                <span className="min-w-0 flex-1">
                  <span
                    className={`block truncate text-[11px] ${
                      c.fresh ? "text-white/90" : "text-white/55"
                    }`}
                  >
                    {c.msg}
                  </span>
                  <span className="block truncate font-mono text-[9px] text-white/25">
                    {c.hash} · {c.when}
                  </span>
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 border-t border-white/[0.08] bg-white/[0.02] px-4 py-2 text-[11px] text-white/40">
        <GitCommit size={13} aria-hidden />3 commits hoje
        <span className="text-white/20">·</span>
        <span className="font-mono text-white/60">+47</span>
        <span className="font-mono text-white/25">−12</span>
        <span className="ml-auto flex items-center gap-1.5 text-white/30">
          <GitPullRequest size={12} aria-hidden />
          origin/main
        </span>
      </div>
    </div>
  );
}

// As abas da propria pagina de resultados do Google (Todos / Imagens / ...),
// nao as abas do navegador — e um dos pedacos mais reconheciveis da tela.
const GOOGLE_TABS = ["Todos", "Imagens", "Notícias", "Vídeos", "Ferramentas"];

const CHROME_RESULTS = [
  {
    site: "Investing.com",
    url: "investing.com › currencies › usd-brl",
    title: "Cotação Dólar Comercial (USD/BRL) hoje",
    desc: "Acompanhe a cotação do dólar comercial em tempo real, com gráfico e variação do dia.",
  },
  {
    site: "Banco Central",
    url: "bcb.gov.br › conversao",
    title: "Conversor de moedas — Banco Central do Brasil",
    desc: "Converta valores pela taxa de câmbio oficial divulgada pelo Banco Central.",
  },
];

function ChromeViz() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-white/[0.08] bg-ink-950">
      {/* aba do navegador */}
      <div className="flex items-center gap-1.5 bg-white/[0.02] px-3 pt-2.5">
        <div className="flex min-w-0 max-w-[62%] items-center gap-2 rounded-t-md bg-white/[0.06] px-3 py-1.5 text-[11px] text-white/70">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brands/google.svg"
            alt=""
            width={11}
            height={11}
            aria-hidden
            className="h-[11px] w-[11px] shrink-0 brightness-0 invert opacity-70"
          />
          <span className="truncate">
            preço do dólar hoje - Pesquisa Google
          </span>
          <X
            size={9}
            weight="bold"
            aria-hidden
            className="shrink-0 text-white/30"
          />
        </div>
        <Plus size={12} aria-hidden className="shrink-0 text-white/25" />
      </div>

      {/* barra de navegacao: voltar, avancar, recarregar e a omnibox */}
      <div className="relative flex items-center gap-3 border-b border-white/[0.06] bg-white/[0.02] px-3 py-2">
        <div className="flex shrink-0 items-center gap-2.5 text-white/30">
          <CaretLeft size={13} weight="bold" aria-hidden />
          <CaretRight
            size={13}
            weight="bold"
            aria-hidden
            className="text-white/15"
          />
          <ArrowClockwise size={12} weight="bold" aria-hidden />
        </div>
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.05] px-3 py-1.5 text-xs text-white/45">
          <LockSimple
            size={11}
            weight="fill"
            aria-hidden
            className="shrink-0 text-white/30"
          />
          <span className="truncate">
            google.com/search?q=preço+do+dólar+hoje
          </span>
          <Star
            size={12}
            aria-hidden
            className="ml-auto shrink-0 text-white/25"
          />
        </div>
        <DotsThreeVertical
          size={14}
          weight="bold"
          aria-hidden
          className="shrink-0 text-white/25"
        />
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          style={{ transformOrigin: "left" }}
          className="absolute inset-x-0 bottom-0 h-[2px] bg-white/40"
        />
      </div>

      {/* ---- a pagina do Google ---- */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* cabecalho: logo + campo de busca com a pergunta digitada. No
            celular a wordmark "Google" some (fica so o G) e o campo de busca
            perde os icones secundarios (limpar, divisor, microfone) — medido:
            com os quatro icones fixos + padding, sobravam ~48px pro texto da
            pergunta numa tela de 375px, truncando pra "pre…" ja na 4a letra.
            So a lupa fica, e o texto ganha o resto do campo. */}
        <div className="flex items-center gap-2.5 px-4 pb-2.5 pt-4 sm:gap-4 sm:px-5">
          <span className="flex shrink-0 items-center gap-1.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brands/google.svg"
              alt=""
              width={16}
              height={16}
              aria-hidden
              className="h-4 w-4 brightness-0 invert opacity-80"
            />
            <span className="hidden font-display text-lg font-semibold tracking-[-0.03em] text-white/85 sm:inline">
              Google
            </span>
          </span>
          <div className="flex min-w-0 flex-1 items-center gap-2.5 rounded-full border border-white/[0.1] bg-white/[0.04] px-4 py-2 shadow-[0_2px_10px_-6px_rgba(0,0,0,0.9)]">
            <span className="min-w-0 flex-1 truncate text-xs text-white/75">
              preço do dólar hoje
            </span>
            <X
              size={11}
              weight="bold"
              aria-hidden
              className="hidden shrink-0 text-white/25 sm:block"
            />
            <span aria-hidden className="hidden h-4 w-px shrink-0 bg-white/10 sm:block" />
            <Microphone
              size={13}
              weight="fill"
              aria-hidden
              className="hidden shrink-0 text-white/40 sm:block"
            />
            <MagnifyingGlass
              size={13}
              weight="bold"
              aria-hidden
              className="shrink-0 text-white/50"
            />
          </div>
        </div>

        {/* abas da busca + contagem de resultados. No celular so as 3
            primeiras abas cabem sem espremer — Videos/Ferramentas somem (a
            5a, "Ferramentas", estourava a borda da janela e ficava cortada
            na metade). */}
        <div
          className="flex items-center gap-3 border-b border-white/[0.06] px-4 text-[11px] sm:gap-5 sm:px-5"
          aria-hidden
        >
          {GOOGLE_TABS.map((t, i) => (
            <span
              key={t}
              className={`pb-2 ${i >= 3 ? "hidden sm:inline" : ""} ${
                i === 0
                  ? "border-b-2 border-white/70 font-medium text-white/85"
                  : "text-white/30"
              }`}
            >
              {t}
            </span>
          ))}
        </div>
        <p className="px-4 pt-2 text-[10px] text-white/25 sm:px-5">
          Aproximadamente 38.400.000 resultados (0,42 segundos)
        </p>

        <div className="flex-1 space-y-3 overflow-hidden px-4 pb-4 pt-2.5 sm:px-5">
          {/* o quadro de cotacao que o Google mostra no topo */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="rounded-lg border border-white/[0.1] bg-white/[0.03] px-4 py-3"
          >
            <p className="text-[11px] text-white/40">
              1 Dólar americano é igual a
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-3">
              <p className="font-display text-xl font-semibold tracking-[-0.02em] text-white/90">
                5,42 Real brasileiro
              </p>
              <span className="flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-medium text-white/80">
                <TrendUp size={11} aria-hidden />
                +0,3%
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
            <p className="mt-1.5 text-[10px] text-white/25">
              14:03 · Dados de câmbio · Aviso legal
            </p>
          </motion.div>

          {/* resultados organicos, no formato do Google: favicon + site +
              caminho, titulo e o trecho embaixo */}
          {CHROME_RESULTS.map((r, i) => (
            <motion.div
              key={r.url}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 + i * 0.15, duration: 0.3 }}
            >
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.05]">
                  <GlobeSimple
                    size={10}
                    aria-hidden
                    className="text-white/40"
                  />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[11px] leading-tight text-white/55">
                    {r.site}
                  </span>
                  <span className="block truncate text-[10px] leading-tight text-white/25">
                    {r.url}
                  </span>
                </span>
              </div>
              <p className="mt-1 truncate text-[13px] text-white/80">
                {r.title}
              </p>
              <p className="line-clamp-1 text-[11px] text-white/30">{r.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---- Windows --------------------------------------------------------------
// A conta e por IMAGEM, de proposito, sem nenhum comando escrito — e uma
// area de trabalho de verdade, com janelas que somem e nascem na sua frente
// e uma barra de tarefas embaixo onde a luzinha de "rodando" apaga num app e
// acende no outro. A versao anterior tinha um terminal (PowerShell) com os
// comandos digitados como "prova" — saiu de vez (pedido do usuario): nem
// todo visitante entende `Stop-Process -Name spotify`, e a cena virava uma
// aula de linha de comando em vez de so mostrar "ele fecha e abre um app".
// As janelas (WinWindow, mais abaixo) ja contam essa historia sozinhas —
// icone, nome, conteudo fake por dentro, "fechado" escrito por extenso.

const WIN_CLOSE_AT = 1.1; // a janela do Spotify some
const WIN_OPEN_AT = 2.0; // a do Chrome nasce

// Barra de tarefas: seis apps. Os dois do comando trocam de estado; os outros
// quatro ficam ali parados de propósito — sao eles que dizem "podia ser
// qualquer um destes".
const WIN_TASKBAR: {
  brand: string;
  name: string;
  role?: "closes" | "opens";
}[] = [
  { brand: "/brands/spotify.svg", name: "Spotify", role: "closes" },
  { brand: "/brands/google-chrome.svg", name: "Chrome", role: "opens" },
  { brand: "/brands/steam.svg", name: "Steam" },
  { brand: "/brands/discord.svg", name: "Discord" },
  { brand: "/brands/notion.svg", name: "Notion" },
  { brand: "/brands/telegram.svg", name: "Telegram" },
];

// Uma janela na area de trabalho. `live` e o estado do programa: aberto vira
// uma janela solida com conteudo; fechado vira um contorno tracejado com o
// nome apagado. Sao os dois extremos do mesmo quadro, entao a troca de um pro
// outro le como "o programa abriu" / "o programa fechou" sem legenda nenhuma.
function WinWindow({
  brand,
  name,
  live,
  children,
}: {
  brand: string;
  name: string;
  live: boolean;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      animate={{ opacity: live ? 1 : 0.45, scale: live ? 1 : 0.97 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className={`flex min-w-0 flex-1 flex-col overflow-hidden rounded-chip border ${
        live
          ? "border-white/[0.14] bg-ink-800 shadow-[0_18px_40px_-24px_rgba(0,0,0,1)]"
          : "border-dashed border-white/[0.14] bg-white/[0.015]"
      }`}
    >
      <div
        className={`flex items-center gap-2 px-3 py-2 ${
          live ? "border-b border-white/[0.08] bg-white/[0.03]" : ""
        }`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={brand}
          alt=""
          width={13}
          height={13}
          aria-hidden
          className={`h-[13px] w-[13px] shrink-0 brightness-0 invert ${
            live ? "opacity-90" : "opacity-35"
          }`}
        />
        <span
          className={`min-w-0 flex-1 truncate text-[11px] ${
            live ? "text-white/80" : "text-white/40"
          }`}
        >
          {name}
        </span>
        {/* botoes de minimizar/maximizar/fechar: SEMPRE visiveis agora (nao
            mais so a partir de sm:) — o terminal/PowerShell saiu de vez da
            demo (pedido do usuario: nem todo mundo entende comando, e a
            cena tinha virado a prova em vez de so as janelas), entao sobrou
            altura de sobra tambem no celular pra janela mostrar tudo. */}
        {live ? (
          <span className="flex shrink-0 items-center gap-2 text-white/30" aria-hidden>
            <span className="h-px w-2 bg-current" />
            <span className="h-2 w-2 border border-current" />
            <X size={9} weight="bold" />
          </span>
        ) : (
          <span className="flex shrink-0 items-center gap-1 text-[9px] uppercase tracking-[0.1em] text-white/35">
            <X size={9} weight="bold" aria-hidden />
            fechado
          </span>
        )}
      </div>

      {/* pre-visualizar o CONTEUDO da janela (as barrinhas fake, o
          equalizador...): SEMPRE visivel agora, em qualquer tela — ver
          comentario acima. */}
      <div className="relative min-h-0 flex-1 p-3">
        <AnimatePresence mode="wait">
          {live ? (
            <motion.div
              key="on"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="h-full"
            >
              {children}
            </motion.div>
          ) : (
            <motion.div
              key="off"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.25 }}
              className="flex h-full items-center justify-center"
            >
              <span className="text-[10px] text-white/20">janela encerrada</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function WindowsViz() {
  const [closed, setClosed] = useState(false);
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    const timers = [
      setTimeout(() => setClosed(true), WIN_CLOSE_AT * 1000),
      setTimeout(() => setOpened(true), WIN_OPEN_AT * 1000),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-white/[0.08] bg-ink-950">
      <div className="flex items-center gap-2.5 border-b border-white/[0.08] bg-white/[0.02] px-4 py-2.5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brands/windows.svg"
          alt=""
          width={14}
          height={14}
          aria-hidden
          className="h-[14px] w-[14px] shrink-0 brightness-0 invert opacity-70"
        />
        <span className="text-xs text-white/70">Windows 11 Pro</span>
        {/* "· build 26100" e "Área de trabalho" somem no celular: com o
            nome do Windows sozinho ja ocupando boa parte da linha, os dois
            juntos quebravam a barra em 2 linhas — ver print que motivou
            esta rodada de ajustes mobile. */}
        <span className="hidden text-[11px] text-white/25 sm:inline">· build 26100</span>
        <span className="ml-auto hidden text-[10px] uppercase tracking-[0.14em] text-white/25 sm:inline">
          Área de trabalho
        </span>
      </div>

      {/* ---- a mesa: duas janelas trocando de estado ----
          O PowerShell que morava aqui embaixo saiu de vez (pedido do
          usuario): comandos digitados sao "coisa de codigo", e nem todo
          visitante entende o que "Stop-Process -Name spotify" quer dizer —
          a cena tinha virado a PROVA em vez de so as janelas abrindo e
          fechando, que ja contam a historia sozinhas (icone claro, nome do
          app, conteudo fake por dentro, "fechado" escrito por extenso). Sem
          o terminal disputando altura, as duas janelas agora ocupam o
          espaco INTEIRO (flex-1 fixo, sem fracao — nao precisa mais de
          breakpoint proprio pro celular). */}
      <div
        className="relative flex min-h-0 flex-1 gap-3 p-4"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 80% 70% at 50% 0%, rgba(255,255,255,0.05), transparent 70%)",
        }}
      >
        <WinWindow brand="/brands/spotify.svg" name="Spotify" live={!closed}>
          <div className="flex h-full items-center gap-2.5">
            <span className="h-9 w-9 shrink-0 rounded bg-white/[0.08]" aria-hidden />
            <span className="min-w-0 flex-1 space-y-1.5" aria-hidden>
              <span className="block h-2 w-3/4 rounded-full bg-white/[0.16]" />
              <span className="block h-2 w-1/2 rounded-full bg-white/[0.08]" />
            </span>
            <EqBars className="shrink-0" />
          </div>
        </WinWindow>

        <WinWindow brand="/brands/google-chrome.svg" name="Chrome" live={opened}>
          <div className="flex h-full flex-col gap-2" aria-hidden>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-14 rounded-t bg-white/[0.1]" />
              <span className="h-2.5 w-8 rounded-t bg-white/[0.04]" />
            </span>
            <span className="block h-3.5 w-full rounded-full bg-white/[0.06]" />
            <span className="block h-2 w-2/3 rounded-full bg-white/[0.1]" />
          </div>
        </WinWindow>
      </div>

      {/* ---- barra de tarefas ---- */}
      <div className="flex items-center gap-1 border-t border-white/[0.08] bg-white/[0.04] px-3 py-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brands/windows.svg"
          alt=""
          width={14}
          height={14}
          aria-hidden
          className="mr-1 h-[14px] w-[14px] shrink-0 brightness-0 invert opacity-60"
        />
        {WIN_TASKBAR.map((app) => {
          const running =
            app.role === "closes" ? !closed : app.role === "opens" ? opened : false;
          return (
            <span
              key={app.name}
              className="relative flex h-8 w-8 items-center justify-center rounded-chip"
              title={app.name}
            >
              {/* fundinho que acende so no app em execucao */}
              <motion.span
                animate={{
                  backgroundColor: running
                    ? "rgba(255,255,255,0.09)"
                    : "rgba(255,255,255,0)",
                }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0 rounded-chip"
                aria-hidden
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <motion.img
                src={app.brand}
                alt=""
                width={16}
                height={16}
                aria-hidden
                animate={{ opacity: running ? 1 : 0.4, scale: running ? 1 : 0.92 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="relative h-4 w-4 brightness-0 invert"
              />
              {/* a luzinha de "rodando" da barra do Windows 11 */}
              <motion.span
                aria-hidden
                animate={{ opacity: running ? 1 : 0, width: running ? 12 : 4 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="absolute -bottom-[3px] h-[2px] rounded-full bg-white"
              />
            </span>
          );
        })}

        {/* bandeja do sistema */}
        <span className="ml-auto flex items-center gap-2.5 pl-2 text-white/35">
          <WifiHigh size={13} aria-hidden />
          <SpeakerLow size={13} aria-hidden />
          <span className="text-[10px] tabular-nums text-white/40">14:03</span>
        </span>
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

// ---- YouTube ----------------------------------------------------------------
// A cena e uma TROCA DE TELA so, mais simples que Windows/WhatsApp (que tem
// varias fases encadeadas): comeca na lista de resultados da busca (a
// pergunta ja chega digitada na barra) e, em YOUTUBE_PLAY_AT, vira o video
// tocando — mesmo espirito da pagina do Google em ChromeViz (reveal
// escalonado), so que com uma troca de estado no meio.
//
// Os dois LAYOUTS (grade de resultados, video + "a seguir") foram refeitos
// pra CARTAO LARGO (pedido do usuario: a versao anterior empilhava tudo
// numa coluna so, pensada pra uma janela mais quadrada — nesta secao,
// bem mais larga que alta agora, um video 16:9 esticado pra largura
// INTEIRA ficava exagerado, ocupando quase toda a altura sozinho e
// espremendo titulo/canal/acoes lá embaixo). Agora os dois usam o espaco
// LARGO de verdade: grade de 3 colunas nos resultados, e video + coluna "a
// seguir" lado a lado no player — o mesmo formato do YouTube de verdade.
const YOUTUBE_QUERY = "tutorial de violão pra iniciantes";

// 5 resultados agora (eram 3) — pedido do usuario foi mostrar mais videos
// na coluna "A seguir" do player (que sobrava vazia com so 2). Os mesmos 5
// alimentam a grade de resultados tambem (vira 2 linhas de 3, a ultima com
// so 2 — nenhum numero magico duplicado entre as duas telas).
const YOUTUBE_RESULTS = [
  {
    title: "Violão para iniciantes — aula 1 completa",
    channel: "Aprenda Violão",
    meta: "1,2 mi visualizações · há 2 anos",
    duration: "18:42",
  },
  {
    title: "Como afinar seu violão em 3 passos",
    channel: "Música Fácil",
    meta: "480 mil visualizações · há 1 ano",
    duration: "6:15",
  },
  {
    title: "5 primeiros acordes que todo mundo aprende",
    channel: "Violão Descomplicado",
    meta: "2,8 mi visualizações · há 3 anos",
    duration: "11:03",
  },
  {
    title: "Escalas básicas pra destravar os dedos",
    channel: "Toque Fácil",
    meta: "620 mil visualizações · há 8 meses",
    duration: "9:27",
  },
  {
    title: "Como trocar de acorde sem travar o ritmo",
    channel: "Violão em 10 Minutos",
    meta: "1,5 mi visualizações · há 1 ano",
    duration: "7:52",
  },
];

const YOUTUBE_PLAY_AT = 1.9; // segundos ate trocar da lista pro video tocando
const YOUTUBE_PROGRESS_S = 3; // segundos que a barra do player leva pra encher

// Miniatura decorativa: sem asset de video de verdade (nenhuma das demos usa
// screenshot externo pra conteudo que mudaria a cada gravacao), um retangulo
// com degrade sutil + botao de play centralizado faz as vezes — mesma
// linguagem dos blocos solidos que as outras sete demos usam no lugar de
// fotos que nao existem.
// `w-full aspect-video` por padrao (usado na grade de resultados e na fila
// "a seguir", onde a altura sobra e o 16:9 de verdade cabe sem risco).
// `fill`: pro video GRANDE do player, que troca aspect-video por
// `h-full w-full` — nesse card, bem mais largo que alto, um 16:9 preso a
// LARGURA (que e generosa) ficava mais alto do que a coluna tinha altura
// disponivel, e cortava o titulo/canal/acoes logo abaixo (bug reportado
// pelo usuario). Com `fill`, quem manda no tamanho e o pai (ver YoutubeViz,
// mais abaixo: video em `flex-1 min-h-0`, texto em `shrink-0` — o texto
// SEMPRE cabe inteiro, e o video usa so o que sobrar).
function VideoThumb({
  iconSize = 16,
  fill = false,
}: {
  iconSize?: number;
  fill?: boolean;
}) {
  return (
    <div
      className={`relative w-full shrink-0 overflow-hidden rounded-md bg-ink-800 ${
        fill ? "h-full" : "aspect-video"
      }`}
      aria-hidden
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.02) 60%)",
        }}
      />
      <span className="absolute inset-0 flex items-center justify-center">
        <span
          className="flex items-center justify-center rounded-full bg-white/90 text-ink-950"
          style={{ height: iconSize * 1.8, width: iconSize * 1.8 }}
        >
          <Play size={iconSize} weight="fill" />
        </span>
      </span>
    </div>
  );
}

function YoutubeViz() {
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setPlaying(true), YOUTUBE_PLAY_AT * 1000);
    return () => clearTimeout(t);
  }, []);

  const [first, ...rest] = YOUTUBE_RESULTS;

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-white/[0.08] bg-ink-950">
      {/* topo: logo + barra de busca, ja com a pergunta preenchida (o
          "digitar" fica so no 1o ato, fora da janela — aqui a busca ja
          chega pronta, mesmo padrao do campo de busca em ChromeViz). */}
      <div className="flex items-center gap-3 border-b border-white/[0.08] bg-white/[0.02] px-4 py-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brands/youtube.svg"
          alt=""
          width={18}
          height={18}
          aria-hidden
          className="h-[18px] w-[18px] shrink-0"
        />
        <span className="hidden font-display text-sm font-semibold tracking-[-0.02em] text-white/85 sm:inline">
          YouTube
        </span>
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.04] px-3.5 py-1.5 text-xs text-white/75">
          <span className="min-w-0 flex-1 truncate">{YOUTUBE_QUERY}</span>
          <MagnifyingGlass
            size={12}
            weight="bold"
            aria-hidden
            className="shrink-0 text-white/40"
          />
        </div>
      </div>

      <div className="relative flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {!playing ? (
            // ---- resultados: GRADE de 3 colunas, cada resultado um cartao
            // vertical (miniatura em cima, texto embaixo) — o formato real
            // de busca do YouTube, e o que usa a largura toda sem esticar
            // so um cartao horizontal cada vez mais vazio pro lado direito.
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 grid grid-cols-3 gap-4 overflow-hidden p-4"
            >
              {YOUTUBE_RESULTS.map((r, i) => (
                <motion.div
                  key={r.title}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.14, duration: 0.3 }}
                  className="min-w-0"
                >
                  <div className="relative">
                    <VideoThumb />
                    <span className="absolute bottom-1 right-1 rounded bg-ink-950/85 px-1 py-px text-[9px] text-white/80">
                      {r.duration}
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-[13px] leading-snug text-white/90">
                    {r.title}
                  </p>
                  <p className="mt-1 truncate text-[11px] text-white/40">
                    {r.channel}
                  </p>
                  <p className="truncate text-[10px] text-white/30">{r.meta}</p>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            // ---- player: video + "a seguir" LADO A LADO, igual a pagina
            // real de video do YouTube — o video fica no formato 16:9 dele
            // (nao esticado pra virar quase quadrado numa janela larga), e
            // a coluna da direita preenche o resto do espaco em vez de
            // sobrar vazio.
            <motion.div
              key="player"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.35 }}
              className="absolute inset-0 grid grid-cols-[1.6fr_1fr] gap-4 overflow-hidden p-4"
            >
              <div className="flex min-w-0 flex-col gap-3">
                {/* min-h-0 + flex-1: o video usa SO o que sobra depois do
                    bloco de texto abaixo (que e shrink-0, ver comentario
                    la) — nunca o contrario. E o que garante que o
                    titulo/canal/acoes nunca sejam cortados, nao importa a
                    proporcao do cartao. */}
                <div className="relative min-h-0 flex-1">
                  <VideoThumb iconSize={22} fill />
                  <div
                    className="absolute inset-x-0 bottom-0 h-1 bg-white/15"
                    aria-hidden
                  >
                    <motion.div
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: YOUTUBE_PROGRESS_S, ease: "linear" }}
                      className="h-full bg-white"
                    />
                  </div>
                </div>
                {/* shrink-0: este bloco reserva a altura que precisa
                    (titulo + canal + acoes) e NUNCA cede espaco pro video
                    — ver comentario acima. */}
                <div className="shrink-0 space-y-2.5">
                  <p className="line-clamp-1 text-[13px] font-medium leading-snug text-white/90">
                    {first.title}
                  </p>
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-[10px] font-semibold text-white/70">
                      AV
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[11px] text-white/55">
                      {first.channel}
                    </span>
                    <span className="shrink-0 rounded-full border border-white/20 px-2.5 py-1 text-[10px] text-white/60">
                      Inscrever-se
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-[11px] text-white/35">
                    <span className="flex items-center gap-1.5">
                      <ThumbsUp size={13} aria-hidden />
                      2,1 mil
                    </span>
                    <span className="flex items-center gap-1.5">
                      <ShareFat size={13} aria-hidden />
                      Compartilhar
                    </span>
                  </div>
                </div>
              </div>

              {/* "a seguir": os outros quatro resultados, agora como fila
                  de sugestoes — preenche a coluna da direita com mais
                  videos de verdade em vez de sobrar vazio (pedido do
                  usuario). overflow-y-auto: se algum dia nao couberem
                  todos, rola em vez de estourar o cartao. */}
              <div className="flex min-w-0 flex-col gap-3 overflow-y-auto">
                <p className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/30">
                  A seguir
                </p>
                {rest.map((r) => (
                  <div key={r.title} className="flex shrink-0 gap-2.5">
                    <div className="w-24 shrink-0">
                      <VideoThumb iconSize={10} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-[11px] leading-snug text-white/85">
                        {r.title}
                      </p>
                      <p className="mt-1 truncate text-[10px] text-white/35">
                        {r.channel}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ConsoleBody({
  cap,
  device,
  onDevice,
  lowPower,
}: {
  cap: Cap;
  device: DeviceId;
  onDevice: (id: DeviceId) => void;
  // So Spotify (o disco) e Git (o spinner de "trabalhando") usam isto — as
  // outras cinco demos nao tem nenhuma animacao CONTINUA (infinita) pra
  // desligar, so sequencias de um tiro so que ja terminam sozinhas.
  lowPower: boolean;
}) {
  switch (cap.kind) {
    case "spotify":
      return <SpotifyViz device={device} onDevice={onDevice} lowPower={lowPower} />;
    case "whatsapp":
      return <WhatsAppViz />;
    case "git":
      return <GitViz lowPower={lowPower} />;
    case "chrome":
      return <ChromeViz />;
    case "windows":
      return <WindowsViz />;
    case "type":
      return <WordViz />;
    case "screen":
      return <ScreenViz />;
    case "youtube":
      return <YoutubeViz />;
  }
}

// ---- A janela do console -------------------------------------------------
// Virou componente proprio quando a secao passou a ser carrossel DE VERDADE no
// celular: a tira tem uma janela por capacidade (sete), e nao mais uma so com
// o conteudo trocando por baixo. So a da capacidade ativa toca a cena (`live`);
// as outras seis sao a MESMA moldura parada no instante zero — barra de
// titulo, cartao do pedido ainda vazio, resposta invisivel.
//
// E o mesmo componente de proposito: quando o carrossel para numa das seis,
// nao existe troca de casca nenhuma (a moldura ja estava ali desde antes de
// entrar em cena, exatamente igual) — o que muda e so o conteudo comecar a
// rodar. Uma "casca de espiada" separada, mais simples, criaria um pulo
// visivel bem no fim do gesto, que e o pior momento possivel.
//
// `live` tambem e o interruptor de custo: e ele que impede as seis paradas de
// montarem suas demos (cada uma tem timers proprios) e de repetirem as
// animacoes infinitas da moldura (o LED da barra de titulo, o anel do
// microfone, o cursor piscando). Sete copias disso rodando ao mesmo tempo
// seria pagar sete vezes por uma cena que so uma pessoa esta vendo.
function ConsoleWindow({
  cap,
  live,
  command,
  commandChars,
  sceneKey,
  reduce,
  lowPower,
  device,
  onDevice,
}: {
  cap: Cap;
  live: boolean;
  command: string;
  commandChars: number;
  sceneKey: string;
  reduce: boolean;
  lowPower: boolean;
  device: DeviceId;
  onDevice: (id: DeviceId) => void;
}) {
  const typed = commandChars >= command.length;

  return (
    // glow-ring SEM --active: o anel girando e um conic-gradient animado via
    // @property, que o navegador precisa REPINTAR a cada frame (nao e so
    // compositor como transform/opacity) — deixado sempre ligado, isso e um
    // repaint continuo pra sempre numa janela grande e sempre visivel. Vira
    // hover/focus (:is(:hover,:focus-within), ja definido em globals.css),
    // igual o resto dos usos de glow-ring no site.
    //
    // h-[Npx] fixo, NAO min-h: com min-h, um pedido ou resposta que quebrasse
    // em 2 linhas (algumas capacidades sao bem mais longas que outras)
    // empurrava a caixa inteira pra crescer — e, como ela e item de grid ao
    // lado da pilha de botoes, a coluna INTEIRA crescia junto, o cartao
    // mudando de forma a cada troca de capacidade. Altura fixa +
    // overflow-hidden fecham essa porta: por maior que o conteudo de dentro
    // queira ficar, a caixa nunca muda de tamanho — o que nao couber e
    // cortado, nao empurrado. (No celular isso vale dobrado: com as oito
    // janelas lado a lado na tira, alturas diferentes fariam a secao pular de
    // tamanho no meio do arrasto.) O 1o ato abaixo reserva 2 linhas fixas
    // pelo mesmo motivo (ver comentario la).
    // 500px (era 540): reduzido de leve depois que a barra de titulo saiu
    // (ver comentario abaixo) — sobra menos altura morta no fundo do
    // cartao. sm:/lg:/laptop: reduzidos na mesma proporcao (~40px).
    // Sem a barra de titulo "Jarvis Console... ativo" (pedido do usuario):
    // os tres pontinhos + rotulo + indicador "ativo" sairam, e o corpo
    // (1o/2o atos) agora comeca direto no topo do cartao.
    // bg-ink-700: mesma cor dos cartoes de widget (Showcase.tsx/Organization.tsx)
    // — pedido do usuario pra unificar as familias de cartao do site.
    // 470px (era 500): reduzido de leve de novo — o 1o ato tem altura FIXA
    // (h-14 de conteudo + padding, independente da altura do cartao), entao
    // todo esse corte sai do 2o ato (a tela da demo, flex-1, o unico que
    // sobra o que falta).
    // O 3o ato (a resposta do Jarvis) SAIU da janela de vez — pedido do
    // usuario: agora e sempre um bloco solto ABAIXO do cartao, em qualquer
    // tela (ver o bloco logo apos a tira, em Features()), nao so no celular
    // como antes.
    // 420/500/560/480 (era 480/560/620/540): pedido do usuario foi encolher
    // de leve nessa rodada — a resposta do Jarvis (bloco solto logo abaixo
    // do cartao, ver Features()) estava saindo do enquadramento numa tela
    // comum, e o cartao ficou mais LARGO nesta mesma leva de mudancas (ver
    // max-w-7xl/grid-cols mais abaixo), entao da pra ceder um pouco de
    // altura sem o console parecer menor.
    <div className="glow-ring relative flex h-[420px] flex-col overflow-hidden rounded-card border border-white/[0.12] bg-ink-700 shadow-[0_40px_120px_-50px_rgba(0,0,0,0.9)] sm:h-[500px] lg:h-[560px] laptop:h-[480px]">

      {/* corpo. Os dois cartoes de fala usam o mesmo esqueleto de UMA
          linha — avatar, rotulo, divisor e frase lado a lado. O rotulo
          tem largura fixa (w-20) nos dois pra frase do usuario e a do
          Jarvis comecarem exatamente na mesma coluna: sem isso
          "USUÁRIO" e "JARVIS" tem larguras diferentes e os dois textos
          ficariam desalinhados um do outro. Dentro dessa caixa o texto
          e centralizado, entao cada rotulo fica no meio do vao entre o
          avatar e o divisor, independente do tamanho da palavra. */}
      <div className="flex flex-1 flex-col gap-3 p-3.5 sm:gap-4 sm:p-5 laptop:gap-3.5">
        {/* 1o ato — o pedido, sem truncar, pra ler numa boa */}
        <div className="flex items-center gap-2.5 rounded-chip border border-white/[0.08] bg-ink-950/60 px-3.5 py-3 sm:gap-3 sm:px-5 sm:py-3.5 laptop:py-3">
          <span className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/[0.12] bg-white/[0.04]">
            {/* lowPower: sem o anel pulsante — mesmo raciocinio do disco do
                Spotify e do spinner do Git (ver comentarios la). */}
            {live && !lowPower && (
              <span
                aria-hidden
                className="core-ping absolute inset-0 rounded-full border border-white/20"
                style={{ animationDuration: "2.4s" }}
              />
            )}
            <Microphone
              size={16}
              weight="light"
              aria-hidden
              className="text-white/60"
            />
          </span>
          {/* font-mono (Geist Mono) em vez da Exo 2 dos titulos: aqui o
              rotulo faz papel de etiqueta de terminal, e a monoespacada
              e o que casa com o resto da linguagem do console.
              O rotulo e o divisor somem no celular (hidden sm:block):
              juntos comem ~110px de uma linha que tem ~300, e o avatar
              ja diz quem fala (microfone = voce, marca = Jarvis). O que
              ganha o espaco de volta e a frase, que e o conteudo. */}
          <span className="hidden w-20 shrink-0 text-center font-mono text-xs font-medium uppercase tracking-[0.14em] text-white/40 sm:block laptop:w-16 laptop:text-[11px]">
            Usuário
          </span>
          <span
            aria-hidden
            className="mx-1 hidden h-6 w-px shrink-0 bg-white/15 sm:block"
          />
          {/* h-14 FIXO (nao mais min-h de 1 linha): reserva espaco pra
              2 linhas sempre, pedido curto ou longo — e o que garante
              que o cartao inteiro nunca muda de altura ao trocar de
              capacidade (ver comentario grande na janela do console,
              mais acima). line-clamp-2 e so um cinto de seguranca:
              nenhum pedido real passa de 2 linhas nas larguras do
              site, mas se um dia passar, corta em vez de estourar.
              Mais o cursor piscando enquanto digita (estilo WhatsApp)
              — a aspa de fechamento so entra quando `typed` vira
              true, junto com o cursor sumindo. */}
          <div className="flex h-14 min-w-0 flex-1 items-center">
            <p className="line-clamp-2 text-[0.95rem] italic leading-snug text-white/90 sm:text-xl laptop:text-base">
              “{command.slice(0, commandChars)}
              {typed && "”"}
              {!typed && !reduce && live && (
                <span className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[2px] animate-pulse bg-white/70 align-middle" />
              )}
            </p>
          </div>
        </div>

        {/* 2o ato — a tela da acao. So MONTA depois que o pedido termina
            de digitar (typed): assim os timers internos de cada demo
            (GitViz, WhatsAppViz...) comecam a contar do zero exatamente
            quando a acao "comeca", em vez de correr escondidos por trás
            da digitacao do 1o ato.
            flex-1 SEM min-h proprio: a janela do console tem altura
            FIXA (h-[Npx] no container la fora, nao mais min-h), entao
            este bloco recebe sempre exatamente "o que sobra" depois da
            barra de titulo e dos 1o/3o atos (que tambem tem altura fixa
            agora) — nao precisa mais de um piso proprio pra empatar com
            a pilha de botoes do lado, isso ja vem garantido pela altura
            fixa do pai. */}
        <div className="relative flex-1">
          <AnimatePresence mode="wait">
            {live && typed && (
              <motion.div
                key={sceneKey}
                // "foco nitidez": entra borrada e um pouco menor,
                // resolvendo pra nitida no lugar — como uma camera
                // ajustando o foco, em vez do fade+leve-subida simples
                // de antes. Sai so com fade (sem desfocar de novo),
                // que fica mais limpo numa troca rapida de cena.
                initial={
                  reduce
                    ? false
                    : { opacity: 0, scale: 0.96, filter: "blur(6px)" }
                }
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={reduce ? undefined : { opacity: 0 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0"
              >
                <ConsoleBody cap={cap} device={device} onDevice={onDevice} lowPower={lowPower} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}

export default function Features() {
  const reduce = useReducedMotionSafe();
  // Modo fraco: pausa o autoplay entre capacidades (fica so no clique/toque),
  // pula a digitacao letra-a-letra do pedido (ver useEffect logo abaixo) e
  // desliga as duas animacoes CONTINUAS que as demos tem (disco do Spotify,
  // spinner "trabalhando" do Git, anel do microfone) — repassado ate
  // ConsoleWindow/ConsoleBody/SpotifyViz/GitViz. Ao contrario de `reduce`
  // (preferencia do visitante), isto e por CAPACIDADE medida — ver
  // use-low-power.tsx pra como a medicao funciona.
  const lowPower = useLowPowerDevice();
  const [activeIdx, setActiveIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  // No celular nao existe hover, entao o "assumi o controle" que pausa o
  // auto-play precisa vir do gesto: depois do primeiro arrasto (ou toque num
  // ponto) a secao para de andar sozinha e nao volta mais — o visitante
  // acabou de dizer que quer escolher, e um cartao trocando debaixo do dedo
  // seria briga de controle.
  const [manual, setManual] = useState(false);
  // aparelho escolhido no seletor da demo do Spotify. Mora aqui, e nao dentro
  // da demo, porque e ele que reescreve o pedido e a resposta — os dois
  // cartoes que ficam FORA da janela.
  const [device, setDevice] = useState<DeviceId>(DEFAULT_DEVICE);

  // Abaixo de lg a secao vira carrossel de um cartao so, arrastavel de lado.
  // O `drag` do motion e uma PROP — nao da pra ligar/desligar por media query
  // no CSS —, entao aqui precisa de JS. O 1023px espelha exatamente o `lg` do
  // Tailwind pra o comportamento nunca desencontrar do layout.
  const isMobile = useMediaQuery("(max-width: 1023px)");

  // Visibilidade da secao no celular: a animacao inteira (digitacao, demo,
  // resposta, avanco automatico entre capacidades) so deve tocar enquanto
  // "Ele age de verdade" esta de fato na tela — comeca quando o visitante
  // rola ate ela e pausa se ele sair, em vez de ficar rodando escondida no
  // fundo da pagina (gastando timers/re-render a toa e deixando a cena num
  // ponto aleatorio do ciclo quando a pessoa finalmente chega nela). So
  // importa no celular (ver `isMobile` acima, usado nos dois useEffect mais
  // abaixo): no desktop o hover ja da controle de pausa (`paused`).
  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const active = CAPS[activeIdx];

  // ---- Carrossel do celular ----------------------------------------------
  // Antes daqui o "carrossel" era um cartao parado: o arrasto so trocava o
  // conteudo depois de soltar, com um fade. Agora as sete janelas vivem lado a
  // lado numa tira que se move de verdade — o vizinho ja esta espiando na
  // borda antes do gesto e entra DURANTE ele. Mesma mecanica (e quase o mesmo
  // codigo) do carrossel de Organization.tsx, de proposito: sao dois
  // carrosseis na mesma pagina, e inventar duas fisicas diferentes pro mesmo
  // gesto e o tipo de detalhe que o dedo percebe antes da cabeca.

  // Largura da JANELA DE RECORTE — o cartao usa essa largura INTEIRA agora
  // (sem espiada, ver comentario grande la em cima). Medida, e nao
  // calculada de vw, porque ela muda tambem quando o respiro da secao
  // muda de degrau.
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [trackWidth, setTrackWidth] = useState(0);
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) =>
      setTrackWidth(entry.contentRect.width)
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // x e a posicao da tira em PIXELS (nao %), porque o `drag` do motion move em
  // pixels — misturar as duas unidades no mesmo valor e que permite o dedo
  // "somar" deslocamento em cima da posicao ja animada, sem os dois brigarem.
  const x = useMotionValue(0);

  // PASSO de uma parada = largura do cartao + o vao. SEM SLIDE_INSET
  // (pedido do usuario): o cartao parava de ceder largura pro vizinho
  // espiar, entao o cartao ativo sempre ficava um pouco deslocado pra
  // esquerda (a espiada so aparecia na direita) — sensacao de "nunca
  // centralizado direito", mais visivel ainda no primeiro cartao (Spotify,
  // o estado inicial da pagina), que nao tinha vizinho espiando na
  // esquerda pra compensar. Agora o cartao e a largura CHEIA da janela de
  // recorte, sempre perfeitamente centralizado — mesmo padrao "sem peek"
  // que o carrossel de Updates (Roadmap.tsx) ja usa.
  const stride = trackWidth ? trackWidth + SLIDE_GAP : 0;

  // Fim da corrida: no ultimo cartao a tira NAO para em -6*stride, senao
  // sobraria um vao morto na direita (a espiada existe pra mostrar o proximo, e
  // no ultimo nao ha proximo). Trava onde a borda direita do ultimo cartao
  // encosta na borda da janela de recorte — o que deixa a ultima parada como
  // espelho exata da primeira: la o cartao cola na esquerda e o vizinho espia
  // na direita, aqui ele cola na direita e o ANTERIOR espia na esquerda, que e
  // a leitura certa nessa ponta ("ainda da pra voltar").
  const contentWidth = stride ? CAPS.length * stride - SLIDE_GAP : 0;
  const minX = Math.min(0, trackWidth - contentWidth);
  const posFor = (idx: number) => Math.max(-idx * stride, minX);

  // `type: spring` (nao tween) pra combinar com a mola elastica que o proprio
  // arrasto usa enquanto o dedo ainda esta na tela — sem isso, o gesto teria
  // uma fisica e o "snap" final teria outra, e a costura ficaria visivel.
  const snapTo = (idx: number) => {
    if (!stride) return;
    animate(x, posFor(idx), { type: "spring", stiffness: 380, damping: 42 });
  };

  useEffect(() => {
    // No desktop a tira volta a ser um cartao so (as outras seis saem por
    // `lg:hidden`), entao qualquer deslocamento aqui jogaria a janela pra fora
    // da coluna. `stride` entra nas deps pra tira se realinhar quando a tela
    // gira ou muda de tamanho com o carrossel no meio do caminho.
    if (!isMobile) {
      x.set(0);
      return;
    }
    snapTo(activeIdx);
    // snapTo e recriado a cada render (le stride); as deps abaixo sao as
    // entradas reais dele.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIdx, isMobile, stride]);

  // Arrastar pra ESQUERDA avanca (o dedo empurra o cartao atual pra fora,
  // puxando o proximo), pra DIREITA volta — convencao de qualquer carrossel de
  // app, e a mesma de Organization.tsx. Nos extremos, Math.min/max trava o
  // indice e `snapTo` chama de volta pra MESMA posicao: e o que da o efeito de
  // elastico batendo na ponta em vez de continuar arrastando pro vazio.
  // Gestos verticais nem chegam aqui: com drag="x" o motion deixa
  // `touch-action: pan-y` no elemento, entao rolar a pagina continua sendo
  // rolagem nativa.
  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const { offset, velocity } = info;
    let next = activeIdx;
    if (offset.x < -SWIPE_DISTANCE || velocity.x < -SWIPE_VELOCITY)
      next = Math.min(activeIdx + 1, CAPS.length - 1);
    else if (offset.x > SWIPE_DISTANCE || velocity.x > SWIPE_VELOCITY)
      next = Math.max(activeIdx - 1, 0);

    if (next === activeIdx) snapTo(activeIdx);
    else setActiveIdx(next);
  };

  // Na cena do Spotify o pedido e a resposta sao montados a partir do aparelho
  // escolhido; nas outras seis eles vem prontos do CAPS.
  const isSpotify = active.kind === "spotify";
  const command = isSpotify ? spotifyCommand(device) : active.command;
  const reply = isSpotify ? findDevice(device).reply : active.reply;
  // trocar de aparelho remonta a cena inteira (a demo, o pedido e a resposta),
  // entao ela toca de novo ja com o novo destino.
  const sceneKey = isSpotify ? `${active.id}:${device}` : active.id;

  // Os 3 atos agora tocam em SEQUENCIA, nao em paralelo: 1) o pedido digita
  // letra por letra (estilo WhatsApp); 2) so DEPOIS de pronto a demo do meio
  // entra e comeca a tocar; 3) so DEPOIS que a demo termina (replyDelay,
  // calibrado por capacidade pra bater com o fim de cada animacao) a caixa
  // de resposta do Jarvis aparece. Um efeito so, encadeado por setTimeout —
  // cada fase depende da anterior ja ter acabado, e useEffects separados
  // reagindo uns aos outros correm risco de o timer de uma cena antiga
  // vazar pra dentro da proxima quando o visitante troca rapido.
  const [commandChars, setCommandChars] = useState(
    reduce ? command.length : 0
  );
  const [showReply, setShowReply] = useState(reduce);
  // Digitacao da RESPOSTA, letra a letra — mesma animacao do pedido do
  // usuario (pedido do usuario). So comeca a andar depois que showReply
  // vira true (ver replyTimer, mais abaixo): antes disso o cartao mostra
  // so os pontinhos de ThinkingDots, nao faz sentido ter chars pra digitar.
  const [replyChars, setReplyChars] = useState(reduce ? reply.length : 0);

  useEffect(() => {
    if (reduce) {
      setCommandChars(command.length);
      setShowReply(true);
      setReplyChars(reply.length);
      return;
    }
    // Fora da tela no celular: nao inicia (nem continua) a cena. O cleanup
    // da execucao anterior deste efeito (que roda automaticamente quando
    // `inView` muda) ja cancela qualquer timer pendente — e isso que
    // "pausa" a animacao ao sair da secao.
    if (isMobile && !inView) return;
    setShowReply(false);
    setReplyChars(0);
    let replyTimer: ReturnType<typeof setTimeout>;
    let replyTypingTimer: ReturnType<typeof setTimeout>;

    // lowPower: pula as duas digitacoes letra-a-letra (um setState a cada
    // 28ms, COMMAND_CHAR_MS) — pedido e resposta aparecem prontos na hora.
    // A demo do meio continua no mesmo ritmo de sempre (replyDelay normal):
    // o que sai e so o CHURN de re-render da digitacao, nao a cena inteira,
    // que ainda vale a pena mostrar rodando.
    if (lowPower) {
      setCommandChars(command.length);
      replyTimer = setTimeout(() => {
        setShowReply(true);
        setReplyChars(reply.length);
      }, active.replyDelay * 1000);
      return () => clearTimeout(replyTimer);
    }

    setCommandChars(0);
    let typingTimer: ReturnType<typeof setTimeout>;
    let i = 0;
    const typeNext = () => {
      i += 1;
      setCommandChars(i);
      if (i < command.length) {
        typingTimer = setTimeout(typeNext, COMMAND_CHAR_MS);
      } else {
        replyTimer = setTimeout(() => {
          setShowReply(true);
          // a resposta comeca a digitar assim que aparece, no MESMO ritmo
          // (COMMAND_CHAR_MS) do pedido do usuario.
          let j = 0;
          const typeReplyNext = () => {
            j += 1;
            setReplyChars(j);
            if (j < reply.length) {
              replyTypingTimer = setTimeout(typeReplyNext, COMMAND_CHAR_MS);
            }
          };
          replyTypingTimer = setTimeout(typeReplyNext, COMMAND_CHAR_MS);
        }, active.replyDelay * 1000);
      }
    };
    typingTimer = setTimeout(typeNext, COMMAND_CHAR_MS);
    return () => {
      clearTimeout(typingTimer);
      clearTimeout(replyTimer);
      clearTimeout(replyTypingTimer);
    };
    // command, reply e active.replyDelay sao 100% funcao de sceneKey (mesmo
    // aparelho do Spotify entra no proprio sceneKey) — reagir so a sceneKey
    // evita reiniciar a digitacao no meio quando nada realmente mudou.
    // isMobile/inView entram pra pausar/retomar no celular (ver comentario
    // acima) — em desktop `isMobile` e sempre false e o efeito nunca reage
    // a `inView`, entao o comportamento de la fica identico a antes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sceneKey, reduce, lowPower, isMobile, inView]);

  // Auto-play: percorre as capacidades sozinho, como uma demo rodando. Para
  // no hover/foco (o visitante assumiu o controle), em reduced-motion e em
  // maquina fraca (lowPower) — la a troca automatica so soma timers/rerenders
  // por cima de uma demo que ja e o suficiente pra maquina aguentar; o
  // visitante ainda navega entre capacidades pelo clique/toque, so nao anda
  // mais sozinho.
  //
  // A permanencia e SEMPRE por cena agora (pedido do usuario): sem piso
  // fixo (era `Math.max(AUTOPLAY_MS, ...)`, 7s minimo mesmo pra cenas
  // curtas) — o tempo e exatamente digitacao do pedido + replyDelay +
  // digitacao da resposta + 2s de sobra depois que TUDO termina, nem mais
  // nem menos, pra cada capacidade.
  //
  // O reset ao clicar manualmente (tambem pedido do usuario) ja e de graca
  // pela propria estrutura do efeito: `activeIdx` esta nas dependencias, e
  // tanto o autoplay (setActiveIdx aqui embaixo) quanto o clique manual nos
  // botoes (CapButton, mais abaixo) mudam esse mesmo estado — qualquer um
  // dos dois cancela o timer pendente (cleanup) e comeca a contagem de novo
  // do zero pra capacidade atual.
  useEffect(() => {
    if (reduce || paused || manual || lowPower) return;
    // Mesma pausa por visibilidade do efeito de digitacao/resposta, acima:
    // fora da tela no celular, tambem para de avancar sozinho pra proxima
    // capacidade.
    if (isMobile && !inView) return;
    const dwell =
      command.length * COMMAND_CHAR_MS +
      active.replyDelay * 1000 +
      // a resposta tambem digita letra a letra (mesmo ritmo do pedido) —
      // soma esse tempo, senao o autoplay podia trocar de capacidade com a
      // resposta ainda no meio da digitacao.
      reply.length * COMMAND_CHAR_MS +
      2000;
    const t = setTimeout(
      () => setActiveIdx((i) => (i + 1) % CAPS.length),
      dwell
    );
    return () => clearTimeout(t);
  }, [
    reduce,
    paused,
    manual,
    lowPower,
    activeIdx,
    active.replyDelay,
    command,
    reply,
    isMobile,
    inView,
  ]);

  return (
    <section
      id="recursos"
      ref={sectionRef}
      // pb curto de proposito: o link "Veja tudo que ele ja conecta" e uma
      // ponte pra secao seguinte, entao ele precisa ficar perto dela — com o
      // pb-28/36 antigo o link ficava boiando no meio de um vao enorme.
      // laptop:* (ver tailwind.config.ts): tela de desktop mas baixa. Nesta
      // secao o problema nao e largura — de 1216px pra cima o layout e o
      // mesmo — e sim que os 1242px de altura viram 1,6 tela num notebook.
      // Cada `laptop:` daqui pra baixo tira altura de um pedaco: respiros da
      // secao, bloco do titulo, botoes da esquerda e a janela do console.
      // A regulagem e de UM degrau, nao de encolher tudo: as fontes ficam no
      // tamanho de tras (text-5xl no lugar do 6xl do PC, e o texto corrido
      // intacto), e quem cede de verdade sao alturas fixas e respiros.
      className="relative overflow-hidden bg-ink-900 px-6 pb-28 pt-10 sm:pb-32 sm:pt-16 lg:px-10 laptop:pb-24 laptop:pt-11 wide:px-16"
    >
      {/* halo suave atras do console */}
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 top-1/3 h-[460px] w-[620px] translate-x-1/4 rounded-full bg-white/[0.04] blur-[140px]"
      />

      {/* max-w-7xl (nao mais 6xl): pedido do usuario foi alargar o cartao
          do console — o bloco do titulo tem seu PROPRIO max-w-6xl aninhado
          logo abaixo, entao ele nao alarga junto; so o grid (titulo +
          colunas + console) ganha os ~128px extras. */}
      <div className="relative mx-auto max-w-7xl wide:max-w-shell">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          // max-w-6xl (nao mais 2xl): a 60px (lg:text-6xl) o titulo precisa
          // de ~1025px pra caber numa linha so — 672px (max-w-2xl) nao dava
          // conta. O paragrafo abaixo mantem sua propria largura de leitura
          // (max-w-[54ch]), entao alargar aqui nao alarga ele.
          className="mx-auto max-w-6xl text-center"
        >
          <SectionEyebrow>Capacidades</SectionEyebrow>
          {/* Mesma formula de fonte de Roadmap.tsx ("Próximas atualizações"),
              a pedido do usuario (todos os titulos de secao no mesmo
              tamanho do de Updates) — ver comentario identico em
              Showcase.tsx. Isto tambem tornou obsoleta a antiga formula em
              DOIS estagios (base + `lg:`) que compensava o salto de padding
              da secao em 1024px: com este cap (3rem) o titulo trava por
              volta de 524px de largura, bem antes dos 1024px onde o padding
              muda — o salto que a segunda formula corrigia nunca chega a
              acontecer. */}
          {/* wrapper mx-auto w-fit (nao mais inline-block, ver correcao
              identica em Organization.tsx): encolhe pra largura do texto,
              entao a linha (w-full deste wrapper) casa com a frase do
              titulo em qualquer largura, sem virar inline (o que deixava o
              titulo na mesma linha do rotulo em telas largas). */}
          <div className="mx-auto w-fit">
            <h2 className="mt-5 whitespace-nowrap leading-tight font-display text-[length:clamp(0.9rem,calc(10.22vw_-_5.52px),3rem)] font-semibold tracking-[-0.025em] text-[#FAFAFA] laptop:text-[2.625rem]">
              Ele age de verdade
            </h2>
            <div aria-hidden className="mt-2 h-px w-full bg-gradient-to-r from-transparent via-white/25 to-transparent laptop:mt-1.5" />
          </div>
          <p className="mx-auto mt-3 max-w-[54ch] text-lg font-light leading-relaxed text-white/55 laptop:mt-2">
            Escolha uma capacidade e veja o Jarvis em ação.
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
          // O arrasto saiu daqui e foi pra TIRA (mais abaixo): agora quem se
          // move e ela, nao o bloco inteiro. Enquanto o cartao estava parado
          // fazia sentido o bloco todo ceder um pouco pro dedo, que era a
          // unica resposta ao gesto; com a tira andando de verdade, mover a
          // pilha junto seria uma segunda coisa se mexendo em cima da
          // primeira. O que responde ao dedo fora do cartao agora e o polegar
          // da barra de progresso, que anda no mesmo compasso.
          //
          // minmax(0, Nfr) nas 3 colunas (nao so `Nfr` puro): esse era o bug
          // reportado — passar o mouse nos botoes de nome mais comprido
          // ("Leitura de tela", "Digita por você") empurrava o cartao do
          // meio pro lado. `Nfr` sozinho equivale a `minmax(auto, Nfr)`, e
          // esse "auto" deixa o tamanho MINIMO da coluna seguir o conteudo
          // — durante a transicao de `max-width` do CapButton (que cresce
          // pra mostrar o nome), o grid recalculava a coluna mais larga pra
          // caber o botao expandido, e as outras duas colunas (fr) cediam
          // espaco, deslocando tudo. `minmax(0, Nfr)` trava o minimo em
          // zero: a coluna nunca cresce por causa do conteudo, so pela
          // fracao mesmo — o botao no hover passa a vazar visualmente por
          // cima do vizinho (se precisar), em vez de empurrar o layout.
          className="mt-7 grid grid-cols-1 gap-4 sm:mt-9 lg:grid-cols-[minmax(0,0.35fr)_minmax(0,2.3fr)_minmax(0,0.35fr)] lg:items-center lg:gap-8 laptop:mt-6"
        >
          {/* Celular: UM botao so (o da capacidade ativa), desenho rico
              original (icone + nome + frase de apoio). Acima do cartao
              (pedido do usuario) — o botao apresenta a capacidade antes de
              mostrar a cena dela. Sai de cena no desktop (lg:hidden): la a
              selecao vira as duas colunas compactas dos lados do console,
              logo abaixo — ver CapButton. */}
          <div className="order-1 flex flex-col gap-2.5 lg:hidden">
            {(() => {
              const cap = CAPS[activeIdx];
              return (
                <button
                  type="button"
                  aria-pressed
                  className="glow-ring glow-ring--active group relative flex items-center gap-4 overflow-hidden rounded-card border border-white bg-[#FAFAFA] px-5 py-4 text-left transition-colors duration-300"
                >
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-chip border border-ink-950 bg-ink-950 text-white">
                    <CapGlyph cap={cap} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-display text-[0.95rem] font-semibold tracking-[-0.01em] text-ink-950">
                      {cap.tab}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-ink-950/80">
                      {cap.hint}
                    </span>
                  </span>
                  <span
                    className="ml-1 h-1.5 w-1.5 shrink-0 rounded-full bg-ink-950"
                    aria-hidden
                  />
                </button>
              );
            })()}
          </div>

          {/* Desktop: coluna ESQUERDA com as 4 primeiras capacidades — SO
              icone (ver CapButton): o botao vira uma pilula redonda de
              ~44px, sem nome visivel, ate o mouse passar por cima. No
              hover ela se expande revelando o nome, sempre pro lado de FORA
              (longe do console) — aqui, pra ESQUERDA, ver `side="left"`.
              items-end alinha cada botao pela borda DIREITA da coluna (a
              mais perto do console): e o que ancora o icone sempre no
              mesmo lugar e faz o nome crescer pra esquerda, dentro do
              espaco que a propria coluna ja reserva (sem invadir a secao
              vizinha nem depender de z-index/overflow). */}
          {/* lg:-translate-y-8: os botoes ficam centralizados na altura do
              cartao (herdado do lg:items-center do grid), mas o cartao
              agora e mais "pesado" em cima (o pedido do usuario, primeiro
              ato) do que embaixo — pedido do usuario foi subir a coluna
              pra alinhar melhor com essa linha, sem abandonar a
              centralizacao de base. Transform nao mexe no layout/grid
              (ao contrario de margin), entao nao reabre o bug de
              hover empurrando o cartao (ver comentario grande no grid,
              acima). */}
          <div className="hidden lg:order-none lg:flex lg:flex-col lg:items-end lg:gap-8 lg:-translate-y-8">
            {CAPS.slice(0, 4).map((cap, i) => (
              <CapButton
                key={cap.id}
                cap={cap}
                isActive={i === activeIdx}
                onClick={() => setActiveIdx(i)}
                side="left"
              />
            ))}
          </div>

          {/* Coluna do MEIO: a tira com as oito janelas do console + a
              resposta do Jarvis logo abaixo dela (ver o bloco `Resposta do
              Jarvis`, mais adiante) — as duas moram dentro do MESMO wrapper
              (`flex flex-col`) pra funcionar como um grid item so: e ele
              quem carrega `order-2 lg:order-none` agora (antes era a tira
              sozinha). No celular, como esse wrapper e um unico item na
              pilha, a resposta ja nasce imediatamente apos a tira, sem
              precisar de um order proprio — o mesmo lugar que ocupava
              quando ainda vivia num bloco solto separado. */}
          <div className="order-2 flex flex-col gap-4 lg:order-none">
            {/* No desktop a tira nao existe como tira — o `lg:block` desfaz
                o flex e as sete janelas fora de cena saem por `lg:hidden`,
                entao sobra exatamente o que sempre houve ali: uma janela,
                na coluna do meio do grid.

                No celular e um carrossel de verdade, SEM espiada de
                vizinho (ver comentario grande em SLIDE_GAP, la em cima) —
                cada cartao ocupa a janela de recorte inteira e fica sempre
                centralizado. A janela ainda sangra pra fora do respiro da
                secao (-mx-6 px-6) so pra ficar consistente com o resto da
                pagina, nao por causa de espiada nenhuma.

                O arrasto mora AQUI, na tira, e nao no bloco inteiro: e o
                cartao que anda com o dedo. */}
            <div
              ref={viewportRef}
              className="-mx-6 overflow-hidden px-6 lg:mx-0 lg:overflow-visible lg:px-0"
            >
              <motion.div
                drag={isMobile ? "x" : false}
                dragConstraints={{ left: minX, right: 0 }}
                dragElastic={0.15}
                dragMomentum={false}
                onDragStart={() => setManual(true)}
                onDragEnd={handleDragEnd}
                style={{ x }}
                className="flex cursor-grab gap-4 will-change-transform active:cursor-grabbing lg:block lg:cursor-auto lg:active:cursor-auto"
              >
                {CAPS.map((cap, i) => {
                  const isLive = i === activeIdx;
                  return (
                    // Sem shrink-0 o flex espremeria as oito pra caber na
                    // tira. w-full (nao mais w-[calc(100%-1.25rem)]): sem
                    // espiada de vizinho, o cartao ocupa a janela de
                    // recorte inteira e fica sempre centralizado (pedido do
                    // usuario, ver comentario grande no `stride`, acima).
                    // aria-hidden nas sete paradas fora de cena: pra quem le
                    // a pagina com leitor de tela, a secao continua tendo UM
                    // console (o da capacidade em cena) — a navegacao entre
                    // elas e a barra de progresso logo abaixo, que e
                    // tablist de verdade.
                    <div
                      key={cap.id}
                      aria-hidden={!isLive}
                      className={`w-full shrink-0 ${isLive ? "" : "lg:hidden"}`}
                    >
                      <ConsoleWindow
                        cap={cap}
                        live={isLive}
                        // Fora de cena a janela mostra o pedido VAZIO (zero
                        // caracteres digitados), que e exatamente o estado
                        // em que a cena ao vivo comeca — por isso a troca no
                        // fim do gesto nao tem pulo: o cartao que chegou ja
                        // estava desenhado assim, e so passa a digitar.
                        command={isLive ? command : cap.command}
                        commandChars={isLive ? commandChars : 0}
                        sceneKey={sceneKey}
                        reduce={reduce}
                        lowPower={lowPower}
                        device={device}
                        onDevice={setDevice}
                      />
                    </div>
                  );
                })}
              </motion.div>
            </div>

            {/* Resposta do Jarvis, FORA do cartao — em QUALQUER tela agora
                (pedido do usuario: antes so no celular, o desktop ainda
                escondia a resposta dentro da janela do console). Mesmo
                desenho de sempre (avatar em anel, rotulo, texto), como peca
                solta logo abaixo do console. SEMPRE visivel: enquanto
                showReply e false, so os pontinhos de "pensando" aparecem,
                centralizados — sem avatar/rotulo, que so entram quando a
                resposta chega de fato. Troca direta, sem fade/slide.
                mx-3.5 sm:mx-5: mesmo respiro do `corpo` do console (ver
                ConsoleWindow, p-3.5 sm:p-5) — sem essa margem o cartao da
                resposta esticava borda a borda com a janela do console,
                mais LARGO que o cartao do usuario (que vive recuado por
                dentro desse padding). Com a margem igual, os dois cartoes
                (usuario e Jarvis) ficam exatamente com a mesma largura,
                pedido do usuario.
                O resto da classe (gap/padding/o w-16+text-[11px] do rotulo,
                logo abaixo) agora copia LITERALMENTE o 1o ato (o cartao do
                usuario, em ConsoleWindow) — antes so tinha px-3.5 py-3 fixo
                (sem os saltos sm:/laptop: que o do usuario tem), entao o
                icone/rotulo/inicio do texto dos dois cartoes nao batiam
                exatamente na mesma posicao horizontal em todo breakpoint
                (pedido do usuario: alinhar os dois). */}
            <div className="mx-3.5 flex items-center gap-2.5 justify-center rounded-chip border border-white/[0.16] bg-white/[0.05] px-3.5 py-3 sm:mx-5 sm:gap-3 sm:px-5 sm:py-3.5 laptop:py-3">
              {showReply ? (
                <>
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/25 bg-white/[0.08] shadow-[0_0_14px_-2px_rgba(255,255,255,0.4)]">
                    <JarvisMark />
                  </span>
                  <span className="hidden w-20 shrink-0 text-center font-mono text-xs font-medium uppercase tracking-[0.14em] text-white/60 sm:block laptop:w-16 laptop:text-[11px]">
                    Jarvis
                  </span>
                  <span
                    aria-hidden
                    className="mx-1 hidden h-6 w-px shrink-0 bg-white/20 sm:block"
                  />
                  <div className="flex h-14 min-w-0 flex-1 items-center">
                    <JarvisReply text={reply} chars={replyChars} />
                  </div>
                </>
              ) : (
                <div className="flex h-14 items-center justify-center">
                  <ThinkingDots />
                </div>
              )}
            </div>
          </div>

          {/* Desktop: coluna DIREITA com as 4 ultimas capacidades — mesmo
              CapButton compacto da esquerda, so que ancorado pela borda
              ESQUERDA (items-start: a mais perto do console) e o nome
              crescendo pra DIREITA no hover (`side="right"`), espelhando a
              coluna esquerda. So existe em DOM depois da coluna do meio,
              entao com `lg:order-none` (todos os tres viram order:0 no
              desktop) a ordem de empate cai pra posicao no DOM: esquerda,
              meio, direita — exatamente as 3 colunas do grid, nessa
              sequencia. */}
          <div className="hidden lg:order-none lg:flex lg:flex-col lg:items-start lg:gap-8 lg:-translate-y-8">
            {CAPS.slice(4, 8).map((cap, i) => {
              const idx = i + 4;
              return (
                <CapButton
                  key={cap.id}
                  cap={cap}
                  isActive={idx === activeIdx}
                  onClick={() => setActiveIdx(idx)}
                  side="right"
                />
              );
            })}
          </div>

          {/* PONTINHOS — 3a versao, mesma peca de Organization.tsx (ver o
              comentario grande la, com a explicacao do `layoutId`). Sem
              cartao envolvendo; a ativa vira uma pilulazinha que desliza ate
              a posicao nova. layoutId proprio desta secao (tem que ser unico
              na pagina inteira). */}
          <div
            className="order-4 mx-auto mt-1 flex w-fit items-center gap-2 lg:hidden"
            role="tablist"
            aria-label="Capacidades"
          >
            {CAPS.map((cap, i) => (
              <button
                key={cap.id}
                type="button"
                role="tab"
                aria-selected={i === activeIdx}
                aria-label={cap.tab}
                onClick={() => {
                  setManual(true);
                  setActiveIdx(i);
                }}
                className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center"
              >
                {i === activeIdx ? (
                  <motion.span
                    layoutId="features-carousel-dot"
                    transition={{ type: "spring", stiffness: 500, damping: 34 }}
                    aria-hidden
                    className="h-1.5 w-5 rounded-full bg-white"
                  />
                ) : (
                  <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-white/25" />
                )}
              </button>
            ))}
          </div>
        </motion.div>

      </div>
    </section>
  );
}
