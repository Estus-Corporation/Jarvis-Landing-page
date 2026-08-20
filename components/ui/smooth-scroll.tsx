"use client";

// Smooth scroll global (Lenis). Adaptado do componente enviado: a demo original
// vinha com secoes coloridas de exemplo ("Scroll Please 👇") que sao so
// placeholder — o que interessa e o comportamento (ReactLenis root), que aqui
// vira um PROVEDOR envolvendo a pagina real. Assim a rolagem suave com inercia
// se aplica a todas as secoes de uma vez, dando peso premium a todas as
// animacoes de scroll que ja existem (barra de progresso, revelacoes, orbita...).
//
// Extras sobre a demo:
//  - respeita "reduzir movimento": se o visitante pede menos animacao, o Lenis
//    nao e montado e a rolagem volta a ser a nativa;
//  - navegacao ancorada (#recursos, #formulario...) passa a ser suave via
//    Lenis, com um recuo pra nao ficar escondida atras do header fixo.
import React, { useEffect, useState } from "react";
import { ReactLenis, useLenis } from "lenis/react";
import { useLowPowerDevice } from "@/components/ui/use-low-power";
// CSS que o Lenis precisa (height:auto no html/body, desliga scroll-behavior
// nativo enquanto ele roda, trata [data-lenis-prevent] etc.).
import "lenis/dist/lenis.css";

// Recuo do topo pra ancora nao parar embaixo do header flutuante (que vive em
// top-5 e tem ~60-68px de altura, top-5 incluso). Mesmo valor do
// scroll-padding-top nativo em globals.css — ver o comentario la pra
// entender por que e 90 e nao um numero redondo maior (a faixa de recursos
// fica sem vao nenhum antes da secao de Recursos, entao qualquer folga a
// mais que a altura do header revela um pedaco do texto dela).
const ANCHOR_OFFSET = -90;

// Intercepta cliques em links de ancora e delega pro Lenis, pra o salto ser
// suave (senao o browser pularia seco, ignorando a inercia do Lenis).
//
// `enabled` em vez de renderizar condicionalmente la em cima: ver o
// comentario grande no SmoothScroll — a forma da arvore aqui nao pode mudar.
function AnchorSmoothing({ enabled }: { enabled: boolean }) {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis || !enabled) return;
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey)
        return;
      const anchor = (e.target as HTMLElement)?.closest?.(
        'a[href^="#"]'
      ) as HTMLAnchorElement | null;
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || href === "#") return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target as HTMLElement, {
        offset: ANCHOR_OFFSET,
        duration: 1.1,
      });
      history.replaceState(null, "", href);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [lenis, enabled]);

  return null;
}

export default function SmoothScroll({
  children,
}: {
  children: React.ReactNode;
}) {
  // Comeca ligado (igual no SSR, pra nao dar mismatch de hidratacao) e so
  // desliga depois de montar, se o visitante pediu menos movimento.
  const [enabled, setEnabled] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setEnabled(!mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  // Em maquina fraca o Lenis vira o VILAO do que ele existe pra resolver: ele
  // troca a rolagem nativa (que o navegador toca fora da main thread, e por
  // isso continua lisa mesmo com a pagina ocupada) por uma interpolacao feita
  // em JS a cada frame. Se a main thread ja esta engasgada, cada engasgo passa
  // a aparecer TAMBEM na rolagem — e a pagina inteira da a sensacao de estar
  // presa. Devolver o scroll nativo e a maior tacada de fluidez que existe
  // aqui, e o preco (perder a inercia) e barato perto disso.
  const lowPower = useLowPowerDevice();
  const inert = !enabled || lowPower;

  // O ReactLenis fica SEMPRE montado, e quem muda sao as opcoes. A versao
  // obvia disto era `if (inert) return <>{children}</>`, e ela custava caro de
  // um jeito que nao da pra ver lendo: trocar o elemento daquela posicao de
  // <ReactLenis> pra um fragmento muda o TIPO do no, e a resposta do React a
  // isso e jogar fora a subarvore inteira e montar tudo de novo — a pagina
  // toda, todo canvas, todo observer. Medido com a CPU 4x mais lenta: um
  // unico frame de 1270ms, no meio do carregamento, exatamente em quem menos
  // pode pagar por isso. E o mesmo defeito valia pro caminho de "reduzir
  // movimento", que ja existia antes.
  //
  // autoRaf:false tira o loop de animacao do Lenis, e smoothWheel:false faz
  // ele parar de interceptar a roda — juntos deixam a rolagem nativa passar
  // direto, que e o que a gente queria desde o comeco, so que sem remontar
  // nada. As ancoras voltam a ser salto nativo, com o recuo do header vindo
  // do scroll-padding-top (globals.css).
  // useMemo pra o objeto nao nascer novo a cada render: o ReactLenis observa
  // `options` por identidade e recria a instancia do Lenis quando ela muda —
  // com um literal inline isso aconteceria em TODO render, nao so quando a
  // configuracao de fato mudasse.
  const options = React.useMemo(
    () =>
      inert
        ? { autoRaf: false, smoothWheel: false }
        : { lerp: 0.1, smoothWheel: true },
    [inert]
  );

  return (
    <ReactLenis root options={options}>
      <AnchorSmoothing enabled={!inert} />
      {children}
    </ReactLenis>
  );
}
