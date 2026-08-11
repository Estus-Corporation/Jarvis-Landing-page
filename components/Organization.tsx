"use client";

import React from "react";
import { motion } from "motion/react";
import { useReducedMotionSafe } from "@/components/ui/use-reduced-motion-safe";
import SectionEyebrow from "@/components/ui/section-eyebrow";
import { Card, CardContent } from "@/components/ui/card";
import {
  ListChecks,
  CalendarCheck,
  BellRinging,
  Repeat,
  Clock,
  Check,
  Microphone,
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
// Formato: bento grid de cartoes (6 colunas, cada cartao escolhendo quantas
// ocupa), no estilo do bloco de referencia trazido pelo usuario.
//
// Os tres cartoes seguem o MESMO esqueleto de quatro andares, e e dele que vem
// a leitura da secao:
//   1. identidade — icone em anel duplo, nome e uma frase;
//   2. anatomia   — as pecas que o recurso guarda, em chips (e o "campo por
//                   campo" do recurso, sem virar paragrafo);
//   3. maquete    — o recurso desenhado como ele aparece de verdade (um
//                   formulario de tarefa, um dia da agenda, a notificacao
//                   chegando), nao um desenho abstrato;
//   4. comando    — a FRASE que cria aquilo. Fecha o ciclo da pagina inteira:
//                   tudo aqui nasce de voz.
// Fundo dos cartoes: bg-ink-800, o mesmo do cartao Anual em Precos — os dois
// sao "o cartao de conteudo solido" do site.

const EASE = [0.16, 1, 0.3, 1] as const;

// ---- Icone em anel duplo (o "before:-inset-2" do bloco de referencia, aqui
// com um span de verdade pra nao depender de pseudo-elemento). ---------------
function RingIcon({ icon: Glyph }: { icon: Icon }) {
  return (
    <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/[0.16] bg-ink-950">
      <span
        aria-hidden
        className="absolute -inset-2 rounded-full border border-white/[0.07]"
      />
      <Glyph size={20} weight="light" aria-hidden className="text-white/85" />
    </span>
  );
}

// ---- Casca comum dos tres cartoes ------------------------------------------
function CardIdentity({
  icon,
  title,
  desc,
  anatomy,
}: {
  icon: Icon;
  title: string;
  desc: string;
  anatomy: string[];
}) {
  return (
    <div>
      <div className="flex items-start gap-4">
        <RingIcon icon={icon} />
        <div className="min-w-0 pt-0.5">
          <h3 className="font-display text-xl font-semibold tracking-[-0.015em] text-[#FAFAFA]">
            {title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-white/50">{desc}</p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-1.5">
        {anatomy.map((piece) => (
          <span
            key={piece}
            className="rounded-full border border-white/[0.1] bg-white/[0.04] px-2.5 py-1 text-[10px] uppercase tracking-[0.1em] text-white/45"
          >
            {piece}
          </span>
        ))}
      </div>
    </div>
  );
}

function CardCommand({ command }: { command: string }) {
  return (
    <div className="mt-6 flex items-center gap-2.5 border-t border-white/[0.08] pt-4">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/[0.14] bg-white/[0.04]">
        <Microphone size={12} weight="light" aria-hidden className="text-white/60" />
      </span>
      <p className="min-w-0 text-[13px] italic leading-snug text-white/45">
        “{command}”
      </p>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  desc,
  anatomy,
  command,
  delay,
  split = false,
  extra,
  className = "",
  children,
}: {
  icon: Icon;
  title: string;
  desc: string;
  anatomy: string[];
  command: string;
  delay: number;
  // conteudo opcional embaixo do texto, so no layout `split`
  extra?: React.ReactNode;
  // `split`: cartao largo, com o texto de um lado e a maquete do outro. E o que
  // resolve o buraco que a tarefa tinha quando era um cartao alto e estreito —
  // ali a maquete era mais curta que a coluna inteira, e a sobra virava um vao
  // no meio do cartao. Lado a lado, quem manda na altura e a maquete.
  split?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const reduce = useReducedMotionSafe();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, delay, ease: EASE }}
      className={className}
    >
      <Card className="glow-ring group h-full overflow-hidden bg-ink-800 transition-colors duration-300 hover:border-white/25">
        <CardContent className="flex h-full flex-col p-6 sm:p-7">
          {split ? (
            <div className="grid flex-1 items-start gap-6 lg:grid-cols-2 lg:gap-8">
              <div>
                <CardIdentity
                  icon={icon}
                  title={title}
                  desc={desc}
                  anatomy={anatomy}
                />
                {/* o slot extra equilibra as duas colunas: sem ele o texto
                    ficava bem mais curto que a maquete e sobrava um vao. */}
                {extra && <div className="mt-6">{extra}</div>}
              </div>
              <div className="min-w-0">{children}</div>
            </div>
          ) : (
            <>
              <CardIdentity
                icon={icon}
                title={title}
                desc={desc}
                anatomy={anatomy}
              />
              {/* mt-auto: quando o cartao e esticado pelo vizinho mais alto da
                  linha, a folga fica ANTES da maquete — as duas terminam
                  alinhadas com o rodape em vez de boiarem no meio. */}
              <div className="mt-auto pt-6">{children}</div>
            </>
          )}

          <CardCommand command={command} />
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ---- Pecas compartilhadas pelas maquetes ------------------------------------

// Painel recuado: as maquetes sao "telas dentro do cartao", entao vao um tom
// ABAIXO do fundo do cartao (ink-950 sob ink-800) em vez de mais claras.
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
    <div className="rounded-chip border border-white/[0.1] bg-ink-950 p-3.5">
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

const TASK_LIST = [
  { text: "Revisar contrato do cliente", done: true },
  { text: "Enviar relatório de março", done: false },
  { text: "Pagar a fatura do cartão", done: false },
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

// A lista fica na coluna do TEXTO e o formulario na coluna da maquete: sao os
// dois lados da mesma historia (o que sobra depois x o que voce preenche), e
// separados assim as duas colunas do cartao largo terminam na mesma altura.
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

const AGENDA = [
  { time: "09:00", title: "Reunião de equipe", tag: "toda quinta", icon: Repeat },
  { time: "14:00", title: "Dentista", tag: "avisar 1h antes", icon: BellRinging },
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

        {/* o vao livre depois dos compromissos, pra ler como DIA e nao lista */}
        <div className="flex items-center gap-2.5" aria-hidden>
          <span className="w-9 shrink-0 text-right font-mono text-[10px] text-white/15">
            16:00
          </span>
          <span className="w-px shrink-0 bg-white/[0.06]" />
          <span className="h-px flex-1 bg-white/[0.06]" />
        </div>
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
];

function ReminderMock() {
  return (
    <div className="space-y-3">
      {/* a notificacao chegando */}
      <div className="relative">
        <div
          aria-hidden
          className="absolute inset-x-3 -top-2 h-10 rounded-chip border border-white/[0.07] bg-ink-950/70"
        />
        <div className="relative rounded-chip border border-white/[0.16] bg-ink-950 p-3.5 shadow-[0_18px_40px_-24px_rgba(0,0,0,1)]">
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
      // bg-[#0C0C0E]: bg-ink-900 (#0E0E10) escurecido de leve — bg-ink-950
      // (#0A0A0B) e o proximo tom da escala, mas o salto direto ate la ficava
      // forte demais (a secao ficava identica ao fundo puro da pagina), e um
      // ajuste de so ~25% do caminho (#0D0D0F) ficou leve demais no sentido
      // oposto. Este tom fica a ~40% do caminho ate ink-950.
      className="relative overflow-hidden bg-[#0C0C0E] px-6 pb-28 pt-20 sm:pb-36 sm:pt-28 lg:px-10 wide:px-16"
    >
      {/* fundo: grade + halo */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.045) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage:
              "radial-gradient(ellipse 60% 60% at 50% 45%, #000 25%, transparent 100%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 60% 60% at 50% 45%, #000 25%, transparent 100%)",
          }}
        />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-px overflow-hidden">
          <div className="beam-sweep h-full w-32 bg-gradient-to-r from-transparent via-white/80 to-transparent" />
        </div>
      </div>

      <div className="relative mx-auto max-w-6xl wide:max-w-shell">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="mx-auto max-w-2xl text-center"
        >
          <SectionEyebrow>Organização</SectionEyebrow>
          <h2 className="mt-5 text-balance font-display text-3xl font-semibold tracking-[-0.02em] text-[#FAFAFA] sm:text-5xl">
            Tudo que você precisa. Em um só lugar.
          </h2>
          <p className="mx-auto mt-5 max-w-[52ch] text-lg font-light leading-relaxed text-white/55">
            Tarefas, agenda e lembretes vivem dentro do Jarvis — você fala, ele
            anota, e avisa na hora certa.
          </p>
        </motion.div>

        {/* Bento: Tarefas ocupa a linha inteira de cima, em cartao largo (texto
            de um lado, maquete do outro — e o recurso com mais regras, e o que
            tem mais o que mostrar); Agenda e Lembretes dividem a linha de
            baixo. Abaixo de lg tudo vira uma coluna so, na mesma ordem. */}
        <div className="mt-16 grid grid-cols-1 gap-4 lg:grid-cols-6">
          <FeatureCard
            icon={ListChecks}
            title="Tarefas"
            desc="Uma checklist de verdade: título, descrição e, se você quiser, repetição — marcando em quais dias da semana ela aparece e em quais não. Cada tarefa ainda pode ter o próprio lembrete, no dia e na hora que você escolher."
            anatomy={["Título", "Descrição", "Recorrência", "Dias da semana", "Lembrete"]}
            command="Jarvis, cria uma tarefa pra revisar o contrato toda segunda, quarta e sexta, e me lembra às 8h30."
            delay={0}
            split
            extra={<TaskListPanel />}
            className="lg:col-span-6"
          >
            <TaskFormPanel />
          </FeatureCard>

          <FeatureCard
            icon={CalendarCheck}
            title="Agenda"
            desc="Compromissos com dia e hora marcados. Diga se ele se repete e se quer ser avisado antes — o Jarvis segura o resto."
            anatomy={["Dia", "Horário", "Recorrência", "Aviso"]}
            command="Jarvis, marca dentista quinta às 14h e me avisa uma hora antes."
            delay={0.1}
            className="lg:col-span-3"
          >
            <AgendaMock />
          </FeatureCard>

          <FeatureCard
            icon={BellRinging}
            title="Lembretes"
            desc="Aquilo que você só não quer esquecer. Fale o que é, escolha o dia e a hora, e ele te lembra na hora exata."
            anatomy={["O que lembrar", "Dia", "Horário"]}
            command="Jarvis, me lembra de ligar pra Ana hoje às 18h."
            delay={0.2}
            className="lg:col-span-3"
          >
            <ReminderMock />
          </FeatureCard>
        </div>
      </div>
    </section>
  );
}
