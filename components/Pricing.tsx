"use client";

import React from "react";
import dynamic from "next/dynamic";
import {
  motion,
  animate,
  useMotionValue,
  type PanInfo,
} from "motion/react";
import { useReducedMotionSafe } from "@/components/ui/use-reduced-motion-safe";
import { useLowPowerDevice } from "@/components/ui/use-low-power";
import { useMediaQuery } from "@/components/ui/use-media-query";
import {
  Check,
  ShieldCheck,
  ArrowsClockwise,
  Trophy,
} from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/utils";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import SectionEyebrow from "@/components/ui/section-eyebrow";

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

const EASE = [0.16, 1, 0.3, 1] as const;

// ---- Carrossel de arrastar (so no celular, abaixo de sm) -----------------
// Mesma mecanica de Organization.tsx (posFor/snapTo/handleDragEnd) — ver os
// comentarios grandes la pro raciocinio completo.
//
// A tira e FULL-BLEED (`-mx-6 px-6` na janela de recorte, mais abaixo): ela
// sangra por baixo do respiro lateral da secao, entao o vizinho aparece ate a
// borda REAL da tela em vez de parar 24px antes dela, com uma faixa morta de
// fundo no meio. Numeros identicos aos de Features.tsx e Organization.tsx —
// os tres carrosseis da pagina passam a ter a MESMA geometria, e a espiada
// visivel = respiro (24px) + SLIDE_INSET - GAP.
const SWIPE_DISTANCE = 56; // px percorridos
const SWIPE_VELOCITY = 380; // px/s no momento em que o dedo solta
const SLIDE_INSET = 20; // px que o cartao cede pro vizinho (= 1.25rem)
const GAP = 16; // px de vao entre cartoes (= gap-4)

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

// ---- Cartao de plano -------------------------------------------------------
// Conteudo puro, sem animacao de entrada propria: agora ele e desenhado duas
// vezes — dentro da tira arrastavel do celular (as duas copias sempre no ar,
// uma ativa e uma espiando) e dentro do grid lado a lado do desktop (as duas
// sempre inteiras) — e quem decide COMO ele entra em cena e o CHAMADOR (ver
// Pricing(), mais abaixo), nao este componente.
function PlanCard({
  plan,
  isPeeking,
  mensalHovered,
  setMensalHovered,
  reduce,
}: {
  plan: (typeof plans)[number];
  isPeeking: boolean;
  mensalHovered: boolean;
  setMensalHovered: (v: boolean) => void;
  reduce: boolean;
}) {
  return (
    <div
      // aria-hidden: enquanto so espiando (arrastando ou parado do lado do
      // ativo), o cartao inteiro (preco, lista, botao) continua no DOM mas
      // nao deve ser anunciado por leitor de tela nem alcancado por Tab —
      // ver tambem o tabIndex no CTA, mais abaixo, que e o unico elemento
      // focavel aqui dentro.
      aria-hidden={isPeeking || undefined}
      // h-full: preenche a celula do grid de desktop (que estica pra
      // altura da MAIOR das duas via align-items:stretch, o padrao de
      // grid) e a altura natural do proprio min-h na tira do celular (que
      // nao estica ninguem). aspect-ratio saiu de vez: ele calcula a
      // altura a partir da LARGURA do proprio cartao, e cada cartao aqui e
      // bem largo (~metade do container), entao qualquer proporcao
      // retrato virava uma altura enorme (800-900px+).
      // min-h fixo em vez disso: um pouco mais alto que o cartao 100%
      // compacto de antes, sem depender da largura pra nada.
      // justify-between espalha o conteudo do topo (identidade + preco)
      // ate o rodape (CTA + nota) dentro dessa altura.
      // min-h MENOR so abaixo de sm (480px, era 530 tambem ali): no
      // celular so um cartao aparece por vez, e os 530px originais
      // sobravam vao morto entre a lista de destaques e o botao — o
      // `justify-between` esticava esse respiro em vez de conteudo real.
      // sm: recupera os 530px de sempre pro grid lado a lado, onde os
      // DOIS cartoes precisam bater na mesma altura.
      // Sem overflow-hidden NO CARTAO: cortava a pilula "Mais popular",
      // que fica de proposito meio pra fora da borda de cima dele — quem
      // corta a espiada e o WRAPPER da tira (ver Pricing(), mais abaixo),
      // nunca o cartao.
      // Sem hover nos dois cartoes de proposito: o brilho da borda do
      // Anual (que antes so aparecia no hover) virou permanente
      // (border-white/40 direto), e o Mensal fica parado no
      // border-white/10 sempre — nenhum dos dois reage mais ao mouse
      // passando por cima.
      className={cn(
        "relative flex h-full min-h-[480px] flex-col justify-between rounded-2xl border p-6 sm:min-h-[530px] sm:p-7 laptop:min-h-[430px] laptop:p-6",
        plan.highlighted
          ? "border-white/40 bg-ink-800"
          : "border-white/10 bg-ink-900",
        // So decorativa enquanto espia: sem isso, tocar bem na borda da
        // espiada ativaria o CTA por baixo sem o visitante ter arrastado
        // ou escolhido o plano de verdade.
        isPeeking && "pointer-events-none"
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
            className="font-mono text-4xl font-semibold tracking-tight text-[#FAFAFA] sm:text-5xl laptop:text-[2.625rem]"
          />
          <span className="text-sm text-white/45">{plan.period}</span>
        </div>
        <p className="mt-1.5 text-xs leading-relaxed text-white/40">
          {plan.billingNote}
        </p>

        {/* Preenche o vao que sobrava entre a nota de preco e o botao.
            Antes essa lista repetia 4 dos 8 recursos do produto, que sao
            IDENTICOS nos dois planos, entao os dois cartoes acabavam
            mostrando quase a mesma coisa — a diferenca so parecia existir,
            sem existir de verdade. Trocado por 3 pontos sobre a forma de
            cobranca de cada plano, que e a UNICA diferenca real entre
            eles. */}
        <ul className="mt-6 flex flex-col gap-2.5 laptop:mt-5">
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
          // tabIndex -1 enquanto so espiando: e o UNICO elemento focavel
          // do cartao, entao tirar ele da ordem de tab basta pra fechar o
          // cartao inteiro pra quem navega por teclado (o aria-hidden do
          // cartao, mais acima, cuida do leitor de tela).
          tabIndex={isPeeking ? -1 : undefined}
          onMouseEnter={() => {
            if (plan.id === "mensal") setMensalHovered(true);
          }}
          onMouseLeave={() => {
            if (plan.id === "mensal") setMensalHovered(false);
          }}
          // Botao do Mensal: aro que gira pelas 4 bordas quando ocioso e
          // acende branco uniforme no hover (HoverBorderGradient,
          // components/ui/hover-border-gradient.tsx, adaptado do "Hover
          // Border Gradient" da Aceternity UI). Precisa do estado real de
          // hover (mensalHovered) porque o alvo do gradiente muda com o
          // hover — group-hover em CSS puro so controlaria opacidade, nao
          // decidiria qual gradiente animar.
          // hover:-translate-y-0.5 + hover:scale-[1.02]: mesmo gesto do
          // CTA "Comecar agora" da Hero — levanta 2px e cresce de leve,
          // voltando ao chao e encolhendo no clique. Vale para os dois
          // planos; o que continua diferente entre eles e so a superficie
          // (branca no Anual, aro girando no Mensal).
          className={cn(
            "group relative block w-full overflow-hidden rounded-full border px-6 py-3.5 text-center text-base font-semibold transition-all duration-300 ease-out hover:-translate-y-0.5 hover:scale-[1.02] active:translate-y-0 active:scale-[0.98]",
            plan.highlighted
              ? "border-transparent bg-[#FAFAFA] text-ink-950 hover:bg-white"
              : "border-white/15 text-white/85 hover:border-white/40 hover:text-white"
          )}
        >
          {!plan.highlighted && !reduce && (
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-[inherit]"
            >
              <HoverBorderGradient hovered={mensalHovered} />
            </div>
          )}
          <span className="relative">
            {plan.id === "mensal" ? "Obter plano Mensal" : "Obter plano Anual"}
          </span>
        </a>

        <p className="mt-3 text-center text-xs text-white/40">{plan.note}</p>
      </div>
    </div>
  );
}

export default function Pricing() {
  const reduce = useReducedMotionSafe();
  // Ver o comentario do fundo, mais abaixo: decide entre o shader WebGL e o
  // degrade estatico que faz as vezes dele.
  const lowPower = useLowPowerDevice();
  const [mensalHovered, setMensalHovered] = React.useState(false);
  // So no mobile: qual dos dois cartoes esta ativo. No desktop os dois
  // aparecem lado a lado e este estado e ignorado (o grid de la nunca
  // depende dele).
  const [mobilePlan, setMobilePlan] = React.useState<string>("mensal");
  const activeIndex = plans.findIndex((p) => p.id === mobilePlan);

  // ---- Carrossel de arrastar (so no celular, abaixo de sm) ---------------
  // Mesma mecanica de Organization.tsx (posFor/snapTo) — ver os comentarios
  // grandes la pro raciocinio completo. O alternador (mais abaixo) agora
  // "arrasta sozinho": clicar em "Anual" so troca `mobilePlan`, e o
  // useEffect logo depois de `snapTo` reage a essa troca animando a tira
  // ate la, em vez de so re-renderizar o cartao ativo na hora.
  //
  // Precisa de JS (nao so `sm:` no className) pra saber quando ligar o
  // `drag` do motion e a interseccao dele com aria-hidden/tabIndex — ver
  // `isPeeking`, mais abaixo, calculado por cartao dentro do proprio JSX.
  const isMobileCarousel = useMediaQuery("(max-width: 639px)");

  const viewportRef = React.useRef<HTMLDivElement | null>(null);
  const [trackWidth, setTrackWidth] = React.useState(0);
  React.useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) =>
      setTrackWidth(entry.contentRect.width)
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const x = useMotionValue(0);
  // PASSO de uma parada = largura do cartao (trackWidth - SLIDE_INSET) + o
  // vao.
  const stride = trackWidth ? trackWidth - SLIDE_INSET + GAP : 0;
  const contentWidth = stride ? plans.length * stride - GAP : 0;
  const minX = Math.min(0, trackWidth - contentWidth);
  const posFor = (idx: number) => Math.max(-idx * stride, minX);

  const snapTo = (idx: number) => {
    if (!stride) return;
    animate(x, posFor(idx), { type: "spring", stiffness: 380, damping: 42 });
  };

  React.useEffect(() => {
    if (!isMobileCarousel) {
      x.set(0);
      return;
    }
    snapTo(activeIndex);
    // snapTo e recriado a cada render (le stride); as deps abaixo sao as
    // entradas reais dele.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, isMobileCarousel, stride]);

  // Arrastar pra ESQUERDA avanca (Mensal -> Anual), pra DIREITA volta —
  // mesma convencao dos outros carrosseis. Math.min/max trava nas pontas
  // (sem dar a volta), que e o que faz o elastico bater no Anual em vez de
  // pular de volta pro Mensal no meio de um arrasto.
  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const { offset, velocity } = info;
    let next = activeIndex;
    if (offset.x < -SWIPE_DISTANCE || velocity.x < -SWIPE_VELOCITY)
      next = Math.min(activeIndex + 1, plans.length - 1);
    else if (offset.x > SWIPE_DISTANCE || velocity.x > SWIPE_VELOCITY)
      next = Math.max(activeIndex - 1, 0);

    if (next === activeIndex) snapTo(activeIndex);
    else setMobilePlan(plans[next].id);
  };

  return (
    <section
      id="precos"
      // laptop:* (ver tailwind.config.ts): tela de desktop, mas baixa. O
      // rodape ja e curto (pb-9/10), entao o que cede aqui e o topo, o bloco
      // do titulo e a altura minima dos dois cartoes.
      className="relative overflow-hidden bg-ink-950 px-6 pb-9 pt-20 sm:pb-10 sm:pt-28 lg:px-10 laptop:pt-16 wide:px-16"
    >
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
          canvas inteiro, todo frame). Ele ja vem espremido ate onde dava sem
          estragar o visual (dpr 0.5, 24 passos de raymarch, teto de 30fps,
          pausa fora da tela — ver prismatic-burst.tsx), mas raymarching e
          custo POR PIXEL: numa GPU integrada nao existe ajuste de parametro
          que torne isso barato. Por isso, em maquina fraca, o shader nao
          monta e entra o degrade estatico abaixo — mesma leitura visual
          (clarao emergindo do topo), uma pintura so, zero por frame. */}
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
        {lowPower ? (
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(ellipse 70% 55% at 50% 6%, rgba(255,255,255,0.30) 0%, rgba(255,255,255,0.13) 32%, rgba(255,255,255,0.04) 58%, transparent 78%)",
            }}
          />
        ) : (
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
        )}
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
          <SectionEyebrow>Preços</SectionEyebrow>
          {/* Fonte fluida: trava em 48px pouco antes dos 640px, entao o
              resultado bate com o antigo sm:text-5xl sem precisar do degrau
              (que e o que causava estouro logo apos o breakpoint). */}
          {/* Mesma formula de fonte de Roadmap.tsx ("Próximas atualizações")
              — ver comentario identico em Showcase.tsx. "Escolha como quer
              usar." (23 caracteres) estourava a caixa em telas estreitas
              nesse tamanho (medido: ate 44px de overflow a 414px) — encurtado
              pra caber igual aos demais. */}
          <h2 className="mt-5 whitespace-nowrap leading-tight text-[length:clamp(0.9rem,calc(10.22vw_-_5.52px),3rem)] font-semibold tracking-[-0.02em] text-[#FAFAFA] laptop:text-[2.625rem]">
            Escolha seu plano.
          </h2>
          <p className="mx-auto mt-5 max-w-[56ch] text-lg font-light leading-relaxed text-white/55 laptop:mt-4">
            O Jarvis completo nos dois planos. Só muda a forma de pagar.
          </p>
        </motion.div>

        {/* Alternador so no mobile: os dois cartoes nao cabem lado a lado num
            celular. Continua UM cartao por vez, com dois botoes por cima pra
            trocar — so que agora "trocar" e a MESMA tira arrastavel do
            carrossel logo abaixo (ver `snapTo`/useEffect, mais acima):
            clicar em "Anual" desliza a tira ate la, em vez de so re-renderizar
            o cartao ativo na hora. Some em sm+, onde os dois cartoes voltam a
            aparecer lado a lado no grid. Ativo = "selo branco" (mesmo padrao
            de selecao do resto do site). */}
        <div className="mx-auto mt-10 flex w-full max-w-[320px] gap-1 rounded-full border border-white/10 bg-ink-900 p-1 sm:hidden">
          {plans.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setMobilePlan(p.id)}
              aria-pressed={mobilePlan === p.id}
              className={cn(
                "flex-1 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors",
                mobilePlan === p.id
                  ? "bg-[#FAFAFA] text-ink-950"
                  : "text-white/60 hover:text-white"
              )}
            >
              {p.name}
            </button>
          ))}
        </div>

        <div className="mx-auto max-w-[970px]">
          {/* Celular (abaixo de sm): carrossel de arrastar de verdade — a
              tira acompanha o dedo, com uma leve previa do vizinho (PEEK=32,
              GAP=12 — mais discreta que os 44/16 dos outros carrosseis do
              site, "leve previa" foi pedido assim). So 2 itens, entao o
              mecanismo e simetrico: com o Mensal ativo o Anual espia a
              direita; arrastando ate o Anual (ultima parada, trava flush a
              direita) e o Mensal quem passa a espiar a esquerda — mesmo
              "elastico bate na ponta" de Organization.tsx/Roadmap.tsx, so
              que com 2 cartoes em vez de 3. */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="mt-5 sm:hidden"
          >
            {/* O mesmo par margem-negativa/padding em DOIS eixos, por dois
                motivos diferentes:
                -mx-6 + px-6 (horizontal): a janela sangra por baixo do
                respiro lateral da secao, entao ela recorta na borda REAL da
                tela e o vizinho aparece ate la — sem isso ele parava 24px
                antes, com uma faixa morta de fundo entre a espiada e a
                borda (ver SLIDE_INSET/GAP, mais acima).
                -mt-3 + pt-3 (vertical): o overflow-hidden corta em
                RETANGULO, topo incluso — sem essa folga ele cortava a
                pilula "Mais popular" do Anual quando ele e o cartao ativo
                (ela fica de proposito 12px/-top-3 pra fora da borda de cima
                do cartao).
                Nos dois eixos a conta e a mesma: a margem negativa estica a
                caixa pra fora, o padding devolve o mesmo tanto por dentro,
                entao o conteudo continua comecando exatamente onde
                comecaria sem os dois — o que muda e so ONDE o recorte
                acontece. */}
            <div
              ref={viewportRef}
              className="-mx-6 -mt-3 overflow-hidden px-6 pt-3"
            >
              <motion.div
                drag={isMobileCarousel ? "x" : false}
                dragConstraints={{ left: minX, right: 0 }}
                dragElastic={0.15}
                dragMomentum={false}
                onDragEnd={handleDragEnd}
                style={{ x }}
                className="flex cursor-grab items-start gap-4 active:cursor-grabbing"
              >
                {plans.map((plan, i) => (
                  // 1.25rem = 20px = SLIDE_INSET, o mesmo numero de
                  // Features.tsx/Organization.tsx — e dai que sai o cartao
                  // do mesmo tamanho nas tres secoes.
                  <div key={plan.id} className="w-[calc(100%-1.25rem)] shrink-0">
                    <PlanCard
                      plan={plan}
                      isPeeking={i !== activeIndex}
                      mensalHovered={mensalHovered}
                      setMensalHovered={setMensalHovered}
                      reduce={reduce}
                    />
                  </div>
                ))}
              </motion.div>
            </div>
          </motion.div>

          {/* Desktop (sm+): grid lado a lado, como sempre foi — sem tira,
              sem drag, os dois cartoes inteiros e do mesmo tamanho (grid
              estica os dois pra altura do mais alto). */}
          <div className="hidden gap-4 sm:mt-10 sm:grid sm:grid-cols-2 laptop:mt-8">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.id}
                initial={reduce ? false : { opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                  duration: 0.65,
                  delay: reduce ? 0 : i * 0.09,
                  ease: EASE,
                }}
              >
                <PlanCard
                  plan={plan}
                  isPeeking={false}
                  mensalHovered={mensalHovered}
                  setMensalHovered={setMensalHovered}
                  reduce={reduce}
                />
              </motion.div>
            ))}
          </div>
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
          className="mt-6 flex translate-y-1 items-center justify-center gap-2 text-center text-sm text-white/55"
        >
          <ShieldCheck size={16} weight="light" className="shrink-0" aria-hidden />
          Garantia de 7 dias: não gostou, devolvemos 100%.
        </motion.p>
      </div>
    </section>
  );
}
