"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  animate,
  type PanInfo,
} from "motion/react";
import { useReducedMotionSafe, useSkipEntrance } from "@/components/ui/use-reduced-motion-safe";
import { useMediaQuery } from "@/components/ui/use-media-query";
import SectionEyebrow from "@/components/ui/section-eyebrow";
import { TechFrame } from "@/components/ui/tech-frame";
import { cn } from "@/lib/utils";
import {
  ListChecks,
  CalendarCheck,
  NotePencil,
  Repeat,
  Check,
  CaretUp,
  List,
  Plus,
  Bell,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";

// TRES CARTOES LADO A LADO — um por aba do app (Tarefas, Agenda, Notas).
//
// ATUALIZADO EM 17/09/2026 pra bater com o app de hoje (`MainInterface.tsx` no
// Project-Jarvis). O que mudou de verdade esta anotado em cada maquete; o
// resumo e: chanfro no lugar de canto arredondado, pastas e categorias que
// antes nao existiam, e a terceira aba que e NOTAS, nao "Lembretes" (o
// lembrete e uma propriedade da tarefa, nunca teve tela propria).
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
// As maquetes tambem EMAGRECERAM, que era a outra metade da queixa: nenhuma
// delas mostra formulario de criacao, so o RESULTADO — a lista do painel, com
// o cabecalho de pasta em cima e o botao de criar entre os dois, exatamente na
// ordem do app. Linha de lista nao pesa como campo de formulario: ela le como
// "a lista continua", que e justamente o que o corte no rodape precisa. Por
// isso as tres terminam em lista e todas tem mais itens do que cabe — sem
// conteudo sobrando, o degrade apagaria em cima de palco vazio.
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
  mobileCarousel = false,
  stageHeight,
  children,
}: {
  icon: Icon;
  title: string;
  desc: string;
  command: string;
  bigger?: boolean;
  // So true na instancia do carrossel do celular (ver Organization()) — o
  // palco la usa uma altura BASE diferente da grade de desktop (ver
  // comentario grande no `data-card-stage`, mais abaixo). A grade usa a
  // mesma FeatureCardBody sem esta flag, entao continua com o valor
  // original.
  mobileCarousel?: boolean;
  // So o carrossel do celular passa isto: altura do palco em px, pra empatar
  // a altura dos tres cartoes quando as frases do cabecalho quebram em
  // numeros de linha diferentes (ver o calculo em Organization()). Sem o
  // valor, o palco fica com a altura das classes, como sempre foi.
  stageHeight?: number;
  children: React.ReactNode;
}) {
  return (
    <>
      {/* MESMO CARD DA HUD DE CRIACAO DE TAREFA do app (TaskModal, em
          `MainInterface.tsx` no Project-Jarvis), pedido do usuario em
          25/09/2026: moldura TechFrame (octogono chanfrado com degraus e
          linha dupla — ver tech-frame.tsx), corpo #141416 (= ink-800) com o
          brilho INTERNO do keyframe jGlowInInset no estado final, cabecalho
          #1c1c20 (= ink-700) com o filete de baixo, e o halo desfocado por
          FORA, atras da moldura. O halo e uma forma propria (nao box-shadow)
          pelo mesmo motivo de la: sombra "pra fora" deixa camada escura nos
          triangulos que o chanfro corta.
          Sem animacao de entrada propria (o jPopIn/jGlowOuterIn do app): a
          entrada aqui e a do FeatureCard, e somar as duas tremia o cartao.
          O destaque do cartao do meio, que antes era borda de 2px, virou halo
          mais forte — a moldura e a mesma nos tres, como no app. */}
      <div className="group relative">
        <div
          aria-hidden
          className={cn(
            // Fora do carrossel do celular: la a janela de recorte cortaria o
            // blur seco no topo, e a moldura ja tem o proprio brilho de traco.
            mobileCarousel && "hidden",
            "pointer-events-none absolute -inset-[14px] rounded-[30px] bg-white blur-[20px] transition-opacity duration-300",
            bigger ? "opacity-[0.09]" : "opacity-[0.04] group-hover:opacity-[0.08]"
          )}
        />
        <TechFrame
          // O vao entre moldura e conteudo (PAD em tech-frame.tsx) mostra o
          // ink-900, um degrau abaixo do painel — le como a "caixa" do
          // instrumento em volta da tela, e e onde o brilho interno aparece.
          innerClassName="relative bg-ink-900 text-[#FAFAFA]"
          contentClassName="bg-ink-800"
          innerStyle={{
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.08), inset 0 0 14px rgba(255,255,255,0.14), inset 0 0 28px rgba(255,255,255,0.08), inset 0 0 50px rgba(255,255,255,0.045)",
          }}
        >
        {/* cabecalho (data-card-head: e por aqui que o carrossel do celular
            acha e mede este bloco de fora — ver o comentario do calculo de
            altura em Organization()) */}
        <div data-card-head className="border-b border-white/[0.055] bg-ink-700 p-6">
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
            a altura garante que o cabecalho de pasta e as primeiras tarefas
            caibam inteiros acima da zona do degrade, e quem entra nela sao as
            ultimas linhas da lista — que e justamente o que deve ser comido,
            porque linha de lista cortada le como "a lista continua".
            Os 385px deixam este palco ~90px mais alto que o dos vizinhos: e
            dai, somado a coluna mais larga, que sai o tamanho maior do cartao
            em destaque. No notebook cai pra 340, e a lista perde uma linha
            junto (TASKS_ON_LAPTOP) pra o corte continuar caindo no meio da
            lista, e nao logo depois do cabecalho. */}
        <div
          data-card-stage
          className={cn(
            "relative overflow-hidden bg-ink-950 px-6 pt-6",
            bigger
              ? "h-[385px] laptop:h-[340px]"
              : mobileCarousel
              ? // Carrossel do celular: unica instancia com esta flag (o
                // container inteiro so existe abaixo de `lg`, ver `lg:hidden`
                // em Organization()) — por isso nao precisa de prefixo `lg:`
                // nem `laptop:` aqui, so `sm:` pra telas entre 640-1023px.
                // 275->305, 295->325: ~30px mais alto. 305->325, 325->345:
                // mais ~20px, a pedido do usuario (de novo).
                "h-[325px] sm:h-[345px]"
              : // Grade de desktop (cartoes Agenda/Notas): valor original,
                // intacto.
                "h-[275px] sm:h-[295px] laptop:h-[230px]"
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
          {/* Degrade de baixo: o MESMO nos tres cartoes. Agora que as tres
              maquetes terminam em lista (tarefas, eventos, notas), nao ha mais
              nenhum elemento de altura fixa embaixo pra ele evitar — ele so
              apaga as ultimas linhas, que e o corte que queremos. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-16 bg-gradient-to-t from-ink-950 via-ink-950/75 to-transparent"
          />
        </div>
        </TechFrame>
      </div>

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
  const skipEntrance = useSkipEntrance();
  return (
    <motion.div
      initial={skipEntrance ? false : { opacity: 0, y: 20 }}
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

// CHANFRO (canto cortado em vez de arredondado) — a assinatura visual do app.
// Copiado de `MainInterface.tsx` no Project-Jarvis, onde o comentario explica a
// intencao: "painel de instrumento, nao card de app". Corta so o canto de cima
// a direita e o de baixo a esquerda; os outros dois ficam retos. E um
// `clip-path`, nao um `border-radius` — e por isso que nada aqui usa `border`:
// clip-path recorta borda e box-shadow junto, entao o contorno, quando
// aparece, e PINTADO (um fundo 1px atras do preenchimento), nunca declarado.
//
// Tres medidas, iguais as de la: a grande pros cards, a pequena pros elementos
// internos (abas, linhas de tarefa) e a menor pro que e miudo (checkbox,
// botoes). Os pixels sao os mesmos porque a maquete tem que ler como uma
// captura do app, nao como uma releitura dele.
const CHAMFER = "polygon(0 0, calc(100% - 13px) 0, 100% 13px, 100% 100%, 13px 100%, 0 calc(100% - 13px))";
const CHAMFER_SM = "polygon(0 0, calc(100% - 7px) 0, 100% 7px, 100% 100%, 7px 100%, 0 calc(100% - 7px))";
const CHAMFER_XS = "polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))";

// O app pinta estado com cor (verde de concluido, azul/ambar de evento). Aqui
// NAO — esta pagina e monocromatica de proposito (ver tailwind.config.ts), e um
// verde so nesta secao seria o unico acento do site inteiro. Mesma regra que o
// erro do formulario ja segue: o estado vira contraste e preenchimento
// (opacidade, fundo mais claro, risco), nunca matiz.

// Cabecalho de painel do app: monospace, caixa alta, tracking largo, 8.5px.
// E o mesmo rotulo do nome da pasta e das divisorias de categoria la.
function PanelLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-mono text-[8.5px] uppercase tracking-[0.22em] text-white/40">
      {children}
    </span>
  );
}

// Painel: um tom ACIMA do palco (ink-800 sobre ink-950). Quem esta recuado e o
// palco inteiro, entao o painel volta a ser o que ele e num app de verdade —
// um cartao pousado sobre a tela escura. Agora chanfrado, como todo card de la.
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
    <div className="bg-ink-800 p-3.5" style={{ clipPath: CHAMFER_SM, WebkitClipPath: CHAMFER_SM }}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <PanelLabel>{title}</PanelLabel>
        {aside}
      </div>
      {children}
    </div>
  );
}

// Cabecalho de pasta ("espaco") — o app abriu Tarefas, Agenda e Notas em
// pastas, e esse cabecalho e a primeira linha dos tres paineis: chevron, nome
// da pasta em monospace caixa alta, hamburguer de acoes, e embaixo a regua de
// 1.5px. A regua ja foi barra de progresso no app e hoje e DECORATIVA (o
// usuario pediu pra tirar primeiro a porcentagem, depois o calculo) — aqui ela
// nasce ja no estado atual, cheia, sem representar conclusao nenhuma.
function SpaceHeader({ name }: { name: string }) {
  return (
    <div
      className="flex flex-col gap-3 bg-[#363636] px-3.5 pb-2.5 pt-3"
      // So o canto de cima a direita e cortado; o de baixo a esquerda fica reto
      // pra encostar no que vem embaixo — igual ao card de pasta do app.
      style={{
        clipPath: "polygon(0 0, calc(100% - 7px) 0, 100% 7px, 100% 100%, 0 100%)",
        WebkitClipPath: "polygon(0 0, calc(100% - 7px) 0, 100% 7px, 100% 100%, 0 100%)",
      }}
    >
      <div className="flex items-center gap-2">
        {/* Fechada = mira pra cima. E o inverso da convencao, e e assim no app. */}
        <CaretUp size={13} weight="bold" aria-hidden className="shrink-0 text-white/75" />
        <span className="min-w-0 flex-1 truncate font-mono text-[10px] uppercase tracking-[0.16em] text-white/75">
          {name}
        </span>
        <List size={13} aria-hidden className="shrink-0 text-white/75" />
      </div>
      <div className="h-[1.5px] bg-white/35" aria-hidden />
    </div>
  );
}

// Divisoria de categoria — filete, rotulo, filete. As categorias sao
// divisorias DENTRO de uma pasta (um campo de texto livre na tarefa), e no app
// o bloco inteiro e arrastavel; aqui e so o desenho.
function CategoryRule({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 pt-1">
      <span className="h-px flex-1 bg-white/[0.09]" aria-hidden />
      <PanelLabel>{label}</PanelLabel>
      <span className="h-px flex-1 bg-white/[0.09]" aria-hidden />
    </div>
  );
}

// Botao de acao do rodape dos paineis ("+ Nova tarefa", "+ Novo evento").
function AddButton({ label }: { label: string }) {
  return (
    <div
      className="flex items-center justify-center gap-1.5 bg-[#2e2e2e] py-[7px] font-mono text-[9px] uppercase tracking-[0.18em] text-white/40"
      style={{ clipPath: CHAMFER_XS, WebkitClipPath: CHAMFER_XS }}
    >
      <Plus size={10} weight="bold" aria-hidden />
      <span>{label}</span>
    </div>
  );
}

// As abas do app: Tarefas / Agenda / Notas. Cada maquete abre na sua, e e o que
// amarra as tres como pedacos de UMA tela — no app elas sao o mesmo card, so
// que com aba diferente. A ativa tem fundo claro e brilho de texto; as outras
// ficam apagadas.
const NAV_TABS = ["Tarefas", "Agenda", "Notas"] as const;

function NavTabs({ active }: { active: (typeof NAV_TABS)[number] }) {
  return (
    <div
      className="flex gap-1 bg-black/[0.28] p-1"
      style={{ clipPath: CHAMFER_SM, WebkitClipPath: CHAMFER_SM }}
    >
      {NAV_TABS.map((tab) => {
        const on = tab === active;
        return (
          <span
            key={tab}
            className={cn(
              "flex-1 py-2 text-center font-mono text-[9px] uppercase tracking-[0.13em]",
              on
                ? "bg-white/30 font-semibold text-white/95 [text-shadow:0_0_9px_rgba(255,255,255,0.45)]"
                : "font-medium text-white/[0.34]"
            )}
            style={on ? { clipPath: CHAMFER_XS, WebkitClipPath: CHAMFER_XS } : undefined}
          >
            {tab}
          </span>
        );
      })}
    </div>
  );
}

// ---- Maquete 1: a tarefa -----------------------------------------------------
// Reescrita em 17/09/2026 pra bater com o app de hoje (`MainInterface.tsx`,
// TasksPanel, no Project-Jarvis). O que MUDOU no app desde a versao anterior
// desta maquete, e que e o que esta secao passou a mostrar:
//
//   PASTAS ("espacos") — as tarefas vivem dentro de uma pasta, e o nome dela
//   com o chevron e o hamburguer e a primeira linha do painel. Antes nao
//   existiam; a maquete abria direto na lista.
//
//   CATEGORIAS — divisorias dentro da pasta (filete/rotulo/filete). O bloco
//   sem categoria vem sempre primeiro e sem cabecalho.
//
//   CHANFRO — cada tarefa e um bloco PREENCHIDO de canto cortado, nao uma
//   linha solta com checkbox arredondado. Sem borda (o clip-path recorta
//   borda), sem raio.
//
//   A REGUA de 1.5px que ja foi barra de progresso e hoje e so decorativa.
//
// O que SAIU: a faixa "Repete em" com os sete circulos da semana e o painel
// "Lembrar as". Os dois eram campos do formulario de criacao; hoje a
// recorrencia e o lembrete aparecem na propria linha da tarefa, como badge no
// canto direito (sino + hora, seta de recorrente). Toda a aritmetica de
// altura que o comentario antigo fazia aqui — quantas linhas cabem antes da
// faixa de dias entrar na zona do degrade — morreu junto com a faixa.
//
// `cat` e a divisoria de categoria que ABRE o bloco (undefined = bloco sem
// categoria, sempre primeiro). `bell` e a hora do lembrete; `recurring` marca
// a que se repete.
const TASK_LIST_NEW: {
  text: string;
  done?: boolean;
  cat?: string;
  bell?: string;
  recurring?: boolean;
}[] = [
  { text: "Revisar contrato do cliente", done: true },
  { text: "Enviar relatório de março", bell: "09:00" },
  { text: "Reunião de equipe", cat: "Trabalho", recurring: true },
  { text: "Confirmar consulta de quinta", bell: "14:00" },
  { text: "Pagar a fatura do cartão", cat: "Casa", recurring: true },
  { text: "Levar o carro na revisão" },
];

// Quantas linhas sobrevivem no breakpoint de notebook (tela larga, mas baixa).
const TASKS_ON_LAPTOP = 4;

// Quantas linhas sobrevivem no carrossel do celular, onde o palco de Tarefas
// nao e maior que o dos outros dois (ver o `<FeatureCardBody>` do carrossel em
// Organization()) — usa o MESMO palco curto de Agenda e Notas. Com o
// cabecalho de pasta e as divisorias de categoria ocupando espaco, e a linha
// de tarefa agora bem mais alta (52px minimos contra os 16 da versao antiga),
// tres linhas ja passam da borda — que e o corte que o degrade precisa.
const TASKS_ON_MOBILE = 3;

// A faixa "Repete em" (sete circulos da semana) SAIU junto com o `WEEK` que a
// alimentava: no app de hoje a recorrencia e uma seta no canto da propria
// linha da tarefa, nao um campo separado embaixo da lista.

function TaskMock() {
  return (
    <div className="space-y-1.5">
      <NavTabs active="Tarefas" />
      <SpaceHeader name="Geral" />
      <AddButton label="Nova tarefa" />

      <div className="space-y-1.5 pt-0.5">
        {TASK_LIST_NEW.map((t, i) => (
          <React.Fragment key={t.text}>
            {t.cat && <CategoryRule label={t.cat} />}
            <div
              className={cn(
                "flex min-h-[52px] items-center gap-2.5 px-2.5 py-2.5",
                // Concluida: o app pinta de verde; aqui e so um degrau mais
                // claro que o bloco normal — o estado le por contraste, nao
                // por matiz (a pagina e monocromatica).
                t.done ? "bg-[#2b2b2b]" : "bg-[#212121]",
                // Abaixo de lg (carrossel do celular) o palco e sempre curto.
                i >= TASKS_ON_MOBILE && "hidden lg:flex",
                i >= TASKS_ON_LAPTOP && "laptop:hidden"
              )}
              style={{ clipPath: CHAMFER_SM, WebkitClipPath: CHAMFER_SM }}
            >
              {/* Checkbox 28px, chanfrado — no app e um quadrado de canto
                  cortado com borda de 1.5px, nao um circulo nem um
                  arredondado. */}
              <span
                aria-hidden
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center border-[1.5px]",
                  t.done
                    ? "border-white/70 bg-white/[0.14]"
                    : "border-white/[0.22] bg-white/[0.04]"
                )}
                style={{ clipPath: CHAMFER_XS, WebkitClipPath: CHAMFER_XS }}
              >
                {t.done && <Check size={14} weight="bold" className="text-white/95" />}
              </span>

              <span
                className={cn(
                  "min-w-0 flex-1 truncate text-xs font-medium",
                  t.done ? "text-white/30 line-through" : "text-white/90"
                )}
              >
                {t.text}
              </span>

              {/* Badges de estado no canto — sino + hora quando tem lembrete,
                  e sempre um marcador de recorrente/unica. */}
              <span className="flex shrink-0 items-center gap-1">
                {t.bell && (
                  <span className="flex items-center gap-1 pr-0.5">
                    <Bell size={9} aria-hidden className="text-white/35" />
                    <span className="font-mono text-[8.5px] tabular-nums tracking-[0.06em] text-white/40">
                      {t.bell}
                    </span>
                  </span>
                )}
                {t.recurring ? (
                  <Repeat size={12} aria-hidden className="text-white/[0.28]" />
                ) : (
                  <Check size={12} aria-hidden className="text-white/[0.18]" />
                )}
              </span>
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

// ---- Maquete 2: o dia na agenda ----------------------------------------------
// Reescrita em 17/09/2026 junto com a de Tarefas. O app trocou a FAIXA de uma
// semana (sete dias em linha) por um CALENDARIO DE MES inteiro: cabecalho com
// mes/ano entre duas setas, a regua de iniciais dos dias, e a grade de 7
// colunas. O dia selecionado e um bloco branco cheio; o dia de hoje e so um
// realce leve. Abaixo da grade vem a lista de eventos, e cada evento agora tem
// um SELO DE DATA a esquerda (dia em cima, mes abreviado embaixo) em vez da
// coluna de horario com o filete vertical que esta maquete usava.
//
// O app colore o selo por status (azul pra hoje, ambar pra proximo, apagado
// pro que passou). Aqui isso vira opacidade — ver a nota sobre monocromia
// junto do CHANFRO, mais acima.

// Iniciais da semana comecando no domingo, como em toda agenda BR.
const DOW = ["D", "S", "T", "Q", "Q", "S", "S"];

// Setembro/2026 comeca numa terca — duas celulas vazias antes do dia 1.
const MONTH_OFFSET = 2;
const MONTH_LENGTH = 30;
const TODAY = 17;
const SELECTED = 24;

const AGENDA = [
  { day: "24", mon: "set", title: "Reunião de equipe", time: "09:00" },
  { day: "24", mon: "set", title: "Dentista", time: "14:00" },
  { day: "25", mon: "set", title: "Academia", time: "18:30" },
  { day: "26", mon: "set", title: "Jantar com a Bia", time: "20:00" },
];

function AgendaMock() {
  return (
    <div className="space-y-1.5">
      <NavTabs active="Agenda" />

      {/* Calendario do mes */}
      <div
        className="bg-ink-800 px-3 pb-3 pt-2.5"
        style={{ clipPath: CHAMFER_SM, WebkitClipPath: CHAMFER_SM }}
      >
        <div className="mb-2 flex items-center justify-between">
          <span className="px-1 text-sm leading-none text-white/35" aria-hidden>
            ‹
          </span>
          <PanelLabel>set 2026</PanelLabel>
          <span className="px-1 text-sm leading-none text-white/35" aria-hidden>
            ›
          </span>
        </div>

        <div className="grid grid-cols-7">
          {DOW.map((d, i) => (
            <span key={i} className="pb-[3px] text-center text-[9px] text-white/[0.22]">
              {d}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-0.5">
          {Array.from({ length: MONTH_OFFSET }).map((_, i) => (
            <span key={`e${i}`} aria-hidden />
          ))}
          {Array.from({ length: MONTH_LENGTH }, (_, i) => i + 1).map((day) => {
            const sel = day === SELECTED;
            const today = day === TODAY;
            return (
              <span
                key={day}
                className={cn(
                  // 20px (nao os 24 do app): a grade de mes inteira mais a
                  // lista de eventos nao cabem no palco da landing, e um mes
                  // cortado no meio nao leria como calendario. Encolher a
                  // celula e o que deixa a LISTA ser a parte cortada.
                  "flex h-5 items-center justify-center rounded-md text-[10px]",
                  sel && "bg-white/[0.92] font-semibold text-ink-950",
                  !sel && today && "bg-white/[0.08] font-semibold text-white/95",
                  !sel && !today && "text-white/[0.52]"
                )}
              >
                {day}
              </span>
            );
          })}
        </div>
      </div>

      {/* "Novo evento" fica ANTES da lista, como no app (o botao de criar mora
          entre o cabecalho e a lista nos tres paineis). A lista abaixo e o que
          sangra pro degrade. */}
      <AddButton label="Novo evento" />

      {/* Eventos do dia escolhido */}
      <div className="space-y-1.5 pt-0.5">
        {AGENDA.map((e, i) => (
          <div
            key={e.title}
            className={cn(
              "flex items-center gap-2.5 bg-white/[0.03] px-2 py-[7px]",
              // O primeiro e o "de hoje" — no app ele ganha um fundo azulado;
              // aqui so um degrau a mais de claridade.
              i === 0 && "bg-white/[0.07]"
            )}
            style={{ clipPath: CHAMFER_SM, WebkitClipPath: CHAMFER_SM }}
          >
            <span className="flex w-[30px] shrink-0 flex-col items-center rounded-md bg-white/[0.05] py-[3px]">
              <span
                className={cn(
                  "text-[13px] font-bold leading-none",
                  i === 0 ? "text-white/95" : "text-white/50"
                )}
              >
                {e.day}
              </span>
              <span
                className={cn(
                  "text-[8px]",
                  i === 0 ? "text-white/70" : "text-white/35"
                )}
              >
                {e.mon}
              </span>
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[11.5px] text-white/85">
                {e.title}
              </span>
              <span className="mt-px block text-[9px] text-white/30">{e.time}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}


// ---- Maquete 3: as notas -----------------------------------------------------
// Era "o lembrete" (uma notificacao do Jarvis + a fila do que vinha depois) e
// virou NOTAS em 17/09/2026, porque o app nao tem painel de lembrete nenhum: a
// terceira aba dele e Notas, e o lembrete e uma PROPRIEDADE da tarefa (o sino
// com a hora no canto da linha, ver TaskMock) — nunca foi uma tela propria.
// A maquete antiga mostrava uma notificacao de sistema que o app tambem nao
// desenha assim, entao o `JarvisDot` que existia so pra ela saiu junto.
//
// A nota e a linha de tarefa SEM o checkbox e SEM os badges: titulo em cima,
// descricao embaixo, mesmo bloco chanfrado, mesmas pastas e categorias.

const NOTES = [
  {
    title: "Ideias pro site novo",
    desc: "Trocar a home, revisar os textos da seção de preços",
  },
  { title: "Senha do roteador", desc: "Trocar depois da visita do técnico" },
  {
    title: "Livros recomendados",
    desc: "O que a Bia falou no jantar de sexta",
    cat: "Pessoal",
  },
  { title: "Medidas da sala", desc: "3,20m × 4,10m — pro orçamento do armário" },
  { title: "Checklist da viagem", desc: "Passaporte, seguro, adaptador" },
  { title: "Presentes de fim de ano", desc: "Lista que a gente fez no domingo" },
  { title: "Vinho que eu gostei", desc: "O português do jantar de sexta" },
];

function NotesMock() {
  return (
    <div className="space-y-1.5">
      <NavTabs active="Notas" />
      <SpaceHeader name="Geral" />
      <AddButton label="Nova nota" />

      <div className="space-y-1.5 pt-0.5">
        {NOTES.map((n) => (
          <React.Fragment key={n.title}>
            {n.cat && <CategoryRule label={n.cat} />}
            <div
              className="flex min-h-[52px] items-center bg-[#212121] px-2.5 py-2.5"
              style={{ clipPath: CHAMFER_SM, WebkitClipPath: CHAMFER_SM }}
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-medium leading-tight text-white/90">
                  {n.title}
                </span>
                <span className="mt-0.5 block truncate text-[10px] leading-tight text-white/40">
                  {n.desc}
                </span>
              </span>
            </div>
          </React.Fragment>
        ))}
      </div>
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
    desc: "Ele cria, organiza em pastas e avisa na hora que você marcar.",
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
    id: "notas",
    icon: NotePencil,
    title: "Notas",
    desc: "O que você quer guardar escrito, ditado na hora em que lembrar.",
    command: "Jarvis, anota que a sala tem 3,20 por 4,10.",
    delay: 0.16,
    lgOrder: "lg:order-3",
    mock: NotesMock,
  },
];

export default function Organization() {
  const reduce = useReducedMotionSafe();
  const skipEntrance = useSkipEntrance();

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
  // MOLDURA de Agenda/Notas crescia junto, com vao morto dentro dela.
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
        {/* linha divisoria: mesmo brilho estatico (sem animacao) das outras
            secoes — ver Showcase.tsx/Roadmap.tsx. Fica por cima do border-t
            solido do <section>, que continua ali por baixo. */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      </div>

      {/* 84rem (1344px) em vez do max-w-6xl (1152px) das outras secoes: os
          cartoes precisam de largura pra maquete respirar. Fica a 56px do teto
          do shell (1400px) — perto do maximo que da pra esticar sem que a
          secao passe a destoar das vizinhas em telas nao-wide. */}
      <div className="relative mx-auto max-w-[84rem] laptop:max-w-[76rem] wide:max-w-shell">
        <motion.div
          initial={skipEntrance ? false : { opacity: 0, y: 18 }}
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
          {/* Mesma formula de fonte de Roadmap.tsx ("Próximas atualizações")
              — ver comentario identico em Showcase.tsx. */}
          {/* wrapper inline-block: encolhe pra largura do proprio texto do
              titulo (h2 e whitespace-nowrap), entao a linha abaixo (w-full
              DESTE wrapper, nao da secao) fica sempre do mesmo tamanho da
              frase, em qualquer largura de tela — sem numero de px fixo. */}
          {/* mx-auto w-fit (nao mais inline-block): inline-block deixava
              este bloco na mesma LINHA do SectionEyebrow (que e um <span>
              inline) sempre que a largura sobrasse — visivel so no desktop,
              onde a coluna e larga o bastante pros dois caberem lado a lado
              (bug reportado pelo usuario). w-fit encolhe pro texto do
              titulo igual o inline-block fazia, mas continua um bloco de
              verdade (quebra linha sempre); mx-auto centraliza esse bloco,
              ja que ele nao e mais 100% da largura do pai. */}
          <div className="mx-auto w-fit">
            <h2 className="mt-5 whitespace-nowrap leading-tight font-display text-[length:clamp(0.9rem,calc(10.22vw_-_5.52px),3rem)] font-semibold tracking-[-0.02em] text-[#FAFAFA] laptop:text-[2.625rem]">
              Se organize melhor
            </h2>
            <div aria-hidden className="mt-2 h-px w-full bg-gradient-to-r from-transparent via-white/25 to-transparent laptop:mt-1.5" />
          </div>
          <p className="mx-auto mt-3 max-w-[52ch] text-lg font-light leading-relaxed text-white/55 laptop:mt-2">
            Você fala, ele anota e avisa você na hora certa.
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
          initial={skipEntrance ? false : { opacity: 0, y: 18 }}
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
          {/* -my-5 py-5: mesma sangria, na vertical — o brilho do traco da
              moldura HUD (drop-shadow do SVG em tech-frame.tsx) vaza pra fora
              do cartao, e sem folga a janela cortava ele seco no topo. Os 40px
              somados na altura sao exatamente esse padding (border-box). */}
          <div
            ref={trackRef}
            className={`-mx-6 -my-5 overflow-hidden px-6 py-5 ${
              trackHeight ? "transition-[height] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]" : ""
            }`}
            style={trackHeight ? { height: trackHeight + 40 } : undefined}
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
              className="flex cursor-grab items-start gap-4 will-change-transform active:cursor-grabbing"
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
                    mobileCarousel
                    stageHeight={stageHeights[i]}
                  >
                    <card.mock />
                  </FeatureCardBody>
                </div>
              ))}
            </motion.div>
          </div>

          {/* PONTINHOS — 3a versao (a pedido do usuario, que nao gostou nem
              da barra de progresso original nem do cartao-pilula que veio
              depois). Sem cartao envolvendo agora: as bolinhas ficam soltas
              direto no fundo da secao. A ativa NAO so fica maior — ela vira
              uma pilulazinha (h-1.5 w-5) que DESLIZA ate a posicao nova com
              `layoutId`, o truque de "shared layout" do motion: como so um
              elemento por vez tem esse layoutId na arvore (troca de botao pro
              botao quando `activeIdx` muda), o motion detecta que "o mesmo"
              elemento mudou de lugar/tamanho entre um render e outro e anima
              o voo (posicao + largura) sozinho — nao precisa calcular
              nenhuma posicao em pixel na mao, ao contrario da barra antiga.
              layoutId precisa ser UNICO na pagina inteira (nao so nesta
              secao), senao o motion tentaria "voar" a pilula desta secao ate
              a de outra. */}
          <div
            className="mx-auto mt-6 flex w-fit items-center gap-2"
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
                className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center"
              >
                {i === activeIdx ? (
                  <motion.span
                    layoutId="org-carousel-dot"
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
