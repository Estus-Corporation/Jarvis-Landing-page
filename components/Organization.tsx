"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  type PanInfo,
} from "motion/react";
import { useReducedMotionSafe } from "@/components/ui/use-reduced-motion-safe";
import { useMediaQuery } from "@/components/ui/use-media-query";
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

// ---- Arrasto lateral (so no celular) -------------------------------------
// Mesmos limiares do carrossel de capacidades em Features.tsx — gatilho por
// DISTANCIA ou por VELOCIDADE (um peteleco curto e rapido conta tanto quanto
// um arrasto lento e longo), pra ficar consistente com o unico outro
// carrossel-de-arrastar que a pagina ja tem.
const SWIPE_DISTANCE = 56; // px percorridos
const SWIPE_VELOCITY = 380; // px/s no momento em que o dedo solta

// ESPIADA DO VIZINHO: o cartao nao ocupa a largura toda da tira — sobra uma
// faixa onde o proximo aparece cortado, em repouso, desde o primeiro olhar.
// Antes disso a unica pista de que a coisa arrasta era um empurraozinho
// automatico (28px de ida e volta, meio segundo depois da secao entrar na
// tela); quem chegasse na secao com a animacao ja tocada nao via pista
// nenhuma. Um pedaco de cartao parado na borda nao tem esse problema: nao
// depende de tempo, nao passa.
//
// A tira e FULL-BLEED (`-mx-6 px-6` na janela de recorte, mais abaixo): ela
// sangra por baixo do respiro lateral da secao, entao o vizinho aparece ate a
// borda REAL da tela, sem parar 24px antes dela. Numeros identicos aos de
// Features.tsx ("Ele age no computador") de proposito: os dois carrosseis
// ficam a um scroll de distancia um do outro, e cartao de tamanho diferente
// entre eles lia como descuido. Com estes valores o cartao mede exatamente o
// mesmo dos de la, e a espiada visivel = respiro (24px) + SLIDE_INSET - GAP.
//
// SLIDE_INSET e o quanto o cartao cede de largura; GAP e so o vao entre eles
// (o `gap-4` da tira). Os dois vivem tambem no CSS da largura do slide
// (`w-[calc(100%-1.25rem)]`) pra tira ja nascer com a proporcao certa antes
// de qualquer medicao — o JS aqui embaixo so calcula ONDE cada parada fica,
// nunca o tamanho.
const SLIDE_INSET = 20; // px que o cartao cede pro vizinho (= 1.25rem)
const GAP = 16; // px de vao entre cartoes (= gap-4)

// Largura do trilho da barra de progresso, em px (o polegar e 1/CARDS.length
// dela). Fica em JS, e nao so no CSS, porque o deslocamento do polegar e
// calculado em pixels a partir do `x` da tira — as duas contas precisam sair
// do MESMO numero.
const RAIL_WIDTH = 168;

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
// Miolo visual separado da animacao de entrada (FeatureCard, logo abaixo) —
// o carrossel do celular (mais abaixo, dentro de Organization()) precisa do
// MESMO desenho de cartao mas SEM o whileInView de entrada, que so faz
// sentido tocar uma vez, quando a secao aparece na tela — nao de novo a cada
// vez que alguem arrasta pro cartao seguinte.
// As duas alturas fixas (min-h na frase do cabecalho, h no palco) existem so
// pra uma coisa: garantir que os cartoes fiquem alinhados mesmo quando um
// texto quebra em menos linhas que o outro — se um cabecalho encolhe, o palco
// do lado desalinha do vizinho. O cabecalho tem a mesma altura nos tres
// (inclusive no do meio); quem muda no `bigger` e so o palco.
function FeatureCardBody({
  icon,
  title,
  desc,
  command,
  bigger = false,
  stageHeight,
  children,
}: {
  icon: Icon;
  title: string;
  desc: string;
  command: string;
  bigger?: boolean;
  // So o carrossel do celular passa isto: altura do palco em px, pra empatar
  // a altura dos tres cartoes quando as frases do cabecalho quebram em
  // numeros de linha diferentes (ver o calculo em Organization()). Sem o
  // valor, o palco fica com a altura das classes, como sempre foi.
  stageHeight?: number;
  children: React.ReactNode;
}) {
  return (
    <>
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
        {/* cabecalho (data-card-head: e por aqui que o carrossel do celular
            acha e mede este bloco de fora — ver o comentario do calculo de
            altura em Organization()) */}
        <div data-card-head className="border-b border-white/[0.08] p-6">
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
          data-card-stage
          className={cn(
            "relative overflow-hidden bg-ink-950 px-6 pt-6",
            bigger
              ? "h-[385px] laptop:h-[340px]"
              : "h-[275px] sm:h-[295px] laptop:h-[230px]"
          )}
          // O inline sobrescreve a altura das classes acima quando o carrossel
          // do celular pede — e de proposito que a folga entre num palco que
          // ja e uma tela CORTADA: o que aparece a mais e mais um naco da
          // maquete, nao um vao vazio.
          style={stageHeight ? { height: stageHeight } : undefined}
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
    </>
  );
}

// Casca fina: so a animacao de entrada (uma vez, quando a secao aparece na
// tela) por cima do miolo acima. E o que a grade de desktop usa — o
// carrossel do celular (dentro de Organization()) usa FeatureCardBody direto,
// com uma transicao propria de troca de cartao no lugar desta.
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
      <FeatureCardBody icon={icon} title={title} desc={desc} command={command} bigger={bigger}>
        {children}
      </FeatureCardBody>
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

// Quantas linhas sobrevivem no carrossel do celular. Ali o palco de Tarefas
// nao e mais "maior" que o dos outros dois (ver comentario no `<FeatureCardBody>`
// do carrossel, em Organization()) — usa o MESMO palco curto de Agenda e
// Lembretes (275px). Medido no navegador (nao so calculado): com 4 linhas a
// faixa de dias ainda passava 27px da zona do degrade (h-64) e ficava
// visivelmente cortada; com 3 ela sobra alguns pixels pra dentro do degrade,
// mas so o suficiente pra escurecer a base dos circulos, sem cortar nenhum.
const TASKS_ON_MOBILE = 3;

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
                // abaixo de lg (carrossel do celular) o palco e sempre curto
                // (ver TASKS_ON_MOBILE) — comeca escondida e so reaparece no
                // grid de desktop (lg:flex). Dali pra cima, as linhas alem do
                // limite do notebook (tela larga, mas baixa) somem nele
                // tambem — sem isso elas empurrariam a faixa de dias pra fora
                // do quadro.
                i >= TASKS_ON_MOBILE && "hidden lg:flex",
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

// Dados dos tres cartoes, extraidos pra array pra alimentar TANTO a grade de
// desktop (inalterada) QUANTO o carrossel do celular, sem duplicar os textos
// dos dois lugares — se alguem editar a descricao da Agenda, os dois layouts
// atualizam juntos. Tarefas vem PRIMEIRO (e o principal dos tres — o primeiro
// cartao que aparece tanto na pilha antiga quanto no carrossel novo), e so
// visualmente vai pro meio no desktop via lgOrder.
const CARDS: {
  id: string;
  icon: Icon;
  title: string;
  desc: string;
  command: string;
  bigger?: boolean;
  delay?: number;
  lgOrder: string;
  mock: React.ComponentType;
}[] = [
  {
    id: "tarefas",
    icon: ListChecks,
    title: "Tarefas",
    desc: "Ele cria, marca como feita e repete nos dias que você escolher.",
    command:
      "Jarvis, cria uma tarefa pra revisar o contrato toda segunda, quarta e sexta.",
    bigger: true,
    lgOrder: "lg:order-2",
    mock: TaskMock,
  },
  {
    id: "agenda",
    icon: CalendarCheck,
    title: "Agenda",
    desc: "Compromissos com dia e hora. Ele repete e avisa antes, se você pedir.",
    command: "Jarvis, marca dentista quinta às 14h e me avisa uma hora antes.",
    delay: 0.08,
    lgOrder: "lg:order-1",
    mock: AgendaMock,
  },
  {
    id: "lembretes",
    icon: BellRinging,
    title: "Lembretes",
    desc: "Aquilo que você só não quer esquecer, avisado na hora exata.",
    command:
      "Jarvis, me lembra de ligar pra Ana hoje às 18h e de tomar o remédio.",
    delay: 0.16,
    lgOrder: "lg:order-3",
    mock: ReminderMock,
  },
];

export default function Organization() {
  const reduce = useReducedMotionSafe();

  // Abaixo de lg a secao de 3 cartoes vira carrossel de um cartao so,
  // arrastavel de lado — mesmos limiares (distancia/velocidade) do seletor
  // de capacidades em Features.tsx, mas o MECANISMO aqui e diferente: la, o
  // arrasto so decide um indice e o conteudo troca por baixo (fade); aqui os
  // TRES cartoes vivem lado a lado numa tira, e o dedo arrasta a tira de
  // verdade — o vizinho entra visivelmente durante o proprio gesto, nao so
  // depois que solta. Testado a versao antiga (fade pos-solta): parecia
  // dois movimentos desconexos, arrastar pra um vazio e so depois o cartao
  // trocar. Sem wrap-around (a ultima nao volta pra primeira arrastando mais)
  // — com so 3 itens, dar a volta exigiria clonar cartoes nas pontas so pra
  // um carrossel manual de 3 paradas, complexidade que nao paga o ganho.
  const isMobile = useMediaQuery("(max-width: 1023px)");
  const [activeIdx, setActiveIdx] = useState(0);

  // Largura de UMA parada da tira = largura do proprio viewport (o cartao
  // ocupa a tela toda). Medida via ResizeObserver, nao chutada, pra x nao
  // ficar CM/px trocados quando a fonte do sistema muda o layout ou a tela
  // gira — mesmo padrao de use-orb-size.ts.
  const trackRef = useRef<HTMLDivElement>(null);
  const [cardWidth, setCardWidth] = useState(0);
  useLayoutEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    // contentRect, NAO offsetWidth: a janela de recorte agora sangra por
    // baixo do respiro da secao (`-mx-6 px-6`, ver mais abaixo), entao
    // offsetWidth passaria a devolver a largura da TELA (390) em vez da
    // largura da coluna (342) — 48px a mais em toda a conta de paradas.
    // contentRect ja desconta o padding, que e exatamente o que as contas
    // de `stride`/`minX` esperam (mesma medicao de Features.tsx).
    const ro = new ResizeObserver(([entry]) =>
      setCardWidth(entry.contentRect.width)
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Altura de CADA parada, medida por fora (ver `items-start` na tira, mais
  // abaixo): sem `items-start` os 3 cartoes ficavam esticados pro tamanho do
  // mais alto (comportamento padrao de flex-row, align-items:stretch), e a
  // MOLDURA de Agenda/Lembretes crescia junto, com vao morto dentro dela.
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [cardHeights, setCardHeights] = useState<number[]>([]);
  // Cabecalho e palco de cada cartao, medidos separado — e o que permite
  // empatar as molduras sem esticar nada (ver stageHeights, logo abaixo).
  // borderBoxSize, nao contentRect: o cabecalho tem p-6 e borda, e a conta
  // precisa da caixa INTEIRA de cada pedaco pra fechar com a do cartao. E nao
  // offsetHeight, que arredonda pra inteiro: com uma frase de altura fracionada
  // (o normal), o arredondamento sozinho ja deixava as molduras com meio pixel
  // de diferenca — pouco pra ver, mas nao e "do mesmo tamanho".
  const [headHeights, setHeadHeights] = useState<number[]>([]);
  const [stageMeasured, setStageMeasured] = useState<number[]>([]);
  useLayoutEffect(() => {
    const bump =
      (set: React.Dispatch<React.SetStateAction<number[]>>, i: number) =>
      (h: number) =>
        set((prev) => {
          if (prev[i] === h) return prev;
          const next = [...prev];
          next[i] = h;
          return next;
        });

    const ros = cardRefs.current.map((el, i) => {
      if (!el) return null;
      const head = el.querySelector<HTMLElement>("[data-card-head]");
      const stage = el.querySelector<HTMLElement>("[data-card-stage]");
      const setSlide = bump(setCardHeights, i);
      const setHead = bump(setHeadHeights, i);
      const setStage = bump(setStageMeasured, i);
      const ro = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const t = entry.target as HTMLElement;
          const border = entry.borderBoxSize?.[0]?.blockSize ?? t.offsetHeight;
          if (t === el) setSlide(entry.contentRect.height);
          else if (t === head) setHead(border);
          else if (t === stage) setStage(border);
        }
      });
      ro.observe(el);
      if (head) ro.observe(head);
      if (stage) ro.observe(stage);
      return ro;
    });
    return () => ros.forEach((ro) => ro?.disconnect());
  }, []);

  // MOLDURAS DO MESMO TAMANHO, sem esticar ninguem.
  //
  // O cartao e cabecalho + palco. O palco tem altura fixa (igual nos tres), e
  // o cabecalho reserva DUAS linhas de frase — so que reserva nao e teto: a
  // frase da Agenda ("Compromissos com dia e hora...") e a mais comprida das
  // tres, entao e a primeira a passar pra uma linha a mais quando a fonte
  // aumenta (ajuste de tamanho de texto do navegador/celular) ou a tela
  // aperta. Quando isso acontece so com ela, o cartao da Agenda fica ~28px
  // mais alto que os vizinhos — visivel agora que o vizinho aparece espiando
  // ao lado o tempo todo.
  //
  // A correcao devolve a diferenca pro PALCO dos outros dois: cada um ganha
  // exatamente as linhas que faltam no seu cabecalho, e o total fecha igual
  // nos tres. Palco e tela cortada de proposito (a maquete sangra e some num
  // degrade), entao a folga vira mais um naco de maquete, nunca vao vazio —
  // que e o que aconteceria esticando a moldura (o `items-stretch` que a
  // gente ja tinha tirado daqui por isso).
  //
  // O cartao mais alto NAO recebe altura inline (delta 0 => undefined): e ele
  // que continua reportando o palco puro das classes, e e dai que sai o
  // `base` (o minimo). Sem essa saida, todo mundo teria altura fixada e o
  // valor ficaria preso no primeiro que fosse medido — o palco nao voltaria a
  // 295px ao cruzar o `sm:`, nem a 230 no `laptop:`.
  const measuredParts =
    headHeights.length === CARDS.length &&
    headHeights.every(Boolean) &&
    stageMeasured.length === CARDS.length &&
    stageMeasured.every(Boolean);
  const stageHeights = CARDS.map((_, i) => {
    if (!measuredParts) return undefined;
    const delta = Math.max(...headHeights) - headHeights[i];
    // 0.05px de folga so pra nao fixar altura por causa de ruido de
    // arredondamento do proprio navegador; a diferenca real e de linhas
    // inteiras de texto (dezenas de px).
    return delta > 0.05 ? Math.min(...stageMeasured) + delta : undefined;
  });

  // ...e a altura da janela do carrossel e a MAIOR das tres, nao a do cartao
  // ativo. Com as molduras ja empatadas (stageHeights, logo acima), o que
  // ainda varia e a LEGENDA em italico FORA do cartao, que muda de numero de
  // linhas conforme a largura: perto de 500-520px a da Agenda cabe numa linha
  // a menos que as outras duas, e por volta de 320px e a de Tarefas que ganha
  // uma linha. Acompanhando o cartao ativo, essa diferenca de ~18px virava a
  // secao inteira mudando de altura no meio do arrasto e a barra de progresso
  // pulando de lugar. Pela maior, o bloco fica do mesmo tamanho nos tres: o
  // que sobra e espaco transparente embaixo de uma legenda centralizada,
  // invisivel — ao contrario do stretch, que esticava a moldura.
  //
  // So aplica com as TRES medidas na mao (nao um max parcial do primeiro
  // frame, que encolheria assim que a segunda chegasse), e a transicao so
  // entra junto: sem altura medida ainda, "auto" ja casa com o conteudo, e
  // animar a partir de "auto" o CSS nao sabe fazer (pularia em vez de crescer).
  const measuredAll =
    cardHeights.length === CARDS.length && cardHeights.every(Boolean);
  const trackHeight = measuredAll ? Math.max(...cardHeights) : undefined;

  // x e a posicao da tira em PIXELS (nao %), porque o `drag` do motion move
  // em pixels — misturar as duas unidades no mesmo valor e que permite o
  // dedo "somar" deslocamento em cima da posicao ja animada, sem os dois
  // brigarem. Comeca em 0, que ja e a posicao certa pro indice inicial (0).
  const x = useMotionValue(0);

  // PASSO de uma parada = largura do cartao (cardWidth - SLIDE_INSET) + o
  // vao. E o quanto `x` anda de um cartao pro outro.
  const stride = cardWidth ? cardWidth - SLIDE_INSET + GAP : 0;

  // Fim da corrida: a tira nao para em -2*stride no ultimo cartao, senao ele
  // sairia CORTADO na direita (a espiada existe pra mostrar o proximo, e no
  // ultimo nao ha proximo — sobraria so vazio). Trava na posicao em que a
  // borda direita do ultimo cartao encosta na borda da tira; a espiada muda
  // de lado sozinha e passa a ser o cartao ANTERIOR aparecendo na esquerda,
  // que e exatamente a leitura certa la ("ainda da pra voltar").
  const contentWidth = stride ? CARDS.length * stride - GAP : 0;
  const minX = Math.min(0, cardWidth - contentWidth);
  const posFor = (idx: number) => Math.max(-idx * stride, minX);

  // Anima a tira ate a parada do indice pedido. `type: spring` (nao tween)
  // pra combinar com a mola elastica que o proprio arrasto usa enquanto o
  // dedo ainda esta na tela — sem isso, o gesto teria uma fisica e o
  // "snap" final teria outra, e a costura ficaria visivel.
  const snapTo = (idx: number, width: number) => {
    if (!width) return;
    animate(x, posFor(idx), { type: "spring", stiffness: 380, damping: 42 });
  };

  // Posicao do polegar da barra de progresso, derivada direto do `x` da tira:
  // ele acompanha o DEDO durante o arrasto, nao so o resultado depois de
  // soltar (o clamp segura o elastico das pontas, pra ele nao vazar do
  // trilho). As paradas vem por ref porque `useTransform` so recalcula quando
  // o `x` muda — lendo do ref a conta nunca usa uma largura velha de antes de
  // medir ou de girar a tela.
  //
  // A conta e por TRECHO (parada a parada), nao uma regra de tres sobre o
  // percurso inteiro: como a ultima parada e travada (ver minX), ela fica mais
  // perto da anterior que as outras entre si — numa regra de tres simples o
  // polegar chegaria torto no cartao do meio (~55% em vez de 50%) e a barra
  // desmentiria os tres alvos iguais logo abaixo dela.
  const stopsRef = useRef<number[]>([]);
  stopsRef.current = CARDS.map((_, i) => posFor(i));
  const thumbX = useTransform(x, (v) => {
    const stops = stopsRef.current;
    const last = stops[stops.length - 1];
    const travel = RAIL_WIDTH - RAIL_WIDTH / CARDS.length;
    if (!last) return 0;
    const pos = Math.min(0, Math.max(last, v));
    let seg = stops.findIndex((s, i) => i > 0 && pos >= s) - 1;
    if (seg < 0) seg = stops.length - 2;
    const span = stops[seg + 1] - stops[seg];
    const frac = seg + (span ? (pos - stops[seg]) / span : 0);
    return (frac / (stops.length - 1)) * travel;
  });

  useEffect(() => {
    snapTo(activeIdx, cardWidth);
    // cardWidth entra nas deps: se a tela girar/redimensionar com o
    // carrossel no meio de um cartao, a tira precisa se realinhar pra nova
    // largura, nao ficar com a posicao antiga (em pixels) desencontrada.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIdx, cardWidth]);

  // Arrastar pra ESQUERDA avanca (o dedo empurra o cartao atual pra fora,
  // puxando o proximo), pra DIREITA volta — convencao de qualquer carrossel
  // de app, e a mesma de Features.tsx. Nos extremos (primeiro/ultimo
  // cartao), Math.min/max trava o indice e `snapTo` chama de volta pra
  // MESMA posicao — e o que da o efeito de elastico batendo na ponta em vez
  // de continuar arrastando pro vazio.
  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const { offset, velocity } = info;
    let next = activeIdx;
    if (offset.x < -SWIPE_DISTANCE || velocity.x < -SWIPE_VELOCITY)
      next = Math.min(activeIdx + 1, CARDS.length - 1);
    else if (offset.x > SWIPE_DISTANCE || velocity.x > SWIPE_VELOCITY)
      next = Math.max(activeIdx - 1, 0);

    if (next === activeIdx) snapTo(activeIdx, cardWidth);
    else setActiveIdx(next);
  };

  // (Aqui morava um empurraozinho automatico de 28px na tira, disparado uma
  // vez quando a secao entrava na tela, pra dizer "isto arrasta". Saiu junto
  // com a chegada da espiada permanente do vizinho — ver PEEK la em cima:
  // com um pedaco da Agenda parado na borda o tempo todo, o empurrao virou
  // repeticao da mesma frase, e ainda por cima uma que so quem chega na hora
  // certa escuta.)

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
      <div className="relative mx-auto max-w-[84rem] laptop:max-w-[76rem] wide:max-w-shell">
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

        {/* Desktop (lg+): os tres lado a lado, como sempre foi. A coluna do
            meio e 1.14fr contra 1fr das laterais: e dai que sai a largura
            maior do cartao em destaque. Tarefas vem PRIMEIRO no array (e o
            principal dos tres) e so vai pro meio visualmente aqui, via
            lgOrder — no carrossel do celular, logo abaixo, ele sai primeiro
            tambem, sem precisar de reordenar nada.
            items-center (nao items-start): os dois laterais sao mais baixos
            que o do meio, entao centraliza-los no eixo os desce um pouco e
            faz os tres compartilharem a MESMA LINHA DO MEIO em vez do mesmo
            topo. Com topo alinhado a diferenca de altura virava um degrau so
            embaixo, que lia como desalinho; centrado, ela se divide nas duas
            pontas e vira escalonamento de proposito. */}
        <div className="mt-16 hidden gap-x-6 gap-y-10 lg:grid lg:grid-cols-[1fr_1.14fr_1fr] lg:items-center laptop:mt-12">
          {CARDS.map((card) => (
            <FeatureCard
              key={card.id}
              icon={card.icon}
              title={card.title}
              desc={card.desc}
              command={card.command}
              bigger={card.bigger}
              delay={card.delay}
              className={card.lgOrder}
            >
              <card.mock />
            </FeatureCard>
          ))}
        </div>

        {/* Celular (abaixo de lg): os tres cartoes empilhados verticalmente
            eram MUITO scroll — cada um carrega uma maquete de app inteira.
            Vira carrossel de VERDADE: os tres vivem lado a lado numa tira, e
            arrastar move a tira mesmo — o vizinho entra visivelmente durante
            o proprio gesto (nao um fade desconexo depois de soltar). Mesmos
            limiares de distancia/velocidade do seletor de capacidades em
            Features.tsx, pra nao inventar uma segunda linguagem de gesto na
            mesma pagina. */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="mt-16 lg:hidden"
        >
          {/* viewport: recorta a tira num cartao + a espiada do vizinho (ver
              SLIDE_INSET la em cima).
              -mx-6 px-6: a janela sangra por baixo do respiro lateral da
              secao, entao ela recorta na borda REAL da tela e o vizinho
              aparece ate la — sem isso ele parava 24px antes, com uma faixa
              morta de fundo entre a espiada e a borda.
              A ref mede a largura da COLUNA (contentRect, ja sem o padding
              que a sangria devolve — ver o ResizeObserver la em cima); a
              parada e essa largura menos o inset, ver `stride`.
              A altura e a do cartao mais alto dos tres, fixa enquanto a
              largura da tela nao muda (ver trackHeight, mais acima). */}
          <div
            ref={trackRef}
            className={`-mx-6 overflow-hidden px-6 ${
              trackHeight ? "transition-[height] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]" : ""
            }`}
            style={trackHeight ? { height: trackHeight } : undefined}
          >
            {/* O bloco INTEIRO (tira + pontinhos, mais abaixo) e a area de
                arrasto, nao so o cartao — no celular o dedo cai em qualquer
                lugar dessa pilha, e ter uma parte que "nao pega" o gesto
                parece defeito. Ver comentario grande em handleDragEnd/snapTo,
                mais acima, pra como o `x` (motion value) e o `drag` do motion
                convivem no mesmo elemento sem brigar.
                items-start (nao o stretch padrao do flex): sem isso os 3
                cartoes eram esticados pro tamanho do mais alto (Tarefas), e
                cada um passava a reportar a MESMA altura pro ResizeObserver
                acima — o vao morto que a gente esta corrigindo. */}
            <motion.div
              drag={isMobile ? "x" : false}
              dragConstraints={{ left: minX, right: 0 }}
              dragElastic={0.15}
              dragMomentum={false}
              onDragEnd={handleDragEnd}
              style={{ x }}
              className="flex cursor-grab items-start gap-4 active:cursor-grabbing"
            >
              {CARDS.map((card, i) => (
                <div
                  key={card.id}
                  ref={(el) => {
                    cardRefs.current[i] = el;
                  }}
                  aria-hidden={i !== activeIdx}
                  // 1.25rem = 20px = SLIDE_INSET: e o CSS que garante a
                  // espiada (o JS so posiciona), e e o mesmo numero de
                  // Features.tsx — e dai que sai o cartao do mesmo tamanho
                  // nas duas secoes. Sem shrink-0 o flex espremeria os tres
                  // pra caber na tira, e nao sobraria vizinho pra espiar.
                  className="w-[calc(100%-1.25rem)] shrink-0"
                >
                  {/* SEM `bigger`, ao contrario da grade de desktop: os tres
                      viram slides de um carrossel de 1 por vez, entao nao ha
                      "vizinho" pra Tarefas parecer maior QUE — os tres devem
                      ter o mesmo tamanho de palco aqui. */}
                  <FeatureCardBody
                    icon={card.icon}
                    title={card.title}
                    desc={card.desc}
                    command={card.command}
                    stageHeight={stageHeights[i]}
                  >
                    <card.mock />
                  </FeatureCardBody>
                </div>
              ))}
            </motion.div>
          </div>

          {/* BARRA DE PROGRESSO (no lugar dos pontinhos que moravam aqui):
              um trilho continuo com um polegar de 1/3 que DESLIZA junto com o
              dedo, nao um estado que troca depois de soltar. Os pontinhos
              diziam so "voce esta no 1 de 3"; o trilho diz tambem "voce esta
              no meio do caminho entre dois" — que e a informacao que falta
              justamente durante o gesto, quando o cartao esta em transito.
              O deslocamento vem de `thumbX`, derivado do mesmo `x` da tira
              (ver la em cima), entao os dois nunca podem discordar.

              Continua sendo tablist com um botao por cartao — a barra e a
              pele, a navegacao por toque/teclado e a mesma de antes. Os
              botoes sao uma camada TRANSPARENTE por cima do trilho: assim
              cada alvo tem os 44px de altura recomendados sem que o trilho
              precise ser grosso desse tanto (mesma ideia do p-5 em volta do
              traco de 6px em Features.tsx, resolvida por sobreposicao). */}
          <div
            className="relative mx-auto mt-6"
            style={{ width: RAIL_WIDTH }}
          >
            <div
              aria-hidden
              className="h-[3px] overflow-hidden rounded-full bg-white/[0.12]"
            >
              <motion.span
                style={{ x: thumbX, width: RAIL_WIDTH / CARDS.length }}
                className="block h-full rounded-full bg-white"
              />
            </div>
            <div
              className="absolute inset-x-0 top-1/2 flex -translate-y-1/2"
              role="tablist"
              aria-label="Recursos de organização"
            >
              {CARDS.map((card, i) => (
                <button
                  key={card.id}
                  type="button"
                  role="tab"
                  aria-selected={i === activeIdx}
                  aria-label={card.title}
                  onClick={() => setActiveIdx(i)}
                  className="h-11 flex-1 cursor-pointer"
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
