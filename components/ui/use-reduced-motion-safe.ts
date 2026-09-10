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

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Diz se as animacoes de ENTRADA (`initial={...}` + `whileInView`) devem ser
 * puladas — ou seja, se a secao ja deve nascer visivel.
 *
 * Existe por causa de um bug real: com `whileInView` + `once: true`, uma secao
 * so anima quando entra no viewport. Quando a pagina abre DIRETO numa ancora
 * (`/#precos`, `/#formulario`), o navegador pula pra la e as secoes que
 * ficaram pra tras nunca chegam a ser intersectadas — ficam em `opacity: 0`
 * ate a pessoa rolar por cima delas. O mesmo acontece em modo `low-power`,
 * onde o Lenis fica inerte e o scroll vira nativo.
 *
 * Isso era cosmetico enquanto ancora era so navegacao interna. Deixou de ser
 * quando o app passou a mandar o usuario sem credito direto pra `/#precos`:
 * a primeira coisa que ele ve ao clicar em "Recarregar" nao pode ser meia
 * pagina em branco.
 *
 * Nao da pra reaproveitar `useReducedMotionSafe` pra isso: `reduce` tambem
 * governa loops, parallax e movimento ambiente, e desligar tudo isso so
 * porque alguem chegou por uma ancora seria pior que o bug. Pelo mesmo motivo
 * so as animacoes de SCROLL (`whileInView`) usam este hook — as de mount
 * (`animate`, AnimatePresence) nunca sofreram o problema e continuam no
 * `reduce`.
 *
 * O valor e lido no MOUNT (nao no render do servidor) pelo mesmo motivo que o
 * hook acima: `window.location.hash` nao existe no servidor, e ler isso no
 * primeiro render faria o HTML dos dois lados divergir e quebrar a hidratacao.
 * Por isso comeca `false` e so vira `true` depois — que e a ordem segura: a
 * animacao de entrada e cancelada, nunca "des-cancelada".
 */
export function useSkipEntrance(): boolean {
  const reduce = useReducedMotionSafe();
  const [skip, setSkip] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const temAncora = window.location.hash.length > 1;
    const lowPower = document.documentElement.classList.contains("low-power");
    if (temAncora || lowPower) setSkip(true);
  }, []);

  return reduce || skip;
}
