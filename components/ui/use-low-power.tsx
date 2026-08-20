"use client";

// "Esta maquina aguenta os enfeites MAIS pesados?" — um sinal SO, pra Lenis,
// TracingBeam e PrismaticBurst degradarem de forma coerente em vez de cada
// um adivinhar sozinho. Deliberadamente um sinal FRACO agora: so desliga um
// punhado de coisas estruturais (ver comentario grande em cada consumidor),
// nunca a identidade visual da pagina (Hero, esfera, botoes, cartoes de
// depoimento continuam animados sempre).
//
// Por que nao so `prefers-reduced-motion`: aquilo e uma PREFERENCIA que o
// visitante liga no sistema. Ninguem com um notebook fraco liga isso — a
// pessoa so abre o site e acha que "travou". Sao dois eixos diferentes, e por
// isso os dois convivem: reduced-motion continua desligando animacao por
// escolha, isto aqui desliga por CAPACIDADE.
//
// A deteccao e SO medicao real de FPS: conta frames de verdade por ~1s e, se
// a maquina nao esta sustentando um ritmo aceitavel, promove pra "fraca". So
// ESCALA (false -> true), nunca volta atras, pra a pagina nao ficar ligando e
// desligando efeito no meio da rolagem.
//
// A medicao PARADA (antes de rolar) exige DUAS janelas ruins seguidas antes
// de condenar, nao uma so — celular potente pode dar uma leitura ruim isolada
// so por ficar parado (governor de CPU do aparelho baixa o clock depois de
// alguns segundos sem toque na tela; ja aconteceu na pratica). A medicao da
// primeira rolagem continua bastando sozinha, porque ali a leitura ruim e
// sobre uma acao real que a pessoa fez (ver comentario em startProbe).
//
// Existia tambem um palpite estatico por navigator.hardwareConcurrency/
// deviceMemory, resolvido no primeiro frame sem esperar nada — foi REMOVIDO
// depois de um falso positivo real: um notebook que "rodava super bem" caiu
// em modo fraco na hora. O suspeito principal e deviceMemory: ele reporta
// memoria DISPONIVEL pro navegador, nao a RAM nominal da maquina, e e comum
// uma maquina de 8GB com video integrado (que reserva parte da RAM pra si)
// reportar 4 — o mesmo valor que a heuristica tratava como "fraca". Cores
// baixos tem o mesmo problema: muito notebook comum, nada fraco, tem so 4
// nucleos. Sem um jeito confiavel de diferenciar "e fraca" de "so reporta
// baixo", o palpite dava falso positivo demais pra valer a pena — medir e
// mais lento (leva ~1s) mas e a verdade, nao uma adivinhacao.
//
// O estado vive no MODULO, nao no hook. Varios componentes consultam isto, e
// um estado por componente daria varias medicoes de FPS rodando ao mesmo
// tempo — desperdicio no exato momento em que a pagina esta mais ocupada, e
// ainda por cima com risco de chegarem a respostas diferentes. Aqui a
// medicao acontece UMA vez, na primeira vez que alguem pergunta, e o
// resultado e transmitido pra todos os interessados.
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

  let frames = 0;
  let startedAt = 0;
  // Conta leituras ruins da medicao PARADA (pre-rolagem). Um celular potente
  // parado alguns segundos na Hero pode dar UMA janela ruim por motivo
  // nenhum relacionado a capacidade real — o mais provavel e o governor de
  // CPU do proprio aparelho baixando o clock depois de alguns segundos sem
  // toque na tela (visto na pratica: usuario relatou celular forte caindo
  // pra modo fraco so de ficar parado na Hero). Uma leitura ruim sozinha so
  // agenda uma SEGUNDA medicao pra confirmar antes de condenar — exige duas
  // leituras ruins seguidas, nao uma. A medicao da PRIMEIRA rolagem (mais
  // abaixo) continua condenando sozinha: ali o motivo de rodar de novo e
  // testar rolagem de verdade, entao uma leitura ruim ali e informacao real
  // (a pagina engasgou durante uma acao que a pessoa de fato fez), nao um
  // soluco de maquina parada.
  let idleStrikes = 0;

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
      if ((frames * 1000) / elapsed < FPS_FLOOR) {
        idleStrikes += 1;
        if (idleStrikes >= 2) markLowPower();
        else window.setTimeout(begin, 1500);
      }
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

  // Segunda chance, na primeira rolagem. A medicao de cima acontece com a
  // pagina parada no topo, que e o momento mais pesado que existe (os canvas
  // da Hero rodando) — mas rolar acrescenta trabalho que ali nao aparece, e
  // uma maquina limitrofe pode passar parada e engasgar em movimento. Uma
  // rodada a mais e barata; ficar preso na versao pesada nao e.
  //
  // `once: true` mais o `probeStarted` la em cima garantem que isso acontece
  // no maximo uma vez: se a primeira medicao ja tiver condenado a maquina,
  // markLowPower ignora a segunda de qualquer jeito.
  window.addEventListener(
    "scroll",
    () => {
      if (isLowPower) return;
      schedule();
    },
    { once: true, passive: true }
  );

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
