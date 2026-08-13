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
//  - navegacao ancorada (#recursos, #precos...) passa a ser suave via Lenis,
//    com um recuo pra nao ficar escondida atras do header fixo.
import React, { useEffect, useState } from "react";
import { ReactLenis, useLenis } from "lenis/react";
import { useLowPowerDevice } from "@/components/ui/use-low-power";
// CSS que o Lenis precisa (height:auto no html/body, desliga scroll-behavior
// nativo enquanto ele roda, trata [data-lenis-prevent] etc.).
import "lenis/dist/lenis.css";

// Recuo do topo pra ancora nao parar embaixo do header flutuante (que vive em
// top-5 e tem ~64px de altura).
const ANCHOR_OFFSET = -96;

// Intercepta cliques em links de ancora e delega pro Lenis, pra o salto ser
// suave (senao o browser pularia seco, ignorando a inercia do Lenis).
function AnchorSmoothing() {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;
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
  }, [lenis]);

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

  if (!enabled || lowPower) return <>{children}</>;

  return (
    <ReactLenis root options={{ lerp: 0.1, smoothWheel: true }}>
      <AnchorSmoothing />
      {children}
    </ReactLenis>
  );
}
