"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";

// useReducedMotion() do motion devolve `null` no SERVIDOR e o valor real ja no
// PRIMEIRO render do cliente. Como o projeto usa esse valor dentro de props que
// viram estilo inline (`initial={reduce ? false : {...}}`, ranges de
// useTransform), o HTML saia diferente dos dois lados para quem tem
// "reduzir movimento" ligado:
//
//   servidor: style="opacity:0;transform:translateY(100%)"
//   cliente:  style="opacity:1;transform:none"
//
// ...e a hidratacao quebrava a pagina inteira.
//
// Este wrapper devolve SEMPRE `false` no servidor e no primeiro render do
// cliente, e so passa a devolver o valor real depois de montar. Assim os dois
// lados produzem o mesmo HTML, e a preferencia do usuario continua sendo
// respeitada logo em seguida (loops infinitos, parallax e afins sao desligados
// no efeito, que e onde eles vivem).
export function useReducedMotionSafe(): boolean {
  const reduce = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return mounted ? !!reduce : false;
}
