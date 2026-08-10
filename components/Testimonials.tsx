"use client";

// PLACEHOLDER: nenhum depoimento aqui e real. O produto ainda nao lancou, e
// inventar nomes/falas/fotos de "clientes" seria prova social falsa. Cada
// cartao e um ESPACO RESERVADO explicito (fala entre colchetes, nome "Seu
// nome aqui", sem foto — so um icone generico), pronto pra receber
// depoimentos reais (com nome, foto e selo de verificado) no lancamento.
//
// Layout: carrossel 3D em perspectiva, com 6 esteiras verticais no total —
// 3 tombadas pra ESQUERDA e 3 espelhadas (tombadas pra DIREITA), uma metade
// de cada lado da imagem do "agente" no centro. Cada metade vive na sua
// propria janela com overflow-hidden (ver comentario mais abaixo), o que
// garante que os cartoes de um lado nunca alcancem o outro, mesmo embaixo
// onde a inclinacao 3D desloca as fileiras de lado. Mesmo mecanismo do
// componente Marquee de components/ui/3d-testimonials.tsx.
import React from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { useReducedMotionSafe } from "@/components/ui/use-reduced-motion-safe";
import {
  Quotes,
  User,
  ShieldCheck,
  HardDrives,
  ArrowsClockwise,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";
import SectionEyebrow from "@/components/ui/section-eyebrow";
import { Marquee } from "@/components/ui/3d-testimonials";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type Testimonial = { quote: string; name: string; role: string };

// Temas variados nos placeholders pra a esteira nao repetir a mesma frase.
// Nomes ficam como espaco reservado honesto — nada de pessoa inventada.
const testimonials: Testimonial[] = [
  { quote: "[Depoimento sobre a primeira impressão ao instalar o Jarvis.]", name: "Seu nome aqui", role: "Cliente Jarvis" },
  { quote: "[Depoimento sobre quanto tempo o Jarvis economiza no dia a dia.]", name: "Seu nome aqui", role: "Cliente Jarvis" },
  { quote: "[Depoimento sobre a experiência de ouvir a própria voz clonada.]", name: "Seu nome aqui", role: "Cliente Jarvis" },
  { quote: "[Depoimento sobre controlar o PC inteiro só falando.]", name: "Seu nome aqui", role: "Cliente Jarvis" },
  { quote: "[Depoimento sobre o suporte e a confiança no produto.]", name: "Seu nome aqui", role: "Cliente Jarvis" },
  { quote: "[Depoimento sobre usar o Jarvis no trabalho todos os dias.]", name: "Seu nome aqui", role: "Cliente Jarvis" },
];

const trust: { icon: Icon; title: string; note: string }[] = [
  { icon: ShieldCheck, title: "Garantia de 7 dias", note: "Não gostou, devolvemos 100%" },
  { icon: HardDrives, title: "Dados 100% locais", note: "Nada sai do seu computador" },
  { icon: ArrowsClockwise, title: "Sem fidelidade", note: "Cancele quando quiser" },
];

function TestimonialCard({ item }: { item: Testimonial }) {
  return (
    <Card className="w-80 sm:w-[22rem]">
      <CardContent className="p-6">
        <div className="flex items-center gap-3">
          <Avatar className="size-11 border border-white/15 bg-white/[0.03]">
            <AvatarFallback className="bg-transparent">
              <User size={19} weight="light" />
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-display text-base font-semibold text-[#FAFAFA]">
              {item.name}
            </span>
            <span className="text-xs text-white/45">{item.role}</span>
          </div>
          <Quotes
            size={22}
            weight="fill"
            className="ml-auto shrink-0 text-white/15"
            aria-hidden
          />
        </div>
        <blockquote className="mt-4 text-base font-light italic leading-relaxed text-white/70">
          {item.quote}
        </blockquote>
      </CardContent>
    </Card>
  );
}

export default function Testimonials() {
  const reduce = useReducedMotionSafe();

  return (
    <section
      id="depoimentos"
      className="relative overflow-hidden border-t border-white/[0.07] bg-ink-900 pb-20 pt-20 sm:pb-28 sm:pt-28"
    >
      <div className="relative mx-auto max-w-6xl px-6 lg:px-10 wide:max-w-shell wide:px-16">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto max-w-2xl text-center"
        >
          <div className="flex justify-center">
            <SectionEyebrow>Depoimentos</SectionEyebrow>
          </div>
          <h2 className="mt-5 text-balance font-display text-3xl font-semibold tracking-[-0.02em] text-[#FAFAFA] sm:text-5xl">
            O que dizem sobre o Jarvis.
          </h2>
        </motion.div>
      </div>

      {/* Carrossel 3D funcionando como FUNDO da secao: sangra a largura toda
          da tela, tombado pra esquerda, e continua por baixo da faixa de
          confianca (que sobrepoe a parte de baixo dele, com -mt negativo e
          fundo semi-opaco com blur). Bem maior que antes e puxado pra
          esquerda (translateX menor) pra ocupar o vazio que sobrava do lado
          direito. */}
      <div className="relative left-1/2 mt-10 w-screen -translate-x-1/2">
        <motion.div
          initial={reduce ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          aria-hidden
          className="relative flex h-[560px] w-full items-center overflow-hidden sm:h-[720px]"
        >
          {/* Metade ESQUERDA: 3 esteiras tombadas pra esquerda, presas numa
              janela propria (w-[46vw] + overflow-hidden) que so cobre a
              metade esquerda da tela. Isso e o que garante o pedido de "nao
              deixar os cartoes um em cima do outro embaixo": mesmo que a
              inclinacao 3D desloque uma fileira de lado conforme desce, o
              corte da janela impede que ela chegue perto da metade direita —
              as duas metades nunca podem se encostar, fisicamente. */}
          <div className="absolute inset-y-0 left-0 flex w-[46vw] items-center overflow-hidden pl-[3vw] [perspective:1000px]">
            <div
              className="flex flex-row items-center gap-5"
              style={{
                transform:
                  "translateX(-40px) translateY(0px) translateZ(-100px) rotateX(8deg) rotateY(10deg) rotateZ(-20deg)",
              }}
            >
              <div style={{ transform: "rotateY(0deg) translateZ(0px)" }}>
                <Marquee vertical pauseOnHover repeat={2} className="[--duration:40s]">
                  {testimonials.map((item, i) => (
                    <TestimonialCard key={i} item={item} />
                  ))}
                </Marquee>
              </div>
              <div style={{ transform: "rotateY(6deg) translateZ(-14px)" }}>
                <Marquee vertical pauseOnHover reverse repeat={2} className="[--duration:40s]">
                  {testimonials.map((item, i) => (
                    <TestimonialCard key={i} item={item} />
                  ))}
                </Marquee>
              </div>
              <div style={{ transform: "rotateY(12deg) translateZ(-28px)" }}>
                <Marquee vertical pauseOnHover repeat={2} className="[--duration:40s]">
                  {testimonials.map((item, i) => (
                    <TestimonialCard key={i} item={item} />
                  ))}
                </Marquee>
              </div>
            </div>
          </div>

          {/* Metade DIREITA: espelho exato da esquerda. O sinal trocado em
              translateX/rotateY/rotateZ (mantendo rotateX igual) reflete a
              FORMA tombada pro outro lado — geometria de espelho de verdade,
              nao um scaleX(-1) na esteira inteira, que deixaria o texto dos
              cartoes escrito de tras pra frente. Mesma janela propria do
              lado esquerdo, agora ancorada na borda direita. */}
          <div className="absolute inset-y-0 right-0 flex w-[46vw] items-center justify-end overflow-hidden pr-[3vw] [perspective:1000px]">
            <div
              className="flex flex-row items-center gap-5"
              style={{
                transform:
                  "translateX(40px) translateY(0px) translateZ(-100px) rotateX(8deg) rotateY(-10deg) rotateZ(20deg)",
              }}
            >
              <div style={{ transform: "rotateY(0deg) translateZ(0px)" }}>
                <Marquee vertical pauseOnHover repeat={2} className="[--duration:40s]">
                  {testimonials.map((item, i) => (
                    <TestimonialCard key={i} item={item} />
                  ))}
                </Marquee>
              </div>
              <div style={{ transform: "rotateY(-6deg) translateZ(-14px)" }}>
                <Marquee vertical pauseOnHover reverse repeat={2} className="[--duration:40s]">
                  {testimonials.map((item, i) => (
                    <TestimonialCard key={i} item={item} />
                  ))}
                </Marquee>
              </div>
              <div style={{ transform: "rotateY(-12deg) translateZ(-28px)" }}>
                <Marquee vertical pauseOnHover repeat={2} className="[--duration:40s]">
                  {testimonials.map((item, i) => (
                    <TestimonialCard key={i} item={item} />
                  ))}
                </Marquee>
              </div>
            </div>
          </div>

          {/* Imagem "agente": grande, SEM moldura de cartao de proposito
              (nada de borda/rounded/sombra) — e pra parecer que o busto
              esta flutuando por cima dos cartoes do carrossel, nao mais um
              elemento de UI encaixotado ao lado. Vem DEPOIS das esteiras no
              DOM (fica por cima delas) e ANTES das mascaras de borda (que
              ainda a esmaecem nas bordas, igual fazem com os cartoes).
              object-contain (nao mais object-cover): a foto original e
              paisagem (3:2) e a caixa e bem mais alta que larga, entao
              "cover" cortava as laterais pra preencher a caixa inteira.
              "contain" mostra a foto inteira, sem cortar nada.
              `right` positivo (nao negativo): "right: -Xvw" empurra o
              elemento PRA ALEM da borda direita (ou seja, pra direita) —
              era isso que fazia parecer pouco deslocado pra esquerda antes.
              Valor bem maior e positivo agora, puxando de verdade pro
              centro-esquerda, com uma caixa bem maior (em vw, acompanha a
              largura da tela). */}
          <div className="pointer-events-none absolute inset-y-0 left-1/2 flex -translate-x-1/2 items-center">
            {/* translate-y: pequeno deslocamento vertical (negativo = sobe
                um pouco), sem mexer no fluxo (e so visual). */}
            <div className="relative h-[105%] w-[78vw] max-w-[980px] -translate-y-1 sm:h-[115%] sm:w-[62vw] sm:max-w-[1200px] sm:-translate-y-2">
              <Image
                src="/images/agente.webp"
                alt=""
                fill
                sizes="(max-width: 640px) 78vw, 62vw"
                quality={90}
                className="object-contain"
              />
            </div>
          </div>

          {/* Mascara de cima: a versao anterior (2-3 paradas de cor, com um
              trecho reto e depois um trecho linear) tinha uma "quina" onde a
              inclinacao do gradiente muda de repente — e o olho humano
              enxerga ISSO como uma linha (efeito de banda de Mach), nao
              importa quao alta ou suave a area de transicao seja. A curva
              abaixo segue uma S-curve (smoothstep, inclinacao zero nos dois
              extremos) com 11 paradas, entao ela encosta no solido
              acima e no conteudo transparente abaixo sem nenhuma quina —
              e a mesma logica que faz a faixa de confianca la embaixo
              "disfarçar" bem a transicao. */}
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-[280px] sm:h-[380px]"
            style={{
              background:
                "linear-gradient(to bottom, #0E0E10 0%, rgba(14,14,16,0.972) 10%, rgba(14,14,16,0.896) 20%, rgba(14,14,16,0.784) 30%, rgba(14,14,16,0.648) 40%, rgba(14,14,16,0.5) 50%, rgba(14,14,16,0.352) 60%, rgba(14,14,16,0.216) 70%, rgba(14,14,16,0.104) 80%, rgba(14,14,16,0.028) 90%, transparent 100%)",
            }}
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ink-900 to-transparent sm:h-32" />
          <div className="pointer-events-none absolute inset-y-0 left-0 w-28 bg-gradient-to-r from-ink-900 to-transparent sm:w-48" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-ink-900 to-transparent" />
        </motion.div>
      </div>

      <div className="relative z-10 mx-auto -mt-28 max-w-6xl px-6 sm:-mt-36 lg:px-10 wide:max-w-shell wide:px-16">
        {/* Faixa de confianca: fatos REAIS que a pagina garante. Cartao
            branco solido + icones em chip preto — mesmo tratamento do botao
            selecionado em "Ele age no computador, nao so no chat."
            (Features.tsx), pra destacar essa faixa como um "selo" de
            garantia em vez de mais um bloco escuro entre secoes escuras. */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-1 gap-3 rounded-card border border-white bg-[#FAFAFA] p-3 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.7)] sm:grid-cols-3"
        >
          {trust.map(({ icon: Glyph, title, note }) => (
            <div key={title} className="flex items-center gap-3.5 rounded-chip px-4 py-3">
              <span
                aria-hidden
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-chip border border-ink-950 bg-ink-950 text-white"
              >
                <Glyph size={19} weight="light" />
              </span>
              <span>
                <span className="block font-display text-sm font-semibold text-ink-950">
                  {title}
                </span>
                <span className="block text-xs text-ink-950/80">{note}</span>
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
