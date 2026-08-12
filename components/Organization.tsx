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
  NotePencil,
  TextAlignLeft,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";

// SECAO RECONSTRUIDA DO ZERO (3a vez) — este arquivo ja foi o hub orbital de
// integracoes e depois uma grade de apps conectados. Os dois viraram redundantes
// quando a secao "Recursos" (Features.tsx) virou a vitrine real das integracoes,
// com as sete demos rodando de verdade. Entao aqui a secao mudou de ASSUNTO:
// passa a explicar o lado organizador do Jarvis — tarefas, agenda e lembretes —
// que ate entao a pagina inteira nao mencionava em lugar nenhum.
//
// Formato: TRES CARTOES LADO A LADO, um por recurso, todos na proporcao 3:4
// (retrato). Antes eram tres linhas largas — texto de um lado, maquete do
// outro, alternando —, e cada recurso comia a pagina inteira: a secao passava
// de 1800px de altura pra dizer tres coisas. Em 3:4 os tres cabem no mesmo
// olhar e a comparacao entre eles e imediata.
//
// A altura do cartao e travada pela proporcao, entao ela NAO acompanha o
// conteudo. Dai a divisao em duas zonas, sempre nesta ordem:
//
//   PALCO (em cima, ~60% do cartao) — fundo ink-950, um degrau ABAIXO do
//   cartao: e uma tela embutida, e por isso as maquetes agora sobem um tom
//   (ink-800) pra continuarem lendo como objetos em cima dela, igual a um
//   app em modo escuro de verdade. A maquete e ancorada no topo e SANGRA pra
//   dentro do rodape, apagando num degrade. E de proposito — tela nao termina,
//   continua —, e por isso cada maquete tem mais conteudo do que cabe: em
//   qualquer largura ela e cortada, e o corte le como continuacao, nunca como
//   espaco que sobrou.
//
//   ROTULO (embaixo, altura fixa) — icone em anel duplo, nome e uma frase de
//   duas linhas. Fica DEPOIS do palco de proposito: assim o corte da maquete
//   acontece no meio do cartao, contra uma borda de verdade, em vez de
//   esfumacar na borda de baixo e deixar o cartao sem fechamento. E, sendo o
//   rodape de altura fixa, os tres titulos caem exatamente na mesma linha.
//
// Fora do cartao, logo abaixo dele, vem o COMANDO: a frase falada que cria
// aquilo. Saiu de dentro do rodape por dois motivos — devolveu ~45px de palco
// pra maquete, e a frase e de outra natureza: o cartao mostra o RESULTADO, a
// frase e o que voce faz. Legenda de foto, nao conteudo do cartao.
//
// Tarefas fica no MEIO e em destaque — e o recurso central dos tres e o unico
// com duas maquetes. O destaque e tamanho + superficie: a coluna do meio e uma
// fracao mais larga que as duas laterais e, como a proporcao e a mesma, o
// cartao cresce junto na altura; por cima disso, borda clara e superficie
// ink-700. Os tres cartoes comecam na mesma linha em cima; embaixo o do meio
// desce mais, e a legenda dele desce junto — legenda anda com o cartao dela,
// nao com a dos vizinhos.
//
// As chips de "anatomia" da versao em linhas nao voltaram: em 3:4 o vertical e
// o recurso escasso, e a maquete ja mostra o recurso campo por campo.
// Fundo dos cartoes: bg-ink-800, o mesmo do cartao Anual em Precos — os dois
// sao "o cartao de conteudo solido" do site.

const EASE = [0.16, 1, 0.3, 1] as const;

// ---- Icone em anel duplo (o "before:-inset-2" do bloco de referencia, aqui
// com um span de verdade pra nao depender de pseudo-elemento). ---------------
function RingIcon({ icon: Glyph }: { icon: Icon }) {
  return (
    <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/[0.16] bg-ink-950">
      <span
        aria-hidden
        className="absolute -inset-[6px] rounded-full border border-white/[0.07]"
      />
      <Glyph size={18} weight="light" aria-hidden className="text-white/85" />
    </span>
  );
}

// ---- O cartao ---------------------------------------------------------------
// Proporcao 3:4 travada a partir de `lg`, que e onde os tres ficam lado a lado.
// Abaixo disso eles empilham em coluna unica e a altura volta a ser livre — mas
// o palco ganha um teto (`max-h`) pra manter o mesmo desenho em qualquer tela:
// maquete cortada em cima, rotulo inteiro embaixo.
//
// As alturas fixas do rotulo (`min-h` na frase e no comando) existem so pra uma
// coisa: garantir que os tres cartoes tenham o rodape do mesmo tamanho, mesmo
// quando um texto quebra em menos linhas que o outro — se um rodape encolhe, o
// palco do lado cresce e o corte das maquetes desalinha.
function FeatureCard({
  icon,
  title,
  desc,
  command,
  highlight = false,
  delay = 0,
  className,
  children,
}: {
  icon: Icon;
  title: string;
  desc: string;
  command: string;
  highlight?: boolean;
  delay?: number;
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
      <Card
        className={cn(
          // laptop:aspect-*: a altura do cartao sai da LARGURA pela proporcao,
          // entao encurtar a proporcao e o unico jeito de baixar a altura sem
          // estreitar o cartao (estreitar espremeria as maquetes, que sao
          // desenhadas na largura cheia). O palco ja e cortado por um degrade
          // embaixo — num notebook ele so mostra um naco menor da maquete.
          "glow-ring group flex flex-col overflow-hidden transition-colors duration-300 lg:aspect-[3/4] laptop:aspect-[3/3.3]",
          highlight
            ? // mesma gramatica de destaque do cartao Anual em Precos: borda
              // clara e superficie um degrau acima, sem brilho externo — o
              // tamanho ja faz o trabalho de tirar ele do plano dos outros.
              "border-white/40 bg-ink-700"
            : "bg-ink-800 hover:border-white/25"
        )}
      >
        {/* palco: tela embutida, maquete ancorada no topo e cortada no degrade */}
        <div className="relative max-h-64 min-h-0 flex-1 overflow-hidden bg-ink-950 px-5 pt-5 lg:max-h-none">
          {/* luz entrando pela borda de cima: sem ela o palco e um retangulo
              preto chapado, e a maquete parece colada em cima do nada */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 z-0 h-28 bg-gradient-to-b from-white/[0.045] to-transparent"
          />
          {/* no hover a maquete sobe um pouco e mostra mais um naco do que
              estava cortado — o gesto de quem rola a tela */}
          <div className="relative z-10 transition-transform duration-500 ease-out group-hover:-translate-y-1.5">
            {children}
          </div>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-16 bg-gradient-to-t from-ink-950 via-ink-950/75 to-transparent"
          />
        </div>

        {/* rotulo */}
        <div className="shrink-0 border-t border-white/[0.08] p-5">
          <div className="flex items-center gap-3.5">
            <RingIcon icon={icon} />
            <h3 className="min-w-0 flex-1 font-display text-xl font-semibold tracking-[-0.02em] text-[#FAFAFA]">
              {title}
            </h3>
          </div>

          <p className="mt-4 min-h-[2.6rem] text-[13px] leading-relaxed text-white/55">
            {desc}
          </p>
        </div>
      </Card>

      {/* legenda: a frase que cria o que o cartao acabou de mostrar.
          Centralizada e sem o chip de microfone que ficava a esquerda — as
          aspas ja dizem que e fala, e tirar o chip devolveu ~38px de linha
          (28 do chip + 10 do vao), que e justamente o que faz a frase caber
          em UMA linha no notebook.
          Medido a 1366px, a 11px: a mais longa (Tarefas, no cartao do meio)
          pede 379px contra 427px de coluna, e a de Agenda 325px contra
          374px — ~48px de folga nas duas. Sem segunda linha, nenhuma legenda
          sobra pra baixo do bloco. */}
      <p className="mt-4 px-1 text-center text-[13px] italic leading-snug text-white/45 laptop:mt-3 laptop:px-0 laptop:text-[11px]">
        “{command}”
      </p>
    </motion.div>
  );
}

// ---- Pecas compartilhadas pelas maquetes ------------------------------------

// Painel: um tom ACIMA do palco (ink-800 sobre ink-950). Quem esta recuado
// agora e o palco inteiro, entao o painel volta a ser o que ele e num app de
// verdade — um cartao pousado sobre a tela escura. Mesmo valor do rodape do
// cartao, o que amarra as duas zonas.
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

function FieldLabel({
  icon: Glyph,
  children,
}: {
  icon: Icon;
  children: React.ReactNode;
}) {
  return (
    <p className="flex items-center gap-1.5 text-[9px] uppercase tracking-[0.12em] text-white/30">
      <Glyph size={10} aria-hidden />
      {children}
    </p>
  );
}

// Chavinha ligada/desligada das maquetes.
function Toggle({ on }: { on: boolean }) {
  return (
    <span
      className={`flex h-4 w-7 shrink-0 items-center rounded-full px-[3px] ${
        on ? "bg-white/75" : "bg-white/[0.12]"
      }`}
      aria-hidden
    >
      <span
        className={`block h-2.5 w-2.5 rounded-full ${
          on ? "ml-auto bg-ink-950" : "bg-white/50"
        }`}
      />
    </span>
  );
}

// ---- Maquete 1: a tarefa -----------------------------------------------------
// Dois paineis: a LISTA (o que sobra depois) e o FORMULARIO (o que voce
// preenche). Um explica o outro — sozinho, o formulario seria abstrato.

// Cinco itens porque o cartao de Tarefas e o maior dos tres: com tres a lista
// terminava dentro do quadro e o formulario logo abaixo nao chegava a ser
// cortado — some o efeito de tela que continua.
const TASK_LIST = [
  { text: "Revisar contrato do cliente", done: true },
  { text: "Enviar relatório de março", done: false },
  { text: "Confirmar reunião de quinta", done: false },
  { text: "Pagar a fatura do cartão", done: false },
  { text: "Responder o e-mail do fornecedor", done: false },
];

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

// A lista vem primeiro e o formulario logo abaixo, ja entrando na zona do
// corte: o que se ve inteiro e o RESULTADO, e o formulario aparece pela metade
// como quem diz "e assim que ele nasce".
function TaskListPanel() {
  const done = TASK_LIST.filter((t) => t.done).length;
  return (
    <Panel
      title="Minhas tarefas"
      aside={
        <span className="font-mono text-[10px] text-white/40">
          {done}/{TASK_LIST.length}
        </span>
      }
    >
      <div className="space-y-2">
        {TASK_LIST.map((t) => (
          <div key={t.text} className="flex items-center gap-2.5">
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
  );
}

function TaskFormPanel() {
  return (
    <Panel
      title="Nova tarefa"
      aside={
        <span className="rounded-full border border-white/25 bg-white/[0.08] px-2.5 py-[3px] text-[10px] text-white/75">
          Salvar
        </span>
      }
    >
      <div className="space-y-3">
        <div>
          <FieldLabel icon={NotePencil}>Título</FieldLabel>
          <p className="mt-1 truncate text-xs text-white/85">
            Revisar contrato do cliente
          </p>
        </div>

        <div>
          <FieldLabel icon={TextAlignLeft}>Descrição</FieldLabel>
          <p className="mt-1 text-xs leading-relaxed text-white/45">
            Conferir as cláusulas 4 e 7 antes de assinar.
          </p>
        </div>

        <div className="space-y-2.5 border-t border-white/[0.07] pt-3">
          <div className="flex items-center gap-2">
            <Repeat size={12} aria-hidden className="shrink-0 text-white/40" />
            <span className="flex-1 text-xs text-white/70">Recorrente</span>
            <Toggle on />
          </div>

          <div>
            <p className="mb-1.5 text-[9px] uppercase tracking-[0.12em] text-white/30">
              Repete em
            </p>
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
          </div>
        </div>

        <div className="flex items-center gap-2 border-t border-white/[0.07] pt-3">
          <BellRinging size={12} aria-hidden className="shrink-0 text-white/40" />
          <span className="flex-1 text-xs text-white/70">Lembrar às</span>
          <span className="rounded-chip border border-white/[0.14] bg-white/[0.05] px-2 py-1 font-mono text-[11px] text-white/85">
            08:30
          </span>
        </div>
    </div>
    </Panel>
  );
}

// ---- Maquete 2: o dia na agenda ---------------------------------------------
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
  { time: "21:30", title: "Ligar pro pai", tag: "avisar 10min antes", icon: BellRinging },
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
              className={`text-[11px] ${
                d.on ? "font-semibold" : "text-white/55"
              }`}
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
  { when: "Qui · 17:00", text: "Buscar a encomenda" },
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
      // laptop:* (ver tailwind.config.ts): mesmo tratamento da secao de
      // Recursos — tela de desktop, mas baixa. Aqui os 1167px de altura vem
      // quase todos de dois lugares: o bloco do titulo e a proporcao 3/4 dos
      // cartoes, que num notebook deixa so a metade de cima deles visivel.
      className="relative overflow-hidden border-t border-white/[0.07] bg-ink-900 px-6 pb-28 pt-20 sm:pb-36 sm:pt-28 lg:px-10 laptop:pb-16 laptop:pt-16 wide:px-16"
    >
      {/* fundo: halo central */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute left-1/2 top-1/3 h-[460px] w-[720px] -translate-x-1/2 rounded-full bg-white/[0.05] blur-[150px]" />
      </div>

      {/* 84rem (1344px), nao mais 76rem (1216px) nem o max-w-6xl (1152px) das
          outras secoes: os tres cartoes tem proporcao travada, entao a unica
          forma de deixa-los maiores e dar largura a grade. Fica a 56px do
          teto do shell (1400px) — perto do maximo que da pra esticar sem
          que a secao passe a destoar das vizinhas em telas nao-wide. */}
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

        {/* A grade para de crescer bem antes do shell (1400px): as maquetes sao
            desenhadas em tamanho fixo, entao cartao largo demais so gera palco
            vazio embaixo delas. O bloco fica centrado, no eixo do titulo.
            Tarefas vem PRIMEIRO no HTML (e o principal dos tres, e no celular
            tem que abrir a fila) e so vai pro meio quando os tres entram lado
            a lado. A coluna do meio e 1.14fr contra 1fr das laterais: e dai
            que sai o tamanho maior do cartao em destaque. */}
        <div className="mx-auto mt-16 grid max-w-[84rem] gap-x-5 gap-y-10 lg:grid-cols-[1fr_1.14fr_1fr] laptop:mt-12">
          <FeatureCard
            icon={ListChecks}
            title="Tarefas"
            desc="Título, descrição, repetição nos dias que você escolher — e lembrete próprio."
            command="Jarvis, cria uma tarefa pra revisar o contrato toda segunda, quarta e sexta."
            highlight
            className="lg:order-2"
          >
            <div className="space-y-3">
              <TaskListPanel />
              <TaskFormPanel />
            </div>
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
            // Alongado pra ficar do tamanho das outras duas legendas (67
            // caracteres contra 63 da Agenda e 76 de Tarefas) — antes eram
            // 46 e a linha ficava visivelmente mais curta que as vizinhas.
            // O segundo lembrete e o mesmo que aparece na maquete do cartao
            // ("Tomar o remédio · Amanhã · 07:30"), entao a frase continua
            // descrevendo o que esta ali em cima.
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
