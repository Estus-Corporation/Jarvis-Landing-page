"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

// JarvisOrb desenha um quadrado de (sphereSize + 144) por causa do padding dos
// aneis, entao o tamanho da esfera precisa descontar isso da largura disponivel.
const ORB_PADDING = 144;

// useLayoutEffect mede antes do navegador pintar, entao a esfera ja nasce no
// tamanho certo. Com useEffect ela aparecia no minimo e so entao pulava para o
// tamanho final, um salto visivel a cada carregamento.
// No servidor useLayoutEffect avisa no console, por isso a troca condicional.
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export function useOrbSize({ min = 180, max = 460 }: { min?: number; max?: number } = {}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(min);

  useIsomorphicLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const compute = () => {
      const available = Math.min(el.clientWidth, window.innerHeight * 0.72);
      setSize(Math.round(Math.min(max, Math.max(min, available - ORB_PADDING))));
    };

    compute();
    const observer = new ResizeObserver(compute);
    observer.observe(el);
    return () => observer.disconnect();
  }, [min, max]);

  return { containerRef, size };
}
