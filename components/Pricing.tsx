"use client";

import React from "react";
import dynamic from "next/dynamic";
import {
  motion,
  animate,
  useMotionValue,
  type PanInfo,
} from "motion/react";
import { useReducedMotionSafe, useSkipEntrance } from "@/components/ui/use-reduced-motion-safe";
import { useLowPowerDevice } from "@/components/ui/use-low-power";
import { useMediaQuery } from "@/components/ui/use-media-query";
import {
  Check,
  ShieldCheck,
  ArrowsClockwise,
  Trophy,
  DownloadSimple,
  WindowsLogo,
  Tag,
  ArrowRight,
  CreditCard,
  Microphone,
  Desktop,
} from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/utils";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import SectionEyebrow from "@/components/ui/section-eyebrow";
import { TechFrame } from "@/components/ui/tech-frame";
import { MENSAL_LAUNCH, isLaunchActive } from "@/lib/plans";

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
// Ancora de preco (decisao de 24/09/2026): o anual compara com 12x o
// mensal — 12 x 110 = 1.320; 1.320 - 899 = 421 de economia, 31,9% (-32%).
// E verdade matematica, conferivel pelo visitante na propria pagina. O
// mensal NAO tem preco riscado: o antigo "de R$139,90" era um preco futuro
// sem data, e "de/por" com preco que nunca foi cobrado e publicidade
// enganosa (CDC). Sem contador regressivo e sem "restam X vagas" — escassez
// inventada derruba a confianca de quem le com atencao.
//
// Mudou o preco do mensal? Recalcule `normalPrice`/`discountPercent` do anual.
//
// PRECO DE LANCAMENTO (28/09/2026, ver MENSAL_LAUNCH em lib/plans.ts): durante
// a janela o Mensal mostra R$ 79 no 1º mes (depois R$ 110), e o Anual passa a
// comparar com 12 x 79 = 948 (decisao do usuario): 948 - 899 = 49, 5,2% (-5%).
// Fora da janela, tudo volta aos valores de sempre acima. Aqui o "R$ 110" do
// Mensal NAO e preco riscado de/por: e o valor real das renovacoes, entao
// aparece RISCADO com "-28%" (pedido do usuario): e o preco normal de
// verdade, cobrado antes e nas renovacoes — de/por legitimo.
// `highlights` NAO repete a lista de recursos (essa e identica nos dois
// planos, repetir dentro dos cartoes so fingiria uma diferenca que nao
// existe). Sao 3 pontos sobre a UNICA coisa que de fato muda entre os
// planos: a forma de cobranca.
// ─────────────────────────────────────────────────────────────────────────
// OS CINCO LUGARES ONDE O PREÇO DE UM PLANO VIVE. Divergência entre eles não é
// bug de UI: é cobrar um valor diferente do anunciado, o que o CDC trata como
// publicidade enganosa. Mudou um, varra os cinco na mesma passada:
//
//   1. Jarvis-Landing-page/lib/plans.ts        → o que o Mercado Pago cobra
//   2. Jarvis-Landing-page/components/Pricing.tsx → o texto que o visitante lê
//   3. Jarvis-Landing-page/app/page.tsx        → o JSON-LD que o Google indexa
//   4. Jarvis-Credits-Server/src/pricing.ts    → PLAN_ALLOTMENT_MICRO e PLAN_DIAS
//                                                (quanto de uso o preço compra —
//                                                 e de onde saía o "~815 comandos
//                                                 de voz por mês" dos dois cards)
//   5. Project-Jarvis/legal/termos-de-uso.md   → seção 13, o valor contratado
// ─────────────────────────────────────────────────────────────────────────
function getPlans(launch: boolean) {
  return [
  {
    id: "mensal",
    name: "Mensal",
    icon: ArrowsClockwise,
    subtitle: "Para começar sem compromisso",
    price: launch ? `R$ ${MENSAL_LAUNCH.price}` : "R$ 110",
    period: launch ? "/1º mês" : "/mês",
    // So no lancamento: selo no cabecalho, e o preco normal RISCADO com o
    // selo de desconto (pedido do usuario, 28/09/2026). Riscar o 110 aqui
    // e de/por legitimo: e o preco que valia antes e o que as renovacoes
    // cobram. 79/110 = 71,8% → -28% (so no 1º mes, e a lista logo abaixo
    // diz isso por extenso).
    launchUntil: launch ? MENSAL_LAUNCH.endsLabel : undefined,
    afterPrice: undefined as string | undefined,
    normalPrice: launch ? "R$ 110/mês" : undefined,
    discountPercent: launch ? "-28%" : undefined,
    anchorLabel: launch ? "preço normal" : undefined,
    highlights: [
      // O "~815 comandos de voz por mês (~27 por dia)" que abria esta lista
      // (e a do Anual) saiu a pedido do usuario em 28/09/2026. Se voltar, o
      // numero sai do PLAN_ALLOTMENT_MICRO do Credits Server (src/pricing.ts)
      // dividido pelo custo de uma interação de voz.
      launch
        ? `R$ ${MENSAL_LAUNCH.price} no 1º mês, depois R$ 110/mês`
        : "Comece hoje, sem burocracia",
      "Sem multa se você cancelar",
    ],
    note: launch
      ? `Preço de lançamento válido até ${MENSAL_LAUNCH.endsLabel}. Cancele quando quiser.`
      : "Cobrado todo mês. Cancele quando quiser.",
    highlighted: false,
  },
  {
    id: "anual",
    name: "Anual",
    icon: Trophy,
    subtitle: "Para quem já decidiu usar todo dia",
    price: "R$ 899",
    period: "/ano",
    launchUntil: undefined as string | undefined,
    afterPrice: undefined as string | undefined,
    normalPrice: launch ? "R$ 948" : "R$ 1.320",
    discountPercent: launch ? "-5%" : "-32%",
    anchorLabel: launch ? `12× R$ ${MENSAL_LAUNCH.price}` : "12× o mensal",
    highlights: [
      "Equivale a R$ 74,92 por mês",
      "Preço travado por 12 meses",
    ],
    note: "Cobrado uma vez, vale 12 meses.",
    highlighted: true,
  },
  ];
}

type Plan = ReturnType<typeof getPlans>[number];

const EASE = [0.16, 1, 0.3, 1] as const;

// Liga o preco de lancamento so dentro da janela de MENSAL_LAUNCH. Decidido
// no cliente (a pagina e estatica: um HTML gerado no build nao sabe que dia e
// hoje) — nasce desligado e o efeito liga, entao fora da janela nunca pisca o
// preco promocional. `?lancamento=1` / `?lancamento=0` forcam, pra conferir o
// visual fora das datas (mesmo padrao do `?lowpower=`).
function useLaunchPromo() {
  const [active, setActive] = React.useState(false);
  React.useEffect(() => {
    const forced = new URLSearchParams(window.location.search).get("lancamento");
    setActive(forced === "1" ? true : forced === "0" ? false : isLaunchActive());
  }, []);
  return active;
}

// ---- Download (topo da secao) -------------------------------------------
// Decisao de 25/09/2026: todo mundo que baixa comeca de graca, sem cartao,
// entao a acao
// PRINCIPAL da secao deixou de ser "escolher plano" e virou "baixar". Os
// planos continuam na mesma secao, atras do botao "Planos": quem vai baixar quer
// saber quanto custa depois (preco escondido le como pegadinha), e o CDC
// quer o preco visivel antes da compra.
//
// O teste NAO e por dias, e por USO (um saldo inicial de creditos — ver
// FREE_GRANT_MICRO no Credits Server), e o tamanho dele NAO e divulgado,
// decisao do usuario. Por isso nenhum texto daqui fala em prazo nem em
// quantidade: so "gratis" e "sem cartao". (A "Garantia de 7 dias" no fim da
// secao e outra coisa — e o reembolso do CDC, depois de pagar.)
//
// Link ESTAVEL do GitHub Releases: `latest/download/<arquivo>` redireciona
// sempre pro instalador da versao mais nova, e o electron-builder publica
// `Jarvis-Setup.exe` (sem numero de versao) justamente pra isso. Mesmo
// arquivo do mesmo lugar tambem e o que ajuda a reputacao no SmartScreen (ver
// DISTRIBUICAO-EXE.md no Project-Jarvis). Override por env pra trocar sem
// mexer no codigo, mesmo padrao do link da Comunidade em Formulario.tsx.
const DOWNLOAD_URL =
  process.env.NEXT_PUBLIC_DOWNLOAD_URL ||
  "https://github.com/Estus-Corporation/Jarvis-Releases/releases/latest/download/Jarvis-Setup.exe";

// Tela de download (pedido do usuario, 28/09/2026): selo, titulo, frase e CTA
// centralizados, e uma faixa de destaques embaixo com o botao "Planos" na
// ponta. Ja teve uma esfera (JarvisOrb) na direita — tirada a pedido, ficou
// ruim ao lado do texto. A tela de planos continua com o cabecalho de antes.
function DownloadHero({ skipEntrance }: { skipEntrance: boolean }) {
  return (
      <motion.div
        initial={skipEntrance ? false : { opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="flex flex-col items-center text-center"
      >
        <SectionEyebrow>Download</SectionEyebrow>
        <h2 className="mt-6 text-[length:clamp(2.25rem,7vw,4rem)] font-semibold leading-[1.05] tracking-[-0.03em] text-[#FAFAFA] laptop:text-[3.25rem]">
          Baixe o Jarvis agora!
        </h2>
        <p className="mx-auto mt-4 max-w-[46ch] text-lg font-light leading-relaxed text-white/55">
          Comece de graça. Depois, escolha como quer continuar.
        </p>

        <div className="mt-9 flex w-full flex-col items-center">
          <div className="relative w-full max-w-[340px] sm:w-auto sm:max-w-none">
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-3 rounded-full bg-white/15 blur-xl"
            />
            {/* Mesmo gesto dos CTAs solidos do site (Hero): levanta 2px e
                cresce de leve no hover. A seta anda um pouco junto. */}
            <a
              href={DOWNLOAD_URL}
              className="group relative flex w-full items-center justify-between gap-10 rounded-full bg-[#FAFAFA] py-4 pl-7 pr-6 text-base font-semibold text-ink-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_10px_30px_-12px_rgba(255,255,255,0.45)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:scale-[1.02] hover:bg-white active:translate-y-0 active:scale-[0.98] sm:w-auto sm:text-lg"
            >
              <span className="flex items-center gap-3">
                <WindowsLogo size={24} weight="fill" aria-hidden className="shrink-0" />
                Baixar grátis
              </span>
              <ArrowRight
                size={18}
                weight="bold"
                aria-hidden
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </a>
          </div>
          {/* "· versao mais recente" some no celular: com ela a linha
              quebrava em duas e o icone ficava sozinho na ponta. */}
          <p className="mt-4 flex items-center gap-1.5 text-xs text-white/40">
            <WindowsLogo size={13} weight="fill" aria-hidden className="shrink-0" />
            <span>
              Para Windows · Sem cartão de crédito
              <span className="hidden sm:inline"> · Versão mais recente</span>
            </span>
          </p>
        </div>
      </motion.div>

  );
}

// Faixa de destaques da tela de download. So coisas que ja sao verdade em
// outro lugar da pagina/do fluxo — nada de "instala em X minutos" ou lista
// de versoes do Windows que ninguem conferiu.
const DOWNLOAD_HIGHLIGHTS = [
  { icon: CreditCard, title: "Sem cartão", text: "Comece sem pagar nada" },
  { icon: Microphone, title: "Jarvis completo", text: "Todos os recursos no teste" },
  { icon: ShieldCheck, title: "Instalador oficial", text: "Sempre atualizado" },
  { icon: Desktop, title: "Feito para Windows", text: "Roda direto no seu PC" },
];

function DownloadHighlights({ onShowPlans }: { onShowPlans: () => void }) {
  return (
    <div className="mt-14 border-t border-white/[0.08] pt-8 lg:mt-16 laptop:mt-12">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-6">
        <ul className="grid flex-1 grid-cols-2 gap-x-4 gap-y-6 lg:flex lg:gap-0">
          {DOWNLOAD_HIGHLIGHTS.map(({ icon: Icon, title, text }, i) => (
            <li
              key={title}
              className={cn(
                "flex flex-col gap-2 lg:flex-1 lg:px-6",
                i === 0 && "lg:pl-0",
                i > 0 && "lg:border-l lg:border-white/[0.08]"
              )}
            >
              <Icon size={20} weight="regular" aria-hidden className="text-white/70" />
              <div>
                <p className="text-sm font-medium text-white/85">{title}</p>
                <p className="mt-0.5 text-xs text-white/40">{text}</p>
              </div>
            </li>
          ))}
        </ul>
        {/* Contorno, nao fundo branco: o CTA solido da tela e o "Baixar
            gratis"; este e navegacao. */}
        <button
          type="button"
          onClick={onShowPlans}
          aria-controls="precos"
          className="group flex shrink-0 items-center justify-center gap-3 self-center rounded-full border border-white/20 bg-ink-900 px-6 py-3 text-sm font-semibold text-white/80 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-white/45 hover:text-white active:translate-y-0 active:scale-[0.97] lg:self-auto"
        >
          <Tag size={16} weight="bold" aria-hidden />
          Planos
          <ArrowRight
            size={15}
            weight="bold"
            aria-hidden
            className="transition-transform duration-300 group-hover:translate-x-1"
          />
        </button>
      </div>
    </div>
  );
}

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
  inCarousel = false,
  mensalHovered,
  setMensalHovered,
  reduce,
}: {
  plan: Plan;
  isPeeking: boolean;
  // So a tira do celular passa true: la a janela de recorte cortaria o halo
  // de fora seco, entao ele nao e desenhado (mesma decisao de
  // Organization.tsx).
  inCarousel?: boolean;
  mensalHovered: boolean;
  setMensalHovered: (v: boolean) => void;
  reduce: boolean;
}) {
  // MESMO CARD DA HUD DE CRIACAO DE TAREFA do app (TaskModal), igual aos 3
  // cartoes de Organization.tsx — ver o comentario grande em
  // FeatureCardBody la pra origem de cada peca. Moldura TechFrame no lugar
  // do rounded-2xl + border, cabecalho ink-700 com filete, corpo ink-800 com
  // brilho interno e halo desfocado por fora. O destaque do Anual, que antes
  // era a borda white/40 permanente, virou o halo mais forte — a moldura e a
  // mesma nos dois, como no app.
  //
  // A pilula "Mais popular" mora FORA do TechFrame, como irma dele: o miolo
  // da moldura e recortado por clip-path, e ela fica de proposito meio pra
  // fora da borda de cima — dentro, seria cortada ao meio.
  return (
    <div
      // aria-hidden: enquanto so espiando (arrastando ou parado do lado do
      // ativo), o cartao inteiro (preco, lista, botao) continua no DOM mas
      // nao deve ser anunciado por leitor de tela nem alcancado por Tab —
      // ver tambem o tabIndex no CTA, mais abaixo, que e o unico elemento
      // focavel aqui dentro.
      aria-hidden={isPeeking || undefined}
      className={cn(
        "relative h-full",
        // So decorativa enquanto espia: sem isso, tocar bem na borda da
        // espiada ativaria o CTA por baixo sem o visitante ter arrastado
        // ou escolhido o plano de verdade.
        isPeeking && "pointer-events-none"
      )}
    >
      {!inCarousel && (
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute -inset-[14px] rounded-[30px] bg-white blur-[20px]",
            plan.highlighted ? "opacity-[0.09]" : "opacity-[0.04]"
          )}
        />
      )}
      <TechFrame
        className="h-full"
        innerStyle={{
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.08), inset 0 0 14px rgba(255,255,255,0.14), inset 0 0 28px rgba(255,255,255,0.08), inset 0 0 50px rgba(255,255,255,0.045)",
        }}
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
      // Sem hover nos dois cartoes de proposito: nenhum dos dois reage ao
      // mouse passando por cima (o halo do Anual e permanente).
      // O padding saiu do miolo: agora o cabecalho (faixa ink-700) e o
      // corpo carregam cada um o seu, porque a faixa precisa encostar nas
      // bordas da moldura.
      // O vao entre moldura e conteudo (PAD em tech-frame.tsx, 12px) mostra
      // o ink-900 — mesma leitura de Organization.tsx. Os min-h do painel
      // descontam os 24px desse vao (12 em cima + 12 embaixo), entao o
      // cartao inteiro continua com a altura de antes: 480/530/430.
      innerClassName="h-full bg-ink-900"
      contentClassName="relative flex h-full min-h-[516px] flex-col bg-ink-800 sm:min-h-[506px] laptop:min-h-[406px]"
      >
      {/* Cabecalho do card da HUD: faixa ink-700 (#1c1c20 no app) com o
          filete de baixo. */}
      <div className="border-b border-white/[0.055] bg-ink-700 px-6 pb-5 pt-6 sm:px-7 laptop:px-6">
        <h3 className="flex items-center gap-2 text-base font-semibold text-[#FAFAFA]">
          <plan.icon
            size={17}
            weight="light"
            className="shrink-0 text-white/50"
            aria-hidden
          />
          {plan.name}
          {/* Selo do preco de lancamento, na MESMA linha do nome (pedido do
              usuario), com a data de fim ESCRITA: prazo concreto e
              verificavel, nao "corra que acaba". */}
          {plan.launchUntil && (
            // -my-1: o selo e um pouco mais alto que a linha do nome; sem a
            // margem negativa ele empurrava o cabecalho do Mensal ~10px pra
            // baixo do do Anual, e os precos desalinhavam.
            <span className="-my-1 ml-1.5 inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-white/25 bg-white/[0.06] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-white/85 sm:text-[11px] sm:tracking-[0.12em]">
              <span className="led-dot" aria-hidden />
              {/* No celular o texto inteiro passava da borda do cartao. */}
              <span className="sm:hidden">Lançamento · até {plan.launchUntil}</span>
              <span className="hidden sm:inline">Preço de lançamento · até {plan.launchUntil}</span>
            </span>
          )}
        </h3>
        <p className="mt-1 text-sm text-white/45">{plan.subtitle}</p>
      </div>

      <div className="flex flex-1 flex-col justify-between px-6 pb-7 pt-5 sm:px-7 laptop:px-6 laptop:pb-6">
      <div>

        {/* Desconto EXPLICITO, pedido do usuario: antes era uma linha de
            texto pequena e apagada (text-xs text-white/40) — "de/por" batido
            no olho so se a pessoa parasse pra ler. Agora sao duas pistas
            visuais fortes lado a lado com o preco grande: o selo solido
            (mesma superficie de maximo contraste da pilula "Mais popular",
            a unica cor "forte" que o sistema monocromatico permite) E o
            preco antigo riscado — a leitura "de X por Y" fica clara so de
            bater o olho, sem precisar ler a frase toda. */}
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
          <div className="flex items-baseline gap-1.5">
            <Price
              value={plan.price}
              className="font-mono text-4xl font-semibold tracking-tight text-[#FAFAFA] sm:text-5xl laptop:text-[2.625rem]"
            />
            <span className="text-sm text-white/45">{plan.period}</span>
          </div>
          {/* shadow: mesmo halo suave dos CTAs solidos do site (Hero,
              "Quero ser notificado!"...) — pedido do usuario pra deixar o
              selo "levemente" mais apelativo, sem sair do preto-e-branco. */}
          {plan.discountPercent && (
            <span className="inline-flex shrink-0 items-center rounded-full bg-[#FAFAFA] px-2.5 py-1 text-xs font-bold tracking-tight text-ink-950 shadow-[0_6px_18px_-6px_rgba(255,255,255,0.55)]">
              {plan.discountPercent}
            </span>
          )}
        </div>
        {plan.afterPrice && (
          <p className="mt-2 text-xs leading-relaxed text-white/55">{plan.afterPrice}</p>
        )}
        {plan.normalPrice && (
          <p className="mt-2 flex items-center gap-1.5 text-xs leading-relaxed text-white/40">
            <span className="font-mono text-white/40 line-through">
              {plan.normalPrice}
            </span>
            {plan.anchorLabel}
          </p>
        )}

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
          // Rota de servidor, nao pagina: ela cria a cobranca no Mercado Pago
          // e responde com um redirecionamento pro checkout de la (ver
          // app/api/checkout/*/route.ts). Continua sendo um <a> comum de
          // proposito — sem fetch nem estado de carregando, o navegador
          // mostra o proprio indicador de navegacao e o link segue
          // funcionando com "abrir em nova aba".
          href={`/api/checkout/${plan.id}`}
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
          // Anual volta a ser BRANCO SOLIDO (pedido do usuario, 28/09/2026).
          // Ele tinha virado contorno pra nao disputar com o "Baixar gratis",
          // mas hoje download e planos sao telas separadas — os dois nunca
          // aparecem juntos.
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
            {plan.id === "mensal" ? "Assinar Mensal" : "Assinar Anual"}
          </span>
        </a>

        <p className="mt-3 text-center text-xs text-white/40">{plan.note}</p>
      </div>
      </div>
      </TechFrame>

      {plan.highlighted && (
        <span className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#FAFAFA] px-3.5 py-1 text-xs font-semibold text-ink-950">
          Mais popular
        </span>
      )}
    </div>
  );
}

export default function Pricing() {
  const reduce = useReducedMotionSafe();
  const skipEntrance = useSkipEntrance();
  // Ver o comentario do fundo, mais abaixo: decide entre o shader WebGL e o
  // degrade estatico que faz as vezes dele.
  const lowPower = useLowPowerDevice();
  const [mensalHovered, setMensalHovered] = React.useState(false);
  const launch = useLaunchPromo();
  const plans = getPlans(launch);

  // Qual das duas telas da secao aparece (ver o bloco #precos no JSX).
  // Comeca no download; `/#precos` abre direto nos planos — e o link que o
  // app usa pra mandar quem ficou sem credito, e o do "Precos" do menu e do
  // rodape. O clique e ouvido na CAPTURA porque o Lenis (smooth-scroll.tsx)
  // intercepta os links de ancora e rola sem mudar o hash, entao so o
  // `hashchange` nao pegaria o clique no menu.
  const [view, setView] = React.useState<"download" | "planos">("download");
  React.useEffect(() => {
    const fromHash = () => {
      if (window.location.hash === "#precos") setView("planos");
    };
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement | null)?.closest?.("a");
      const href = a?.getAttribute("href");
      if (href === "#precos" || href === "/#precos") setView("planos");
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("hashchange", fromHash);
      document.removeEventListener("click", onClick, true);
    };
  }, []);
  // Troca de tela pelos BOTOES (Planos / Download) em duas etapas, pra ser
  // suave (pedido do usuario, 28/09/2026): a tela atual apaga (FADE_OUT_MS),
  // e so entao `view` troca e a nova acende subindo de leve. Antes as duas
  // trocavam no mesmo frame, com um salto seco. A troca pela ancora #precos
  // (menu/rodape/app) continua instantanea: ali a pagina ja esta rolando ate
  // a secao, e ninguem ve a troca acontecer.
  const FADE_OUT_MS = 260;
  const [fading, setFading] = React.useState(false);
  const fadeTimer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  React.useEffect(() => () => clearTimeout(fadeTimer.current), []);
  const switchView = (next: "download" | "planos") => {
    if (next === view || fading) return;
    if (reduce) {
      setView(next);
      return;
    }
    setFading(true);
    fadeTimer.current = setTimeout(() => {
      setView(next);
      setFading(false);
    }, FADE_OUT_MS);
  };

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
      // #download e a secao inteira (CTAs do Header/Hero). #precos continua
      // existindo, so que no bloco dos PLANOS mais abaixo: o app manda quem
      // ficou sem credito pra `/#precos`, e esse link tem que cair direto
      // nos planos, nao no botao de download.
      id="download"
      // laptop:* (ver tailwind.config.ts): tela de desktop, mas baixa. O
      // rodape ja e curto (pb-9/10), entao o que cede aqui e o topo, o bloco
      // do titulo e a altura minima dos dois cartoes.
      className="relative overflow-hidden border-t border-white/[0.07] bg-ink-950 px-6 pb-9 pt-20 sm:pb-10 sm:pt-28 lg:px-10 laptop:pt-16 wide:px-16"
    >
      {/* linha divisoria: mesmo brilho estatico (sem animacao) das outras
          secoes — ver Showcase.tsx/Roadmap.tsx/Testimonials.tsx. Fica por
          cima do border-t solido do <section>, que continua ali por baixo. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent"
      />
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

      <motion.div
        className="relative mx-auto max-w-6xl wide:max-w-shell"
        initial={false}
        animate={fading ? { opacity: 0, y: 6, filter: "blur(4px)" } : { opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={
          fading
            ? { duration: FADE_OUT_MS / 1000, ease: "easeIn" }
            : { duration: 0.55, ease: EASE }
        }
      >
        {view === "download" && (
          <>
            <DownloadHero skipEntrance={skipEntrance} />
            <DownloadHighlights onShowPlans={() => switchView("planos")} />
          </>
        )}

        <motion.div
          initial={skipEntrance ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className={cn("mx-auto max-w-2xl text-center", view !== "planos" && "hidden")}
        >
          {/* Titulo e descricao acompanham a tela ativa (pedido do
              usuario): no download, o texto novo; nos planos, o texto que a
              secao tinha antes de virar "Baixe o Jarvis". */}
          <SectionEyebrow>{view === "download" ? "Download" : "Preços"}</SectionEyebrow>
          {/* Fonte fluida: trava em 48px pouco antes dos 640px, entao o
              resultado bate com o antigo sm:text-5xl sem precisar do degrau
              (que e o que causava estouro logo apos o breakpoint). */}
          {/* Mesma formula de fonte de Roadmap.tsx ("Próximas atualizações")
              — ver comentario identico em Showcase.tsx. "Escolha como quer
              usar." (23 caracteres) estourava a caixa em telas estreitas
              nesse tamanho (medido: ate 44px de overflow a 414px) — encurtado
              pra caber igual aos demais. */}
          {/* wrapper mx-auto w-fit (nao mais inline-block, ver correcao
              identica em Organization.tsx): encolhe pra largura do texto,
              entao a linha (w-full deste wrapper) casa com a frase do
              titulo em qualquer largura, sem virar inline (o que deixava o
              titulo na mesma linha do rotulo em telas largas). */}
          <div className="mx-auto w-fit">
            <h2 className="mt-5 whitespace-nowrap leading-tight text-[length:clamp(0.9rem,calc(10.22vw_-_5.52px),3rem)] font-semibold tracking-[-0.02em] text-[#FAFAFA] laptop:text-[2.625rem]">
              {view === "download" ? "Baixe o Jarvis agora" : "Escolha seu plano"}
            </h2>
            <div aria-hidden className="mt-2 h-px w-full bg-gradient-to-r from-transparent via-white/25 to-transparent laptop:mt-1.5" />
          </div>
          <p className="mx-auto mt-3 max-w-[56ch] text-lg font-light leading-relaxed text-white/55 laptop:mt-2">
            {view === "download"
              ? "Comece de graça. Depois, escolha como quer continuar."
              : "O Jarvis completo nos dois planos. Só muda a forma de pagar."}
          </p>
        </motion.div>

        {/* DUAS TELAS NO MESMO LUGAR (pedido do usuario, 25/09/2026): o
            download e a tela padrao; o botao "Planos" logo abaixo troca ela
            pelos cartoes de plano, e ai o mesmo botao vira "Download" e
            desfaz a troca. Antes os dois ficavam empilhados, com uma
            divisoria "Depois do teste" no meio.
            As duas telas ficam SEMPRE montadas e a inativa so ganha `hidden`
            (em vez de desmontar): o carrossel de planos do celular mede a
            propria largura com um ResizeObserver que so e ligado na montagem
            da secao (ver viewportRef, mais acima). Desmontado no primeiro
            render, ele nunca mediria nada e a tira nao arrastaria; escondido,
            o observador pega a largura real assim que a tela aparece.
            A ancora #precos mora neste bloco (ver o comentario do <section>
            e o useEffect de `view`): quem chega por ela cai na tela de
            planos. */}
        {/* O download mora em DownloadHero (acima); aqui so ficam os planos.
            O bloco continua sempre montado (so o de dentro ganha `hidden`)
            por causa da ancora #precos e do ResizeObserver do carrossel. */}
        <div
          id="precos"
          className={cn("mx-auto max-w-[970px]", view === "planos" && "mt-10 laptop:mt-8")}
        >
          <motion.div
            initial={skipEntrance ? false : { opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.65, ease: EASE }}
          >
            <motion.div
              initial={false}
              animate={view === "planos" ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
              transition={{ duration: reduce ? 0 : 0.45, ease: EASE }}
              className={cn(view !== "planos" && "hidden")}
              aria-hidden={view !== "planos" || undefined}
            >
            {/* Alternador so no mobile: os dois cartoes nao cabem lado a lado num
                celular. Continua UM cartao por vez, com dois botoes por cima pra
                trocar — so que agora "trocar" e a MESMA tira arrastavel do
                carrossel logo abaixo (ver `snapTo`/useEffect, mais acima):
                clicar em "Anual" desliza a tira ate la, em vez de so re-renderizar
                o cartao ativo na hora. Some em sm+, onde os dois cartoes voltam a
                aparecer lado a lado no grid. Ativo = "selo branco" (mesmo padrao
                de selecao do resto do site). */}
            <div className="mx-auto flex w-full max-w-[320px] gap-1 rounded-full border border-white/10 bg-ink-900 p-1 sm:hidden">
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

            <div>
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
                initial={skipEntrance ? false : { opacity: 0, y: 18 }}
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
                    acontece.
                    -mb-3 + pb-3: mesma coisa embaixo — o brilho do traco da
                    moldura HUD (drop-shadow do SVG em tech-frame.tsx) vaza uns
                    pixels pra fora do cartao, e sem folga era cortado seco. */}
                <div
                  ref={viewportRef}
                  className="-mx-6 -mb-3 -mt-3 overflow-hidden px-6 pb-3 pt-3"
                >
                  <motion.div
                    drag={isMobileCarousel ? "x" : false}
                    dragConstraints={{ left: minX, right: 0 }}
                    dragElastic={0.15}
                    dragMomentum={false}
                    onDragEnd={handleDragEnd}
                    style={{ x }}
                    className="flex cursor-grab items-start gap-4 will-change-transform active:cursor-grabbing"
                  >
                    {plans.map((plan, i) => (
                      // 1.25rem = 20px = SLIDE_INSET, o mesmo numero de
                      // Features.tsx/Organization.tsx — e dai que sai o cartao
                      // do mesmo tamanho nas tres secoes.
                      <div key={plan.id} className="w-[calc(100%-1.25rem)] shrink-0">
                        <PlanCard
                          plan={plan}
                          isPeeking={i !== activeIndex}
                          inCarousel
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
              <div className="hidden gap-4 sm:grid sm:grid-cols-2">
                {plans.map((plan, i) => (
                  <motion.div
                    key={plan.id}
                    initial={skipEntrance ? false : { opacity: 0, y: 22 }}
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
              initial={false}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.5, delay: reduce ? 0 : 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="mt-6 flex translate-y-3 items-center justify-center gap-2 text-center text-xs text-white/55 sm:text-sm"
            >
              <ShieldCheck size={16} weight="light" className="shrink-0" aria-hidden />
              {/* O canal do reembolso precisa aparecer AQUI, antes da compra: o
                  art. 49 do CDC da 7 dias de arrependimento em compra pela
                  internet, e a informacao de COMO exercer esse direito nao pode
                  viver so no e-mail que chega depois de pagar. Falta ainda fixar o
                  PRAZO de estorno — quando decidir, escrever aqui e nos Termos. */}
              Garantia de 7 dias: não gostou, devolvemos 100% — é só pedir em suporte@estuscorporation.com.br.
            </motion.p>
            </motion.div>
          </motion.div>

          {/* O botao que alterna as duas telas. Fica no lugar da antiga
              divisoria "Depois do teste" e herda a gramatica dela (filete,
              rotulo, filete), so que o rotulo virou uma pilula clicavel.
              Contorno, nao fundo branco: nas duas telas ja existe um CTA
              solido (o "Baixar gratis" ou o "Mais popular"/precos), e este e
              navegacao, nao compra. */}
          <div
            className={cn(
              "mt-14 flex items-center gap-4 laptop:mt-10",
              view === "download" && "hidden"
            )}
          >
            <span aria-hidden className="h-px flex-1 bg-gradient-to-r from-transparent to-white/20" />
            <button
              type="button"
              onClick={() => switchView(view === "download" ? "planos" : "download")}
              aria-controls="precos"
              className="flex shrink-0 items-center gap-2 rounded-full border border-white/20 bg-ink-900 px-6 py-2.5 font-display text-xs font-semibold uppercase tracking-[0.22em] text-white/75 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-white/45 hover:text-white active:translate-y-0 active:scale-[0.97]"
            >
              {view === "download" ? (
                <>
                  <Tag size={15} weight="bold" aria-hidden />
                  Planos
                </>
              ) : (
                <>
                  <DownloadSimple size={15} weight="bold" aria-hidden />
                  Download
                </>
              )}
            </button>
            <span aria-hidden className="h-px flex-1 bg-gradient-to-l from-transparent to-white/20" />
          </div>
        </div>
      </motion.div>
    </section>
  );
}
