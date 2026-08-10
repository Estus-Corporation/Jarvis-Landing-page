"use client";

import React from "react";
import dynamic from "next/dynamic";
import { motion } from "motion/react";
import { useReducedMotionSafe } from "@/components/ui/use-reduced-motion-safe";
import {
  Check,
  ShieldCheck,
  ArrowsClockwise,
  Trophy,
} from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/utils";

// Import dinamico (ssr:false): PrismaticBurst carrega a lib `ogl` (WebGL)
// inteira so pra desenhar um fundo decorativo no fim da pagina. Import
// estatico colocaria isso no bundle JS INICIAL que a pagina inteira precisa
// baixar/rodar pra hidratar — carregando sob demanda, o navegador so busca
// esse pedaco quando a secao de Precos realmente vai ser renderizada.
const PrismaticBurst = dynamic(() => import("@/components/ui/prismatic-burst"), {
  ssr: false,
});

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

  return (
    <section id="precos" className="relative overflow-hidden bg-ink-950 px-6 pb-9 pt-20 sm:pb-10 sm:pt-28 lg:px-10 wide:px-16">
      {/* Fundo animado no lugar da imagem de curvas de nivel: mesma funcao
          (textura no topo da secao, esmaecendo pro fundo solido). A mascara
          em gradiente e a mesma logica de antes: nasce transparente, pico no
          meio, esmaece antes do fim, pra emergir do fundo em vez de comecar
          com corte seco.
          PrismaticBurst (React Bits, ver components/ui/prismatic-burst.tsx):
          raios de luz em 3D via shader WebGL, no lugar do antigo
          FloatingPathsBackground (fios SVG em CSS). `colors` fica preso a
          cinzas/branco (nada de rosa/azul do exemplo original) pra caber no
          sistema monocromatico do site. `paused` respeita reduced motion.
          E BEM mais pesado que o fundo em CSS de antes (shader rodando no
          canvas inteiro, todo frame) — se voltar a pesar em maquina fraca,
          o primeiro ajuste e baixar rayCount/intensity aqui. */}
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
        <PrismaticBurst
          animationType="rotate3d"
          intensity={1.4}
          speed={0.35}
          distort={0.6}
          paused={reduce}
          rayCount={16}
          mixBlendMode="lighten"
          colors={["#ffffff", "#9a9a9a", "#4a4a4a"]}
        />
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 top-1/4 h-[520px] w-[620px] translate-x-1/3 rounded-full bg-white/[0.045] blur-[130px]"
      />

      <div className="relative mx-auto max-w-6xl wide:max-w-shell">
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
        <div className="mx-auto mt-10 grid max-w-[970px] grid-cols-1 gap-4 sm:grid-cols-2">
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
              // Sem hover nos dois cartoes de proposito: o brilho da borda
              // do Anual (que antes so aparecia no hover) virou permanente
              // (border-white/40 direto), e o Mensal fica parado no
              // border-white/10 sempre — nenhum dos dois reage mais ao
              // mouse passando por cima.
              className={cn(
                "relative flex min-h-[530px] flex-col justify-between rounded-2xl border p-6 sm:p-7",
                plan.highlighted
                  ? "border-white/40 bg-ink-800"
                  : "border-white/10 bg-ink-900"
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
                  // Botao do Mensal: anel de borda que acende no hover,
                  // igual pedido — mas NAO via .glow-ring (gradiente conico
                  // girando por angulo). Num botao bem mais largo que alto
                  // (pilula), girar por ANGULO faz o brilho parecer andar
                  // rapido nas bordas retas e "engasgar" (ficar lento, com
                  // comprimento diferente) nas pontas arredondadas — o
                  // gradiente cobre arcos de tamanho bem diferente pra cada
                  // grau de rotacao, dependendo de onde esse angulo cai no
                  // formato. Um SVG com stroke-dasharray/dashoffset anda
                  // pela BORDA DE VERDADE (nao por angulo a partir do
                  // centro), entao velocidade e comprimento do traco ficam
                  // sempre iguais em qualquer ponto do contorno.
                  // pathLength="100" normaliza o perimetro pra 100 unidades
                  // sempre, nao importa o tamanho real em pixels — dasharray
                  // "18 82" (18% aceso) e a animacao (ver .border-beam em
                  // globals.css) funcionam iguais em qualquer largura de
                  // tela, sem precisar medir nada em JS.
                  className={cn(
                    "group relative block w-full overflow-hidden rounded-full border px-6 py-3.5 text-center text-sm font-semibold transition-all duration-300 active:scale-[0.98]",
                    plan.highlighted
                      ? "border-transparent bg-[#FAFAFA] text-ink-950 hover:bg-white"
                      : "border-white/15 text-white/85 hover:border-white/40 hover:text-white"
                  )}
                >
                  {!plan.highlighted && (
                    <svg
                      aria-hidden
                      className="pointer-events-none absolute inset-0 h-full w-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    >
                      <rect
                        x="1"
                        y="1"
                        width="calc(100% - 2px)"
                        height="calc(100% - 2px)"
                        rx="9999"
                        ry="9999"
                        fill="none"
                        stroke="white"
                        strokeOpacity="0.8"
                        strokeWidth="1.5"
                        pathLength={100}
                        strokeDasharray="18 82"
                        className="border-beam"
                      />
                    </svg>
                  )}
                  <span className="relative">Começar agora</span>
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
      </div>
    </section>
  );
}
