"use client";

import React from "react";
import { motion, useReducedMotion } from "motion/react";
import { Check, Tag } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/utils";

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

const included = [
  "Ativação por voz e atalho global",
  "Controle de navegador e programas",
  "Terminal, Git e automações de dev",
  "Integração com Spotify e WhatsApp",
  "Visão de tela e detecção de jogos",
  "Memória persistente ilimitada",
  "Voz clonada, a sua própria voz",
  "Suporte prioritário",
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
  const reduce = useReducedMotion();

  return (
    <section id="precos" className="relative overflow-hidden bg-ink-900 px-6 py-28 sm:py-36">
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
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-white/35">
            Preços
          </span>
          <h2 className="mt-4 text-balance text-3xl font-semibold tracking-[-0.02em] text-[#FAFAFA] sm:text-5xl">
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
                "relative flex flex-col rounded-card border p-8 sm:p-10",
                plan.highlighted
                  ? "border-white/25 bg-ink-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                  : "border-white/[0.09] bg-ink-950"
              )}
            >
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
            </motion.div>
          ))}
        </div>

        {/* Recursos listados uma vez so, porque valem para os dois planos. */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mt-4 rounded-card border border-white/[0.09] bg-ink-950 p-8 sm:p-10"
        >
          <h3 className="text-sm font-medium text-white/50">
            Incluído nos dois planos
          </h3>
          <ul className="mt-7 grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
            {included.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2.5 text-sm text-white/70"
              >
                <Check
                  size={15}
                  weight="bold"
                  className="mt-1 shrink-0 text-white/45"
                  aria-hidden
                />
                <span>{item}</span>
              </li>
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
