"use client";

import React from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { useReducedMotionSafe } from "@/components/ui/use-reduced-motion-safe";
import {
  Tag,
  Microphone,
  AppWindow,
  Terminal,
  ChatCircleText,
  Eye,
  Brain,
  Waveform,
  Headset,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import PixelCard from "@/components/ui/pixel-card";

// Dois planos, mesmo produto, periodicidade diferente. Por isso a lista de
// recursos aparece UMA vez, embaixo, em vez de repetida dentro de cada cartao:
// listar os mesmos oito itens duas vezes finge uma diferenca que nao existe e
// faz a pessoa procurar o que muda entre as colunas.
//
// Numeros conferidos: 147 - 97 = 50 de desconto, que da 34% (50/147 = 0,3401).
// 97 x 12 = 1164. 1164 - 1000 = 164 de economia no anual.
// 1000 / 12 = 83,33 por mes.
//
// A urgencia do mensal vem so do que e verdade: o preco sobe para 147 quando o
// lancamento acabar. Sem contador regressivo (nao ha data definida) e sem
// "restam X vagas". Escassez inventada derruba a confianca justamente em quem
// le com atencao, que e o publico deste produto.
const plans = [
  {
    id: "mensal",
    name: "Mensal",
    price: "R$ 97",
    period: "por mês",
    anchor: "R$ 147",
    discount: "-34%",
    savingLine: "R$ 50 a menos por mês, enquanto durar o lançamento.",
    note: "Cobrado todo mês. Cancele quando quiser.",
    highlighted: false,
  },
  {
    id: "anual",
    name: "Anual",
    price: "R$ 1.000",
    period: "por ano",
    equivalent: "R$ 83,33 por mês",
    saving: "R$ 164 a menos que doze meses no plano mensal",
    note: "Cobrado uma vez, vale 12 meses.",
    highlighted: true,
  },
];

// Cada recurso ganha um icone proprio, que diz do que se trata de relance.
// Melhor que oito checks identicos: o icone diferencia e da ritmo visual a
// grade sem precisar de mais texto.
const included: { icon: Icon; label: string }[] = [
  { icon: Microphone, label: "Ativação por voz e atalho global" },
  { icon: AppWindow, label: "Controle de navegador e programas" },
  { icon: Terminal, label: "Terminal, Git e automações de dev" },
  { icon: ChatCircleText, label: "Integração com Spotify e WhatsApp" },
  { icon: Eye, label: "Visão de tela e detecção de jogos" },
  { icon: Brain, label: "Memória persistente ilimitada" },
  { icon: Waveform, label: "Voz clonada, a sua própria voz" },
  { icon: Headset, label: "Suporte prioritário" },
];

// Em fonte monoespacada o caractere de espaco ocupa uma largura inteira, que
// no text-7xl vira um vao enorme entre "R$" e o numero. Separar os dois deixa
// o respiro sob controle em em, proporcional ao tamanho da fonte.
function Price({ value, className }: { value: string; className?: string }) {
  const [symbol, ...rest] = value.split(" ");
  return (
    <span className={cn("inline-flex items-baseline gap-[0.14em]", className)}>
      <span>{symbol}</span>
      <span>{rest.join(" ")}</span>
    </span>
  );
}

export default function Pricing() {
  const reduce = useReducedMotionSafe();

  return (
    <section id="precos" className="relative overflow-hidden bg-ink-950 px-6 py-28 sm:py-36">
      {/* Curvas de nivel ao fundo da secao.
          A versao anterior entrava com corte seco: a mascara comecava em #000
          (opaco total) em 0%, entao a primeira linha da imagem aparecia inteira
          de uma vez e desenhava uma borda reta no topo da secao.
          Agora a mascara nasce em transparent e so atinge o pico la pelos 34%,
          o que faz a textura emergir do fundo em vez de comecar. A area tambem
          ficou mais alta para a rampa ser mais longa e portanto mais discreta. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[760px] opacity-[0.85]"
        style={{
          maskImage:
            "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 9%, rgba(0,0,0,0.8) 20%, #000 32%, #000 52%, rgba(0,0,0,0.45) 74%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 9%, rgba(0,0,0,0.8) 20%, #000 32%, #000 52%, rgba(0,0,0,0.45) 74%, transparent 100%)",
        }}
      >
        {/* object-top e o detalhe que decide se a textura existe ou nao.
            A i5 tem as curvas concentradas em cima e embaixo e quase nada no
            meio: ancorar no centro mostrava justamente a faixa vazia, e o
            fundo sumia por completo. */}
        <Image
          src="/images/i5.avif"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-top"
        />
      </div>
      {/* Scrims laterais na propria cor da secao: matam as bordas verticais da
          imagem, que apareciam como dois cortes retos nas laterais. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[760px] bg-[linear-gradient(to_right,#0A0A0B_0%,rgba(10,10,11,0)_20%,rgba(10,10,11,0)_80%,#0A0A0B_100%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 top-1/4 h-[520px] w-[620px] translate-x-1/3 rounded-full bg-white/[0.045] blur-[130px]"
      />

      <div className="relative mx-auto max-w-shell">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-2xl"
        >
          <h2 className="text-balance text-3xl font-semibold tracking-[-0.02em] text-[#FAFAFA] sm:text-5xl">
            Escolha como quer usar.
          </h2>
          <p className="mt-5 max-w-[52ch] text-lg font-light leading-relaxed text-white/55">
            O Jarvis completo nos dois planos. A única diferença é de quanto em
            quanto tempo você paga.
          </p>
        </motion.div>

        {/* A escolha. Grid assimetrico: o anual pesa mais na composicao porque
            e o de melhor custo, nao por decoracao. */}
        <div className="mt-14 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.15fr]">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={reduce ? false : { opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: 0.65,
                delay: reduce ? 0 : i * 0.09,
                ease: [0.16, 1, 0.3, 1],
              }}
              className={cn(
                "relative flex flex-col overflow-hidden rounded-card border",
                // Elevacao correta agora que a secao e ink-950: o cartao comum
                // fica um degrau ACIMA do fundo e o destacado dois. Antes o
                // cartao comum era ink-950 sobre secao ink-900, ou seja, mais
                // escuro que a propria superficie, o que o fazia parecer
                // afundado em vez de elevado.
                plan.highlighted
                  ? "border-white/30 bg-ink-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_0_0_1px_rgba(255,255,255,0.05),0_28px_70px_-28px_rgba(255,255,255,0.16)]"
                  : "border-white/[0.09] bg-ink-900"
              )}
            >
              {/* Efeito de pixels FIXO (sempre ligado, nao no hover) no fundo
                  do plano em destaque. A mascara radial desvanece os pixels
                  antes das bordas, entao eles se fundem no proprio cartao em vez
                  de cortarem seco na borda e parecerem uma camada a parte. Fica
                  atras do conteudo (z-0); o texto vive na camada z-10 acima. */}
              {plan.highlighted && (
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 z-0"
                  style={{
                    maskImage:
                      "radial-gradient(115% 85% at 50% 45%, #000 32%, transparent 82%)",
                    WebkitMaskImage:
                      "radial-gradient(115% 85% at 50% 45%, #000 32%, transparent 82%)",
                  }}
                >
                  <PixelCard
                    active
                    gap={6}
                    speed={40}
                    // Paleta ponderada em branco/cinza/preto: a lista repetida
                    // enviesa o sorteio. Poucos brancos puros viram glints que
                    // cintilam entre muitos cinzas e quase-pretos, no lugar de um
                    // ruido de cor uniforme. Mais bonito e mais sutil.
                    colors="#ffffff,#e4e4e7,#a1a1aa,#a1a1aa,#52525b,#52525b,#3f3f46"
                    className="h-full w-full opacity-[0.5]"
                  />
                </div>
              )}

              {/* Charme do Mensal: uma luz suave sangrando do canto superior,
                  recortada pelo overflow do cartao. Sutil, para nao competir
                  com o destaque do Anual. */}
              {!plan.highlighted && (
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-16 -top-20 z-0 h-48 w-48 rounded-full bg-white/[0.05] blur-[55px]"
                />
              )}

              <div className="relative z-10 flex flex-1 flex-col p-8 sm:p-10">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-lg font-medium text-[#FAFAFA]">
                    {plan.name}
                  </h3>
                {plan.highlighted ? (
                  <span className="rounded-chip bg-[#FAFAFA] px-2.5 py-1 text-xs font-semibold text-ink-950">
                    Melhor custo
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-chip border border-white/25 bg-white/[0.06] px-2.5 py-1 text-xs font-semibold text-[#FAFAFA]">
                    <Tag size={13} weight="fill" aria-hidden />
                    Preço de lançamento
                  </span>
                )}
              </div>

              {/* Ancoragem do mensal. O valor cheio vem ANTES do promocional e
                  na mesma linha de leitura: a pessoa ve de quanto para quanto
                  antes de ver o numero grande. O risco e desenhado como barra
                  propria para poder ser animado; o <s> mantem a semantica de
                  "preco que nao vale mais" para leitor de tela. */}
              {plan.anchor && (
                <p className="mt-8 flex items-center gap-2 text-base">
                  <span className="text-white/40">De</span>
                  <s className="relative inline-block font-mono text-white/40 [text-decoration:none]">
                    <Price value={plan.anchor} />
                    <motion.span
                      aria-hidden
                      initial={reduce ? false : { scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true, amount: 0.8 }}
                      transition={{
                        duration: 0.5,
                        delay: reduce ? 0 : 0.35,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      className="absolute left-0 top-1/2 h-[2px] w-full origin-left rounded-full bg-white/55"
                    />
                  </s>
                  <span className="text-white/40">por</span>
                </p>
              )}

              <div
                className={cn(
                  "flex flex-wrap items-baseline gap-x-3 gap-y-2",
                  plan.anchor ? "mt-2" : "mt-8"
                )}
              >
                <Price
                  value={plan.price}
                  className="font-mono text-6xl font-medium tracking-tight text-[#FAFAFA] sm:text-7xl"
                />
                <span className="text-sm text-white/45">{plan.period}</span>

                {/* Chip de desconto: o elemento mais alto contraste do cartao.
                    Num sistema monocromatico, branco solido e o unico "grito"
                    disponivel, entao ele fica reservado para o numero que
                    importa. */}
                {plan.discount && (
                  <motion.span
                    initial={reduce ? false : { opacity: 0, scale: 0.85 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, amount: 0.8 }}
                    transition={{
                      duration: 0.45,
                      delay: reduce ? 0 : 0.7,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="rounded-chip bg-[#FAFAFA] px-2.5 py-1 font-mono text-sm font-bold text-ink-950"
                  >
                    {plan.discount}
                  </motion.span>
                )}
              </div>

              {plan.savingLine && (
                <p className="mt-4 border-l-2 border-white/25 pl-3 text-sm leading-relaxed text-white/70">
                  {plan.savingLine}
                </p>
              )}

              {plan.equivalent && (
                <p className="mt-3 text-sm text-white/60">
                  Equivale a{" "}
                  <span className="font-medium text-[#FAFAFA]">
                    {plan.equivalent}
                  </span>
                  . {plan.saving}.
                </p>
              )}

              <a
                href="#top"
                className={cn(
                  "mt-9 block w-full rounded-full px-6 py-4 text-center text-sm font-semibold transition-all duration-200 active:scale-[0.98]",
                  plan.highlighted
                    ? "bg-[#FAFAFA] text-ink-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_10px_30px_-14px_rgba(255,255,255,0.4)] hover:bg-white"
                    : "border border-white/15 text-white/85 hover:border-white/40 hover:text-white"
                )}
              >
                Começar agora
              </a>

              <p className="mt-4 text-center text-xs text-white/40">
                {plan.note}
              </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Recursos listados uma vez so, porque valem para os dois planos. */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mt-4 rounded-card border border-white/[0.09] bg-ink-900 p-8 sm:p-10"
        >
          <div className="flex items-baseline justify-between gap-4">
            <h3 className="text-base font-medium text-[#FAFAFA]">
              Incluído nos dois planos
            </h3>
            <span className="font-mono text-sm text-white/35">
              {included.length} recursos
            </span>
          </div>

          {/* Cada recurso em um chip proprio com seu icone. Le muito melhor que
              a lista miuda de antes, e cada item entra em sequencia quando a
              secao aparece. */}
          <ul className="mt-7 grid gap-3 sm:grid-cols-2">
            {included.map(({ icon: Glyph, label }, i) => (
              <motion.li
                key={label}
                initial={reduce ? false : { opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{
                  duration: 0.45,
                  delay: reduce ? 0 : i * 0.05,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="group flex items-center gap-3.5 rounded-chip border border-white/[0.06] bg-white/[0.02] px-4 py-3.5 transition-colors duration-300 hover:border-white/20 hover:bg-white/[0.05]"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.05] text-white/70 transition-colors duration-300 group-hover:border-white/20 group-hover:text-[#FAFAFA]">
                  <Glyph size={17} weight="light" aria-hidden />
                </span>
                <span className="text-sm leading-snug text-white/75">
                  {label}
                </span>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* Dizer o aumento na cara constroi mais confianca do que escondê-lo. */}
        <p className="mt-8 max-w-[60ch] text-sm leading-relaxed text-white/40">
          O preço de lançamento vale enquanto durar o lançamento. Depois disso, o
          plano mensal passa a custar R$ 147. Preços em reais, impostos
          incluídos.
        </p>
      </div>
    </section>
  );
}
