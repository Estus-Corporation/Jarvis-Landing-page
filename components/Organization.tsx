"use client";

import React from "react";
import { motion } from "motion/react";
import { useReducedMotionSafe } from "@/components/ui/use-reduced-motion-safe";
import SectionEyebrow from "@/components/ui/section-eyebrow";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  ListChecks,
  CalendarCheck,
  BellRinging,
  Repeat,
  Clock,
  Check,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";

// TRES CARTOES LADO A LADO — um por recurso (Tarefas, Agenda, Lembretes).
//
// O cartao foi VIRADO DE CABECA PRA BAIXO em relacao a versao anterior, por
// causa de um teste com uma pessoa de fora: ela achou que era informacao
// demais e que os titulos ("Tarefas", "Agenda"...) estavam mal posicionados e
// pouco aparentes. Estavam mesmo — moravam no RODAPE, pequenos, embaixo de
// uma maquete densa que comia toda a atencao. Agora:
//
//   CABECALHO (em cima, altura fixa) — icone em anel duplo, nome e uma frase
//   de duas linhas. E a primeira coisa que se le no cartao, nao a ultima.
//   Sendo de altura fixa, os tres titulos e as tres frases caem exatamente na
//   mesma linha, e o palco dos tres comeca junto.
//
//   PALCO (embaixo, altura fixa) — fundo ink-950, um degrau ABAIXO do cartao:
//   e uma tela embutida, e por isso as maquetes sobem um tom (ink-800) pra
//   continuarem lendo como objetos em cima dela. A maquete e ancorada no topo
//   e SANGRA pra fora, apagando num degrade na borda de baixo. E de proposito
//   — tela nao termina, continua —, e por isso cada maquete tem mais conteudo
//   do que cabe: em qualquer largura ela e cortada, e o corte le como
//   continuacao, nunca como espaco que sobrou.
//
// As maquetes tambem EMAGRECERAM, que era a outra metade da queixa: Tarefas
// perdeu o formulario inteiro (titulo, descricao, toggle, hora) e ficou com a
// lista mais a faixa de repeticao; Agenda caiu de cinco compromissos pra
// quatro; Lembretes perdeu tres itens da fila. O que ficou mais LONGO foram
// as listas (sete tarefas, quatro lembretes) — mas linha de lista nao pesa
// como campo de formulario: ela le como "a lista continua", que e justamente
// o que o corte no rodape precisa. Sem conteudo suficiente sobrando, o
// degrade apagaria em cima de palco vazio.
//
// TAREFAS fica no MEIO e um pouco maior que os dois vizinhos — e o recurso
// central dos tres. O destaque agora e SO tamanho (coluna mais larga + palco
// mais alto); a superficie mais clara e a borda destacada que a versao antiga
// usava junto nao voltaram, porque somavam mais um elemento disputando
// atencao numa secao cuja queixa era exatamente essa. Os tres cabecalhos
// comecam na mesma linha em cima; embaixo o do meio desce mais, e a legenda
// dele desce junto — legenda anda com o cartao dela, nao com a dos vizinhos.
//
// Fora do cartao, logo abaixo dele, vem o COMANDO: a frase falada que cria
// aquilo. Fica de fora porque e de outra natureza — o cartao mostra o
// RESULTADO, a frase e o que voce faz. Legenda de foto, nao conteudo do
// cartao.

const EASE = [0.16, 1, 0.3, 1] as const;

// ---- Icone em anel duplo -----------------------------------------------------
function RingIcon({ icon: Glyph }: { icon: Icon }) {
  return (
    <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/[0.16] bg-ink-950">
      <span
        aria-hidden
        className="absolute -inset-[6px] rounded-full border border-white/[0.07]"
      />
      <Glyph size={20} weight="light" aria-hidden className="text-white/85" />
    </span>
  );
}

// ---- O cartao ----------------------------------------------------------------
// As duas alturas fixas (min-h na frase do cabecalho, h no palco) existem so
// pra uma coisa: garantir que os cartoes fiquem alinhados mesmo quando um
// texto quebra em menos linhas que o outro — se um cabecalho encolhe, o palco
// do lado desalinha do vizinho. O cabecalho tem a mesma altura nos tres
// (inclusive no do meio); quem muda no `bigger` e so o palco.
function FeatureCard({
  icon,
  title,
  desc,
  command,
  delay = 0,
  bigger = false,
  className,
  children,
}: {
  icon: Icon;
  title: string;
  desc: string;
  command: string;
  delay?: number;
  bigger?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const reduce = useReducedMotionSafe();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.6, ease: EASE, delay }}
      className={className}
    >
      {/* bg-[#111114]: um passo escuro FORA da escala, a meio caminho entre
          ink-800 (#141417, o tom original do cartao) e ink-900 (#0E0E10, o
          fundo da secao). Mesma manobra que Showcase.tsx faz com #0C0C0E: os
          degraus da escala sao largos demais pra um ajuste fino como este —
          descer o degrau inteiro ate ink-900 sumiria com o cartao dentro da
          secao.
          Os paineis das maquetes continuam em ink-800: eles vivem sobre o
          palco ink-950, sao outra superficie, e mexer neles ia junto tirar o
          contraste que faz a maquete ler como app. */}
      <Card
        className={cn(
          "glow-ring group overflow-hidden bg-[#111114] transition-colors duration-300",
          // O cartao em destaque tem a borda clara SEMPRE, sem depender de
          // hover — mesma gramatica de destaque do cartao Anual em Precos —, e
          // com 2px no lugar de 1: `border-2` sobrescreve o `border` que vem do
          // proprio componente Card (o twMerge do cn resolve, porque as duas
          // classes sao do mesmo grupo de largura de borda).
          // Os outros dois seguem apagados e so acendem sob o mouse, o que
          // mantem a diferenca visivel mesmo com o cursor em cima de um deles.
          bigger ? "border-2 border-white/40" : "hover:border-white/25"
        )}
      >
        {/* cabecalho */}
        <div className="border-b border-white/[0.08] p-6">
          <div className="flex items-center gap-3.5">
            <RingIcon icon={icon} />
            <h3 className="min-w-0 flex-1 font-display text-[1.375rem] font-semibold tracking-[-0.02em] text-[#FAFAFA]">
              {title}
            </h3>
          </div>

          {/* min-h = duas linhas a text-sm/leading-relaxed (~2.85rem). As tres
              frases quebram em duas linhas na largura atual; a reserva existe
              pra que, se alguma passar a caber em uma so, o palco dos tres
              continue comecando na mesma altura. */}
          <p className="mt-4 min-h-[2.85rem] text-sm leading-relaxed text-white/55">
            {desc}
          </p>
        </div>

        {/* palco: tela embutida, maquete ancorada no topo. Nos dois cartoes
            laterais a maquete SANGRA pra fora e e cortada pelo degrade de
            baixo — "a tela continua".
            No do meio a maquete tambem e cortada, mas o corte foi POSICIONADO:
            a altura garante que a lista e a faixa de repeticao caibam inteiras
            acima da zona do degrade, e quem entra nela e o painel "Lembrar as",
            que existe justamente pra ser o pedaco comido. A conta que amarra
            lista, altura e corte esta no comentario do TASK_LIST.
            Os 385px deixam este palco ~90px mais alto que o dos vizinhos: e
            dai, somado a coluna mais larga, que sai o tamanho maior do cartao
            em destaque. No notebook cai pra 340, e a lista perde uma linha
            junto (TASKS_ON_LAPTOP) pra a faixa de dias continuar fora do
            degrade. */}
        <div
          className={cn(
            "relative overflow-hidden bg-ink-950 px-6 pt-6",
            bigger
              ? "h-[385px] laptop:h-[340px]"
              : "h-[275px] sm:h-[295px] laptop:h-[230px]"
          )}
        >
          {/* luz entrando pela borda de cima: sem ela o palco e um retangulo
              preto chapado, e a maquete parece colada em cima do nada */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 z-0 h-24 bg-gradient-to-b from-white/[0.045] to-transparent"
          />
          {/* no hover a maquete sobe um pouco e mostra mais um naco do que
              estava cortado — o gesto de quem rola a tela */}
          <div className="relative z-10 transition-transform duration-500 ease-out group-hover:-translate-y-1.5">
            {children}
          </div>
          {/* Degrade de baixo: o MESMO nos tres cartoes agora. Ele chegou a
              ficar curto so no do meio, porque a lista era longa e a faixa de
              dias encostava no rodape; com a lista encurtada sobra folga
              suficiente pra ele voltar ao tamanho padrao sem tocar nos
              circulos dos dias. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-16 bg-gradient-to-t from-ink-950 via-ink-950/75 to-transparent"
          />
        </div>
      </Card>

      {/* legenda: a frase que cria o que o cartao acabou de mostrar */}
      <p className="mt-4 px-1 text-center text-[13px] italic leading-snug text-white/45 laptop:mt-3 laptop:px-0 laptop:text-[11px]">
        “{command}”
      </p>
    </motion.div>
  );
}

// ---- Pecas compartilhadas pelas maquetes -------------------------------------

// Painel: um tom ACIMA do palco (ink-800 sobre ink-950). Quem esta recuado e o
// palco inteiro, entao o painel volta a ser o que ele e num app de verdade —
// um cartao pousado sobre a tela escura.
function Panel({
  title,
  aside,
  children,
}: {
  title: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-chip border border-white/[0.1] bg-ink-800 p-3.5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="text-[10px] uppercase tracking-[0.14em] text-white/35">
          {title}
        </span>
        {aside}
      </div>
      {children}
    </div>
  );
}

// ---- Maquete 1: a tarefa -----------------------------------------------------
// A LISTA (o que sobra depois) e, logo abaixo, a faixa de repeticao — o unico
// pedaco do antigo formulario que sobreviveu, porque e o que diferencia uma
// tarefa do Jarvis de um bloco de notas.
//
// O NUMERO de itens importa mais aqui do que nas outras duas maquetes, porque
// este cartao tem que atender duas coisas ao mesmo tempo: a faixa de dias
// aparece INTEIRA, e ainda assim algo e cortado no rodape pro degrade ter o
// que apagar. Cada linha custa 24px (16 de altura + 8 de vao), e a conta e:
//
//   padding do topo (24) + lista + vao (12) + faixa de dias (79)
//     = onde a faixa de dias termina, que precisa ficar ACIMA da zona do
//       degrade (os ultimos 64px do palco)
//
// O painel "Lembrar as" vem depois e cai justamente dentro dessa zona: ele e
// o que o degrade come. Somar linhas na lista empurra a faixa de dias pra
// dentro do degrade e apaga os circulos dos dias — que e o que a mudanca
// anterior corrigiu. Sao 5 no desktop e 4 no notebook (a ultima some em
// `laptop:`, ver TaskMock), onde o palco e mais curto.
const TASK_LIST = [
  { text: "Revisar contrato do cliente", done: true },
  { text: "Enviar relatório de março", done: false },
  { text: "Confirmar reunião de quinta", done: false },
  { text: "Pagar a fatura do cartão", done: false },
  { text: "Responder o e-mail do fornecedor", done: false },
];

// Quantas linhas sobrevivem no breakpoint de notebook (tela larga, mas baixa).
const TASKS_ON_LAPTOP = 4;

// D S T Q Q S S — semana comecando no domingo, como em toda agenda BR. `on`
// marca os dias em que a tarefa se repete: e o "quais dias sim e quais nao".
const WEEK = [
  { label: "D", on: false },
  { label: "S", on: true },
  { label: "T", on: false },
  { label: "Q", on: true },
  { label: "Q", on: false },
  { label: "S", on: true },
  { label: "S", on: false },
];

function TaskMock() {
  const done = TASK_LIST.filter((t) => t.done).length;
  return (
    <div className="space-y-3">
      <Panel
        title="Minhas tarefas"
        aside={
          <span className="font-mono text-[10px] text-white/40">
            {done}/{TASK_LIST.length}
          </span>
        }
      >
        <div className="space-y-2">
          {TASK_LIST.map((t, i) => (
            <div
              key={t.text}
              className={cn(
                "flex items-center gap-2.5",
                // as linhas alem do limite somem no notebook, onde o palco e
                // mais curto — sem isso elas empurrariam a faixa de dias pra
                // fora do quadro justo nas telas mais baixas
                i >= TASKS_ON_LAPTOP && "laptop:hidden"
              )}
            >
              <span
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-[5px] border ${
                  t.done
                    ? "border-white/70 bg-white/85 text-ink-950"
                    : "border-white/25"
                }`}
                aria-hidden
              >
                {t.done && <Check size={10} weight="bold" />}
              </span>
              <span
                className={`min-w-0 flex-1 truncate text-xs ${
                  t.done ? "text-white/30 line-through" : "text-white/75"
                }`}
              >
                {t.text}
              </span>
            </div>
          ))}
        </div>
      </Panel>

      <Panel
        title="Repete em"
        aside={<Repeat size={13} aria-hidden className="text-white/30" />}
      >
        <div className="flex gap-1.5">
          {WEEK.map((d, i) => (
            <span
              key={i}
              className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] ${
                d.on
                  ? "bg-[#FAFAFA] font-medium text-ink-950"
                  : "border border-white/[0.12] text-white/25"
              }`}
            >
              {d.label}
            </span>
          ))}
        </div>
      </Panel>

      {/* Terceiro painel, de proposito SO PELA METADE: e ele que da ao degrade
          de baixo alguma coisa pra apagar. Sem nada aqui o sombreado caia
          sobre palco vazio, onde ele e invisivel (o degrade vai de ink-950 a
          transparente sobre um fundo que ja e ink-950). Com ele, o corte volta
          a ler como "a tela continua", que e a linguagem dos outros dois
          cartoes — so que aqui sem sacrificar a faixa de dias, que continua
          inteira acima da zona do degrade. */}
      <Panel
        title="Lembrar às"
        aside={<BellRinging size={13} aria-hidden className="text-white/30" />}
      >
        <div className="flex items-center gap-2">
          <Clock size={12} aria-hidden className="shrink-0 text-white/40" />
          <span className="flex-1 text-xs text-white/70">Todo dia, de manhã</span>
          <span className="rounded-chip border border-white/[0.14] bg-white/[0.05] px-2 py-1 font-mono text-[11px] text-white/85">
            08:30
          </span>
        </div>
      </Panel>
    </div>
  );
}

// ---- Maquete 2: o dia na agenda ----------------------------------------------
// Faixa da semana em cima (e ali que se ve "escolher o dia") e o dia aberto
// embaixo (e ali que se ve "escolher a hora").

const MONTH_DAYS = [
  { week: "S", day: 9 },
  { week: "T", day: 10 },
  { week: "Q", day: 11 },
  { week: "Q", day: 12, on: true },
  { week: "S", day: 13 },
  { week: "S", day: 14 },
  { week: "D", day: 15 },
];

// Quatro compromissos: o dia tem que passar da borda do cartao. Um dia que
// termina dentro do quadro pareceria um dia vazio.
const AGENDA = [
  { time: "09:00", title: "Reunião de equipe", tag: "toda quinta", icon: Repeat },
  { time: "14:00", title: "Dentista", tag: "avisar 1h antes", icon: BellRinging },
  { time: "18:30", title: "Academia", tag: "seg, qua e sex", icon: Repeat },
  { time: "20:00", title: "Jantar com a Bia", tag: "avisar 30min antes", icon: BellRinging },
];

function AgendaMock() {
  return (
    <Panel
      title="Março"
      aside={<CalendarCheck size={13} aria-hidden className="text-white/30" />}
    >
      {/* faixa da semana */}
      <div className="grid grid-cols-7 gap-1">
        {MONTH_DAYS.map((d) => (
          <span
            key={d.day}
            className={`flex flex-col items-center gap-1 rounded-chip py-1.5 ${
              d.on ? "bg-[#FAFAFA] text-ink-950" : ""
            }`}
          >
            <span
              className={`text-[9px] uppercase ${
                d.on ? "text-ink-950/60" : "text-white/25"
              }`}
            >
              {d.week}
            </span>
            <span
              className={`text-[11px] ${d.on ? "font-semibold" : "text-white/55"}`}
            >
              {d.day}
            </span>
          </span>
        ))}
      </div>

      {/* o dia aberto */}
      <div className="mt-3 space-y-2 border-t border-white/[0.07] pt-3">
        {AGENDA.map((e) => {
          const Tag = e.icon;
          return (
            <div key={e.title} className="flex items-stretch gap-2.5">
              <span className="w-9 shrink-0 pt-2 text-right font-mono text-[10px] text-white/30">
                {e.time}
              </span>
              <span className="w-px shrink-0 bg-white/[0.12]" aria-hidden />
              <div className="min-w-0 flex-1 rounded-chip border border-white/[0.1] bg-white/[0.05] px-3 py-2">
                <p className="truncate text-xs text-white/85">{e.title}</p>
                <p className="mt-1 flex items-center gap-1.5 text-[10px] text-white/40">
                  <Tag size={10} aria-hidden />
                  {e.tag}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

// ---- Maquete 3: o lembrete ---------------------------------------------------
// A notificacao (o momento em que ele cumpre) + a fila do que ainda vem (o
// "escolhi dia e hora" de outros lembretes ja marcados).

function JarvisDot() {
  return (
    <span className="relative block h-3 w-3" aria-hidden>
      <span className="absolute left-1/2 top-0 h-1 w-1 -translate-x-1/2 rounded-full bg-white" />
      <span className="absolute left-0 top-1/2 h-1 w-1 -translate-y-1/2 rounded-full bg-white" />
      <span className="absolute right-0 top-1/2 h-1 w-1 -translate-y-1/2 rounded-full bg-white" />
      <span className="absolute bottom-0 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-white" />
    </span>
  );
}

const NEXT_REMINDERS = [
  { when: "Amanhã · 07:30", text: "Tomar o remédio" },
  { when: "Sex · 19:00", text: "Comprar presente da Bia" },
  { when: "Sáb · 10:00", text: "Levar o carro na revisão" },
  { when: "Seg · 08:00", text: "Renovar o seguro" },
  { when: "Ter · 15:00", text: "Retorno com a médica" },
  { when: "Qua · 12:00", text: "Pagar o condomínio" },
];

function ReminderMock() {
  return (
    <div className="space-y-3">
      {/* a notificacao chegando */}
      <div className="relative">
        <div
          aria-hidden
          className="absolute inset-x-3 -top-2 h-10 rounded-chip border border-white/[0.07] bg-ink-800/70"
        />
        <div className="relative rounded-chip border border-white/[0.16] bg-ink-800 p-3.5 shadow-[0_18px_40px_-24px_rgba(0,0,0,1)]">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full border border-white/25 bg-white/[0.08]">
              <JarvisDot />
            </span>
            <span className="text-[11px] font-medium text-white/70">Jarvis</span>
            <span className="ml-auto text-[10px] text-white/30">agora</span>
          </div>
          <p className="mt-2.5 text-sm leading-snug text-white/90">
            Lembrete: ligar para a Ana.
          </p>
          <p className="mt-2 flex items-center gap-1.5 text-[11px] text-white/40">
            <Clock size={11} aria-hidden />
            hoje, 18:00
          </p>
        </div>
      </div>

      {/* a fila */}
      <Panel title="Próximos">
        <div className="space-y-2">
          {NEXT_REMINDERS.map((r) => (
            <div key={r.text} className="flex items-center gap-2.5">
              <BellRinging size={12} aria-hidden className="shrink-0 text-white/30" />
              <span className="min-w-0 flex-1 truncate text-xs text-white/65">
                {r.text}
              </span>
              <span className="shrink-0 font-mono text-[10px] text-white/35">
                {r.when}
              </span>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

export default function Organization() {
  const reduce = useReducedMotionSafe();

  return (
    <section
      id="organizacao"
      // FUNDO HERDADO: esta secao desceu de lugar (passou a vir depois da
      // Interface) e adotou o fundo que ja morava nessa posicao da pagina — o
      // ink-900 com o halo central, que antes era o da secao da dashboard. Os
      // fundos ficaram parados; o conteudo e que trocou.
      className="relative overflow-hidden border-t border-white/[0.07] bg-ink-900 px-6 pb-28 pt-20 sm:pb-36 sm:pt-28 lg:px-10 laptop:pb-16 laptop:pt-16 wide:px-16"
    >
      {/* fundo: halo central */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute left-1/2 top-1/3 h-[460px] w-[720px] -translate-x-1/2 rounded-full bg-white/[0.05] blur-[150px]" />
      </div>

      {/* 84rem (1344px) em vez do max-w-6xl (1152px) das outras secoes: os
          cartoes precisam de largura pra maquete respirar. Fica a 56px do teto
          do shell (1400px) — perto do maximo que da pra esticar sem que a
          secao passe a destoar das vizinhas em telas nao-wide. */}
      <div className="relative mx-auto max-w-[84rem] wide:max-w-shell">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, ease: EASE }}
          // max-w-5xl (nao mais 2xl): a 48px (sm:text-5xl) o titulo precisa
          // de ~838px pra caber numa linha so — 672px nao dava conta. O
          // paragrafo abaixo mantem sua propria largura (max-w-[52ch]).
          className="mx-auto max-w-5xl text-center"
        >
          <SectionEyebrow>Organização</SectionEyebrow>
          {/* Fonte fluida (calc com vw), sem degrau fixo em sm: — a formula
              cresce direto ate travar sozinha em 48px (por volta de 890px de
              largura, bem antes do padding da secao mudar em 1024px), entao
              nao existe salto que possa descasar do espaco real. */}
          <h2 className="mt-5 whitespace-nowrap leading-tight font-display text-[length:clamp(0.9rem,calc(5.73vw_-_3.09px),3rem)] font-semibold tracking-[-0.02em] text-[#FAFAFA] laptop:text-[2.625rem]">
            Tudo que você precisa. Em um só lugar.
          </h2>
          <p className="mx-auto mt-5 max-w-[52ch] text-lg font-light leading-relaxed text-white/55 laptop:mt-4">
            Tarefas, agenda e lembretes vivem dentro do Jarvis — você fala, ele
            anota, e avisa na hora certa.
          </p>
        </motion.div>

        {/* A coluna do meio e 1.14fr contra 1fr das laterais: e dai que sai a
            largura maior do cartao em destaque. Tarefas vem PRIMEIRO no HTML
            (e o principal dos tres, e no celular, onde a grade vira coluna
            unica, tem que abrir a fila) e so vai pro meio quando os tres
            entram lado a lado, em lg.
            items-center (nao items-start): os dois laterais sao mais baixos
            que o do meio, entao centraliza-los no eixo os desce um pouco e
            faz os tres compartilharem a MESMA LINHA DO MEIO em vez do mesmo
            topo. Com topo alinhado a diferenca de altura virava um degrau so
            embaixo, que lia como desalinho; centrado, ela se divide nas duas
            pontas e vira escalonamento de proposito. */}
        <div className="mt-16 grid gap-x-6 gap-y-10 lg:grid-cols-[1fr_1.14fr_1fr] lg:items-center laptop:mt-12">
          <FeatureCard
            icon={ListChecks}
            title="Tarefas"
            desc="Ele cria, marca como feita e repete nos dias que você escolher."
            command="Jarvis, cria uma tarefa pra revisar o contrato toda segunda, quarta e sexta."
            bigger
            className="lg:order-2"
          >
            <TaskMock />
          </FeatureCard>

          <FeatureCard
            icon={CalendarCheck}
            title="Agenda"
            desc="Compromissos com dia e hora. Ele repete e avisa antes, se você pedir."
            command="Jarvis, marca dentista quinta às 14h e me avisa uma hora antes."
            delay={0.08}
            className="lg:order-1"
          >
            <AgendaMock />
          </FeatureCard>

          <FeatureCard
            icon={BellRinging}
            title="Lembretes"
            desc="Aquilo que você só não quer esquecer, avisado na hora exata."
            command="Jarvis, me lembra de ligar pra Ana hoje às 18h e de tomar o remédio."
            delay={0.16}
            className="lg:order-3"
          >
            <ReminderMock />
          </FeatureCard>
        </div>
      </div>
    </section>
  );
}
