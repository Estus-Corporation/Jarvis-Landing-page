"use client";

import { useEffect, useState } from "react";

// Mesma armadilha do useReducedMotionSafe: no SERVIDOR nao existe matchMedia,
// entao qualquer consulta de media precisa NASCER `false` e so virar o valor
// real depois de montar — senao o HTML do servidor sai diferente do primeiro
// render do cliente e a hidratacao quebra.
//
// Use isto so para o que o CSS nao resolve: props de COMPORTAMENTO (ligar o
// `drag` do motion, trocar handlers). Aparencia continua nas classes
// responsivas do Tailwind, que funcionam antes de qualquer JS rodar.
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const sync = () => setMatches(mql.matches);

    sync();
    mql.addEventListener("change", sync);
    return () => mql.removeEventListener("change", sync);
  }, [query]);

  return matches;
}
