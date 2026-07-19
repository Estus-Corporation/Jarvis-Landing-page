"use client";

import { useEffect, useRef, useState } from "react";

// JarvisOrb desenha um quadrado de (sphereSize + 144) por causa do padding dos
// aneis, entao o tamanho da esfera precisa descontar isso da largura disponivel.
const ORB_PADDING = 144;

export function useOrbSize({ min = 180, max = 460 }: { min?: number; max?: number } = {}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(min);

  useEffect(() => {
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
