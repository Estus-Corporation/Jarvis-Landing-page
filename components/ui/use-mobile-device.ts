"use client";

import { useEffect, useState } from "react";

// true em CELULAR e TABLET — aparelhos que nao rodam o instalador do Windows.
// Decide pelo APARELHO, nao pela largura da tela: um notebook com a janela
// estreita continua sendo um PC e tem que conseguir baixar.
//
// iPadOS 13+ se apresenta como "Macintosh" no user agent; o que o entrega e
// ter tela de toque (maxTouchPoints > 1), coisa que nenhum Mac tem.
//
// Nasce false (o HTML do servidor nao sabe qual e o aparelho) e o efeito
// corrige no cliente — no celular o botao de download troca logo depois de
// carregar.
export function useMobileDevice() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const nav = navigator as Navigator & { userAgentData?: { mobile?: boolean } };
    const ua = nav.userAgent;
    const isIpad = /Macintosh/.test(ua) && nav.maxTouchPoints > 1;
    setMobile(
      nav.userAgentData?.mobile === true ||
        /Android|iPhone|iPad|iPod|Mobile|Silk|Kindle/i.test(ua) ||
        isIpad
    );
  }, []);
  return mobile;
}
