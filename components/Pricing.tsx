"use client";

import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { useReducedMotionSafe } from "@/components/ui/use-reduced-motion-safe";
import {
  Check,
  ShieldCheck,
  Microphone,
  AppWindow,
  Terminal,
  ChatCircleText,
  Eye,
  Brain,
  Waveform,
  Headset,
  ArrowsClockwise,
  Trophy,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { FloatingPathsBackground } from "@/components/ui/floating-paths";

// Dois planos, mesmo produto, periodicidade diferente. Por isso a lista de
// recursos aparece UMA vez, embaixo, em vez de repetida dentro de cada cartao:
// listar os mesmos oito itens duas vezes finge uma diferenca que nao existe e
// faz a pessoa procurar o que muda entre as colunas.
//
// Numeros conferidos: 139,90 - 79 = 60,90 de desconto no mensal, 43,5%
// (60,90/139,90 = 0,4353). 987 - 650 = 337 de desconto no anual, 34,1%
// (337/987 = 0,3415).
//
// Os dois planos agora seguem a MESMA estrutura de nota: preco de
// lancamento, com o preco normal (pos-lancamento) e o desconto ao lado. Antes
// o anual comparava com o mensal cheio ("economize XXX"); virou comparacao
// direta contra o proprio preco normal do anual, simetrico ao mensal, porque
// agora existe um preco normal proprio pro anual (987) — nao precisa mais
// pedir emprestado o preco do outro plano pra parecer vantajoso.
//
// A urgencia do mensal vem so do que e verdade: o preco sobe para 139,90
// quando o lancamento acabar (e o anual para 987). Sem contador regressivo
// (nao ha data definida) e sem "restam X vagas". Escassez inventada derruba a
// confianca justamente em quem le com atencao, que e o publico deste produto.
// `highlights` NAO repete a lista de recursos (essa e identica nos dois
// planos, repetir dentro dos cartoes so fingiria uma diferenca que nao
// existe). Sao 3 pontos sobre a UNICA coisa que de fato muda entre os
// planos: a forma de cobranca.
const plans = [
  {
    id: "mensal",
    name: "Mensal",
    icon: ArrowsClockwise,
    subtitle: "Para começar sem compromisso",
    price: "R$ 79",
    period: "/mês",
    billingNote: "Preço de lançamento, depois R$ 139,90 · -44%",
    highlights: [
      "Comece hoje, sem burocracia",
      "Ideal pra testar antes de decidir",
      "Sem multa se você cancelar",
    ],
    note: "Cobrado todo mês. Cancele quando quiser.",
    highlighted: false,
  },
  {
    id: "anual",
    name: "Anual",
    icon: Trophy,
    subtitle: "Para quem já decidiu usar todo dia",
    price: "R$ 650",
    period: "/ano",
    billingNote: "Preço de lançamento, depois R$ 987 · -34%",
    highlights: [
      "Equivale a R$ 54,17 por mês",
      "Pague uma vez, esqueça o resto do ano",
      "Preço de lançamento travado por 12 meses",
    ],
    note: "Cobrado uma vez, vale 12 meses.",
    highlighted: true,
  },
];

// So icone + rotulo: essa lista agora roda numa esteira (mesmo mecanismo de
// Integrations.tsx), entao um rotulo curto por item basta pra ler de relance
// enquanto passa. A descricao de uma frase que existia aqui saiu com a versao
// em lista.
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

function IncludedChip({
  item,
  clone = false,
}: {
  item: { icon: Icon; label: string };
  clone?: boolean;
}) {
  const Glyph = item.icon;
  return (
    <div
      aria-hidden={clone || undefined}
      className="flex h-12 shrink-0 items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.03] py-2 pl-3 pr-5 text-sm text-white/65"
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] text-white/70">
        <Glyph size={14} weight="light" aria-hidden />
      </span>
      <span className="whitespace-nowrap">{item.label}</span>
    </div>
  );
}

// Esteira continua, mesma logica de Track em Integrations.tsx: duas copias
// identicas lado a lado, anda -50%, o corte do loop fica invisivel. REPEAT
// maior aqui porque cada chip e mais estreito (so icone + rotulo curto), pra
// cada metade continuar mais larga que telas grandes.
function IncludedTrack() {
  const REPEAT = 4;
  const half = Array.from({ length: REPEAT }, (_, r) =>
    included.map((item) => ({ ...item, key: `${r}-${item.label}` }))
  ).flat();

  return (
    <div
      className="relative flex overflow-hidden"
      style={{
        maskImage:
          "linear-gradient(to right, transparent, #000 8%, #000 92%, transparent)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent, #000 8%, #000 92%, transparent)",
      }}
    >
      <div className="group/track flex shrink-0 animate-marquee-left-slow hover:[animation-play-state:paused]">
        {half.map((item) => (
          <div key={item.key} className="mr-3 shrink-0">
            <IncludedChip item={item} />
          </div>
        ))}
        {/* Segunda metade, so visual: fora da arvore de acessibilidade pra nao
            duplicar os mesmos 8 recursos no leitor de tela. */}
        {half.map((item) => (
          <div key={`dup-${item.key}`} className="mr-3 shrink-0" aria-hidden>
            <IncludedChip item={item} clone />
          </div>
        ))}
      </div>
    </div>
  );
}

// Em fonte monoespacada o caractere de espaco ocupa uma largura inteira, que
// no text-5xl vira um vao grande entre "R$" e o numero. Separar os dois deixa
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

  // Mesmo gate de Integrations.tsx: a esteira troca a ARVORE renderizada
  // (chips duplicados pra loop vs. lista unica envolvida), entao so decide
  // qual versao mostrar depois de montar no cliente — servidor e cliente
  // comecam iguais (esteira), a versao estatica so entra depois.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const staticList = mounted && reduce;

  return (
    <section id="precos" className="relative overflow-hidden bg-ink-950 px-6 py-28 sm:py-36">
      {/* Fios animados no lugar da imagem de curvas de nivel: mesma funcao
          (textura sutil no topo da secao, esmaecendo pro fundo solido), mas
          sem depender de uma imagem pequena demais esticada a 100vw. A
          mascara em gradiente e a mesma logica de antes: nasce transparente,
          pico no meio, esmaece antes do fim, pra emergir do fundo em vez de
          comecar com corte seco. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[760px] opacity-[0.5]"
        style={{
          maskImage:
            "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 9%, rgba(0,0,0,0.8) 20%, #000 32%, #000 52%, rgba(0,0,0,0.45) 74%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 9%, rgba(0,0,0,0.8) 20%, #000 32%, #000 52%, rgba(0,0,0,0.45) 74%, transparent 100%)",
        }}
      >
        <FloatingPathsBackground position={-1} className="h-full" />
      </div>
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
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="text-balance text-3xl font-semibold tracking-[-0.02em] text-[#FAFAFA] sm:text-5xl">
            Escolha como quer usar.
          </h2>
          <p className="mx-auto mt-5 max-w-[56ch] text-lg font-light leading-relaxed text-white/55">
            O Jarvis completo nos dois planos, com os mesmos 8 recursos, sem
            diferença entre Mensal e Anual. A única coisa que muda é de
            quanto em quanto tempo você paga.
          </p>
        </motion.div>

        {/* Estilo de referencia: dois cartoes iguais, compactos, sem efeito
            de fundo animado dentro deles. O selo do plano em destaque virou
            uma pilula sobreposta na borda de cima, centralizada, em vez do
            chip no canto de antes. */}
        <div className="mx-auto mt-14 grid max-w-[970px] grid-cols-1 gap-4 sm:grid-cols-2">
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
              // aspect-ratio saiu: ele calcula a altura a partir da LARGURA
              // do proprio cartao, e cada cartao aqui e bem largo (~metade
              // do container), entao qualquer proporcao retrato virava uma
              // altura enorme (800-900px+) — por isso 9/16 e 3/4 pareciam
              // igualmente esticados, o numero nao era o problema.
              // min-h fixo em vez disso: um pouco mais alto que o cartao 100%
              // compacto de antes, sem depender da largura pra nada.
              // justify-between espalha o conteudo do topo (identidade +
              // preco) ate o rodape (CTA + nota) dentro dessa altura.
              // Sem overflow-hidden: cortava a pilula "Mais popular", que
              // fica de proposito meio pra fora da borda de cima do cartao.
              className={cn(
                "relative flex min-h-[530px] flex-col justify-between rounded-2xl border p-6 transition-colors duration-300 sm:p-7",
                plan.highlighted
                  ? "border-white/25 bg-ink-800 hover:border-white/40"
                  : "border-white/10 bg-ink-900 hover:border-white/20"
              )}
            >
              {plan.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#FAFAFA] px-3.5 py-1 text-xs font-semibold text-ink-950">
                  Mais popular
                </span>
              )}

              <div>
                <h3 className="flex items-center gap-2 text-base font-semibold text-[#FAFAFA]">
                  <plan.icon
                    size={17}
                    weight="light"
                    className="shrink-0 text-white/50"
                    aria-hidden
                  />
                  {plan.name}
                </h3>
                <p className="mt-1 text-sm text-white/45">{plan.subtitle}</p>

                <div className="mt-5 flex items-baseline gap-1.5">
                  <Price
                    value={plan.price}
                    className="font-mono text-4xl font-semibold tracking-tight text-[#FAFAFA] sm:text-5xl"
                  />
                  <span className="text-sm text-white/45">{plan.period}</span>
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-white/40">
                  {plan.billingNote}
                </p>

                {/* Preenche o vao que sobrava entre a nota de preco e o
                    botao. Antes essa lista repetia 4 dos 8 recursos do
                    produto, que sao IDENTICOS nos dois planos, entao os dois
                    cartoes acabavam mostrando quase a mesma coisa — a
                    diferenca so parecia existir, sem existir de verdade.
                    Trocado por 3 pontos sobre a forma de cobranca de cada
                    plano, que e a UNICA diferenca real entre eles. */}
                <ul className="mt-6 flex flex-col gap-2.5">
                  {plan.highlights.map((label) => (
                    <li
                      key={label}
                      className="flex items-center gap-2.5 text-sm text-white/65"
                    >
                      <Check
                        size={14}
                        weight="bold"
                        className="shrink-0 text-white/40"
                        aria-hidden
                      />
                      {label}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <a
                  href="#top"
                  className={cn(
                    "block w-full rounded-full px-6 py-3.5 text-center text-sm font-semibold transition-all duration-200 active:scale-[0.98]",
                    plan.highlighted
                      ? "bg-[#FAFAFA] text-ink-950 hover:bg-white"
                      : "border border-white/15 text-white/85 hover:border-white/40 hover:text-white"
                  )}
                >
                  Começar agora
                </a>

                <p className="mt-3 text-center text-xs text-white/40">
                  {plan.note}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Garantia, fora dos cartoes: vale para os dois planos igualmente,
            entao repeti-la dentro de cada um so inflava os cartoes com a
            mesma frase duas vezes. Uma linha so, entre a escolha e a lista de
            recursos. */}
        <motion.p
          initial={reduce ? false : { opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.5, delay: reduce ? 0 : 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 flex items-center justify-center gap-2 text-center text-sm text-white/55"
        >
          <ShieldCheck size={16} weight="light" className="shrink-0" aria-hidden />
          Garantia de 7 dias: não gostou, devolvemos 100%.
        </motion.p>

        {/* Recursos listados uma vez so, porque valem para os dois planos.
            Sem cartao proprio: um bloco do mesmo peso visual dos planos
            (borda, fundo, padding grande) competia com a decisao real, que e
            escolher entre Mensal e Anual. Uma linha fina no topo basta pra
            separar do grid de planos. Virou esteira (icone + rotulo, sem a
            descricao que tinha antes) em vez de lista parada: mesmo
            mecanismo de Integrations.tsx, com fallback em grade estatica
            quando o visitante pede menos movimento. */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 border-t border-white/[0.08] pt-8"
        >
          {staticList ? (
            <div className="mx-auto flex max-w-3xl flex-wrap justify-center gap-2.5">
              {included.map((item) => (
                <IncludedChip key={item.label} item={item} />
              ))}
            </div>
          ) : (
            <IncludedTrack />
          )}
        </motion.div>
      </div>
    </section>
  );
}
