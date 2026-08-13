"use client";

// "Esta maquina aguenta os enfeites?" — um sinal SO, compartilhado por todo
// mundo que custa caro (Lenis, TracingBeam, PrismaticBurst...), pra a pagina
// degradar de forma coerente em vez de cada componente adivinhar sozinho.
//
// Por que nao so `prefers-reduced-motion`: aquilo e uma PREFERENCIA que o
// visitante liga no sistema. Ninguem com um notebook fraco liga isso — a
// pessoa so abre o site e acha que "travou". Sao dois eixos diferentes, e por
// isso os dois convivem: reduced-motion continua desligando animacao por
// escolha, isto aqui desliga por CAPACIDADE.
//
// A deteccao tem duas partes, porque nenhuma das duas sozinha resolve:
//
//  1) Palpite estatico (cores de CPU / RAM), instantaneo, ja no primeiro
//     frame. Pega os aparelhos reconhecidamente fracos sem custo nenhum, mas
//     e cego pra GPU — e o que mais pesa aqui e justamente GPU (shader da
//     secao de Precos, backdrop-blur, compositing). Um notebook com CPU
//     decente e video integrado passa batido.
//
//  2) Medicao real de FPS, que fecha exatamente esse buraco: conta frames de
//     verdade por ~1s e, se a maquina nao esta sustentando um ritmo
//     aceitavel, promove pra "fraca". So ESCALA (false -> true), nunca volta
//     atras, pra a pagina nao ficar ligando e desligando efeito no meio da
//     rolagem.
//
// O estado vive no MODULO, nao no hook. Sao tres componentes consultando isto
// (e podem virar mais), e um estado por componente daria tres medicoes de FPS
// rodando ao mesmo tempo — desperdicio no exato momento em que a pagina esta
// mais ocupada, e ainda por cima com risco de chegarem a respostas
// diferentes. Aqui a medicao acontece UMA vez, na primeira vez que alguem
// pergunta, e o resultado e transmitido pra todos os interessados.
import { useEffect, useState } from "react";

// Abaixo disto, a experiencia ja e ruim o suficiente pra valer a pena trocar
// enfeite por fluidez. Nao e 60: um respiro abaixo de 60 e normal ate em
// maquina boa (o proprio navegador as vezes entrega 55~58), e derrubar os
// efeitos de quem esta bem seria pior que o problema.
const FPS_FLOOR = 45;

// Janela da medicao. Curta o bastante pra decidir antes de a pessoa chegar
// nas secoes pesadas, longa o bastante pra um engasgo isolado nao condenar
// uma maquina boa.
const PROBE_MS = 1000;

let isLowPower = false;
let probeStarted = false;
const listeners = new Set<(value: boolean) => void>();

// Classe no <html> alem do estado do React. Ela existe pra alcancar o que
// componente nenhum controla bem: o `backdrop-blur`, que esta espalhado por
// meia duzia de arquivos em classe do Tailwind. Desligar isso e caro de fazer
// prop por prop e barato de fazer com uma regra so de CSS (ver globals.css) —
// e backdrop-filter e dos efeitos mais pesados que existem em video
// integrado, porque o fundo atras muda a cada frame de rolagem e obriga o
// navegador a re-borrar tudo de novo, sempre.
export const LOW_POWER_CLASS = "low-power";

function markLowPower() {
  if (isLowPower) return;
  isLowPower = true;
  document.documentElement.classList.add(LOW_POWER_CLASS);
  listeners.forEach((notify) => notify(true));
}

function guessFromHardware(): boolean {
  // `?? 8`: quando o navegador nao conta (deviceMemory so existe em
  // Chromium), o certo e assumir que esta TUDO BEM. Chutar "fraca" no escuro
  // tiraria os efeitos de todo mundo no Firefox e no Safari.
  const cores = navigator.hardwareConcurrency ?? 8;
  const memory =
    (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;

  return cores <= 4 || memory <= 4;
}

function startProbe() {
  if (probeStarted) return;
  probeStarted = true;

  // Escotilha de teste: "?lowpower=1" forca o modo degradado e "?lowpower=0"
  // forca o completo. Sem isso a unica forma de conferir como o site fica
  // numa maquina fraca seria achar uma maquina fraca — e essa versao precisa
  // poder ser revisada de proposito, nao so cair na mao de quem tem azar de
  // hardware.
  const override =
    typeof location !== "undefined"
      ? new URLSearchParams(location.search).get("lowpower")
      : null;
  if (override === "1") {
    markLowPower();
    return;
  }
  if (override === "0") return;

  if (guessFromHardware()) {
    markLowPower();
    return; // ja decidido — nao gasta uma medicao pra confirmar o obvio
  }

  let frames = 0;
  let startedAt = 0;

  const tick = (now: number) => {
    // Aba escondida no meio da contagem invalida a medicao inteira: o
    // navegador congela o rAF de aba em segundo plano, entao o que sobrou da
    // janela mediria a economia de bateria do Chrome, nao a maquina. Joga
    // fora e tenta de novo quando a aba voltar.
    if (document.hidden) {
      retryWhenVisible();
      return;
    }

    if (!startedAt) startedAt = now;

    const elapsed = now - startedAt;
    if (elapsed >= PROBE_MS) {
      // `frames / elapsed` e nao `frames / PROBE_MS`: o ultimo frame quase
      // nunca cai exatamente no fim da janela, e numa maquina lenta ele pode
      // passar MUITO do prazo — dividir pelo tempo nominal inflaria o
      // resultado justo no caso que a gente quer detectar.
      if ((frames * 1000) / elapsed < FPS_FLOOR) markLowPower();
      return;
    }

    frames += 1;
    requestAnimationFrame(tick);
  };

  // Medir durante o carregamento nao diria nada: hidratacao, decode de imagem
  // e primeira pintura derrubam o FPS de qualquer maquina, e a gente
  // condenaria maquina boa por causa do proprio boot da pagina. Esperar a
  // primeira folga faz a conta cair num momento representativo.
  const begin = () => {
    frames = 0;
    startedAt = 0;
    requestAnimationFrame(tick);
  };

  const schedule = () => {
    if (window.requestIdleCallback)
      window.requestIdleCallback(begin, { timeout: 2000 });
    else window.setTimeout(begin, 1200);
  };

  // Abrir o site numa aba de segundo plano (clique do meio, "abrir em nova
  // aba") e comum, e ali NENHUMA medicao vale — sem isso, essas pessoas
  // ficariam permanentemente com a versao degradada por causa de uma conta
  // feita enquanto o navegador nem estava desenhando a pagina.
  function retryWhenVisible() {
    const onVisible = () => {
      if (document.hidden) return;
      document.removeEventListener("visibilitychange", onVisible);
      schedule();
    };
    document.addEventListener("visibilitychange", onVisible);
  }

  if (document.hidden) retryWhenVisible();
  else schedule();
}

export function useLowPowerDevice(): boolean {
  // Nasce `false` de proposito: no servidor nao da pra saber nada sobre a
  // maquina, entao o HTML tem que sair igual ao primeiro render do cliente,
  // senao a hidratacao quebra. A verdade chega logo depois de montar.
  const [lowPower, setLowPower] = useState(false);

  useEffect(() => {
    // Quem monta depois da medicao ja ter terminado pega o resultado pronto,
    // sem esperar por um aviso que nunca mais vai vir.
    if (isLowPower) {
      setLowPower(true);
      return;
    }

    listeners.add(setLowPower);
    startProbe();
    return () => {
      listeners.delete(setLowPower);
    };
  }, []);

  return lowPower;
}
