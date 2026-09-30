"use client";

import React, { useEffect, useId, useRef, useState } from "react";

// MOLDURA HUD (TechFrame) — portada de `TechBackdrop.tsx` no Project-Jarvis,
// onde e a moldura do card de criacao de tarefa (TaskModal), do de confirmacao
// e dos cards de Setup/Termos. A geometria e os numeros sao os MESMOS de la
// (variante `outer`): o cartao da landing tem que ler como o card do app, nao
// como uma releitura dele.
//
// Contorno com os 4 cantos chanfrados MAIS degraus (a borda recua pra dentro
// num trecho do topo, dois do rodape e um de cada lateral), linha secundaria
// acompanhando por dentro, e uma mascara que deixa o traco forte so perto dos
// cantos e bem sutil no meio dos lados.
//
// A borda sao TRACOS de SVG, nunca uma forma preenchida por baixo do conteudo,
// e o conteudo e recortado pelo MESMO poligono (clip-path em px vindo do mesmo
// buildFrame) — uma geometria so, usada duas vezes, entao nunca sobra borda
// desalinhada. Antes do ResizeObserver medir (e no HTML do servidor), o corte
// cai no octogono simples de `octagonClip`, que ja tem os mesmos cantos.

export function octagonClip(cut: number) {
  const c = `${Math.max(cut, 0)}px`;
  return `polygon(${c} 0, calc(100% - ${c}) 0, 100% ${c}, 100% calc(100% - ${c}), calc(100% - ${c}) 100%, ${c} 100%, 0 calc(100% - ${c}), 0 ${c})`;
}

type Pt = [number, number];

// cut = chanfro dos 4 cantos; step = quanto a borda recua num degrau;
// gap = distancia da 2a linha. Valores da variante `outer` do app.
const SPEC = { cut: 24, step: 9, gap: 7, w1: 2.2, w2: 1.2, glow: 0.45 };
export const FRAME_CUT = SPEC.cut;

// Contorno completo (horario). Os degraus sao ancorados em PIXELS a partir de
// cada canto, entao tem o mesmo tamanho num cartao largo ou estreito, e somem
// quando nao cabem em vez de se cruzarem. `inset` empurra o contorno inteiro
// pra dentro — e assim que a 2a linha acompanha a 1a.
function buildFrame(w: number, h: number, inset = 0) {
  const x0 = inset, y0 = inset, x1 = w - inset, y1 = h - inset;
  const cut = Math.max(SPEC.cut - inset, 4);
  const st = SPEC.step;
  const pts: Pt[] = [];
  const fits = (a: number, b: number) => Math.abs(b - a) > st * 2 + 8;

  // topo: um degrau so, perto do canto esquerdo
  pts.push([x0 + cut, y0]);
  const [ta, tb] = [x0 + cut + 54, x0 + cut + 150];
  if (fits(ta, tb) && tb < x1 - cut) {
    pts.push([ta, y0], [ta + st, y0 + st], [tb - st, y0 + st], [tb, y0]);
  }
  pts.push([x1 - cut, y0], [x1, y0 + cut]);

  // lateral direita
  const ra = y0 + cut + 40, rb = y1 - cut - 40;
  if (fits(ra, rb)) {
    pts.push([x1, ra], [x1 - st, ra + st], [x1 - st, rb - st], [x1, rb]);
  }
  pts.push([x1, y1 - cut], [x1 - cut, y1]);

  // rodape: dois degraus. No app o card mais estreito tem 560px e os dois
  // nunca se encontram; aqui o cartao do celular tem ~340px, e ai o da
  // esquerda comecava DENTRO do da direita e o contorno se cruzava (virava um
  // triangulo no meio do rodape). `edge` guarda onde o degrau anterior
  // terminou, e o seguinte so entra se sobrar vao reto entre os dois.
  const botDips: [number, number][] = [
    [x1 - cut - 40, x1 - cut - 150],
    [x0 + cut + 150, x0 + cut + 40],
  ];
  let edge = x1 - cut;
  for (const [r, l] of botDips) {
    if (!fits(l, r) || l <= x0 + cut || r > edge - st * 2) continue;
    pts.push([r, y1], [r - st, y1 - st], [l + st, y1 - st], [l, y1]);
    edge = l;
  }
  pts.push([x0 + cut, y1], [x0, y1 - cut]);

  // lateral esquerda
  const lb = y1 - cut - 40, lt = y0 + cut + 40;
  if (fits(lt, lb)) {
    pts.push([x0, lb], [x0 + st, lb - st], [x0 + st, lt + st], [x0, lt]);
  }
  pts.push([x0, y0 + cut]);

  return pts;
}

const toPath = (pts: Pt[]) =>
  pts.map(([x, y], i) => `${i ? "L" : "M"}${x},${y}`).join(" ") + " Z";
const toPoly = (pts: Pt[]) =>
  `polygon(${pts.map(([x, y]) => `${x}px ${y}px`).join(", ")})`;

// ESPACAMENTO INTERNO (pedido do usuario em 25/09/2026): o conteudo nao
// encosta mais na moldura — fica `PAD` px pra dentro de todas as bordas, num
// painel com o proprio chanfro. 12px passa dos degraus (9px de fundo) e da
// linha secundaria (7px), entao nenhum dos dois morde o conteudo. O chanfro
// do painel e o da moldura recuado `PAD` px: num corte de 45 graus isso
// encolhe a perna em PAD*(2 - raiz de 2), e os dois cortes ficam paralelos.
const PAD = 12;
const INNER_CUT = Math.round(SPEC.cut - PAD * (2 - Math.SQRT2));

export function TechFrame({
  children,
  className,
  innerClassName,
  innerStyle,
  contentClassName,
}: {
  children: React.ReactNode;
  className?: string;
  // Classes/estilo do miolo recortado pela moldura (o fundo que aparece no
  // vao de PAD px, e a sombra interna). Ficam no elemento que recebe o
  // clip-path, porque clip-path so recorta o box-shadow do PROPRIO elemento.
  innerClassName?: string;
  innerStyle?: React.CSSProperties;
  // Classes do painel de conteudo, ja recuado do vao (layout, fundo, min-h).
  contentClassName?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const uid = useId().replace(/:/g, "");
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize((prev) =>
        prev.w === width && prev.h === height ? prev : { w: width, h: height }
      );
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { w, h } = size;
  const ready = w > 20 && h > 20;
  const outline = ready ? buildFrame(w, h) : null;
  const second = ready ? buildFrame(w, h, SPEC.gap) : null;
  const clip = outline ? toPoly(outline) : octagonClip(SPEC.cut);
  // Mesmo raio da mascara de cantos do app: brilho forte num circulo em volta
  // de cada canto, apagando em direcao ao meio de cada lado.
  const maskR = Math.min(120, Math.max(w, h) * 0.19);

  return (
    <div ref={wrapRef} className={className} style={{ position: "relative" }}>
      <div
        className={innerClassName}
        style={{ ...innerStyle, padding: PAD, clipPath: clip, WebkitClipPath: clip }}
      >
        <div
          className={contentClassName}
          style={{ clipPath: octagonClip(INNER_CUT), WebkitClipPath: octagonClip(INNER_CUT) }}
        >
          {children}
        </div>
      </div>

      {outline && second && (
        <svg
          aria-hidden
          width={w}
          height={h}
          viewBox={`0 0 ${w} ${h}`}
          className="pointer-events-none absolute inset-0 overflow-visible"
          style={{ filter: `drop-shadow(0 0 4px rgba(255,255,255,${SPEC.glow}))` }}
        >
          <defs>
            <radialGradient id={`cg${uid}`}>
              <stop offset="0%" stopColor="#fff" stopOpacity="1" />
              <stop offset="35%" stopColor="#fff" stopOpacity="1" />
              <stop offset="100%" stopColor="#fff" stopOpacity="0" />
            </radialGradient>
            <mask
              id={`cm${uid}`}
              maskUnits="userSpaceOnUse"
              x={-24}
              y={-24}
              width={w + 48}
              height={h + 48}
            >
              <rect x={-24} y={-24} width={w + 48} height={h + 48} fill="#000" />
              {([[0, 0], [w, 0], [0, h], [w, h]] as const).map(([cx, cy], i) => (
                <circle key={i} cx={cx} cy={cy} r={maskR} fill={`url(#cg${uid})`} />
              ))}
            </mask>
          </defs>

          {/* cada linha duas vezes: fraca na volta inteira, forte por cima
              recortada pela mascara de cantos */}
          <path d={toPath(second)} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={SPEC.w2} />
          <path d={toPath(second)} fill="none" stroke="rgba(255,255,255,0.24)" strokeWidth={SPEC.w2} mask={`url(#cm${uid})`} />
          <path d={toPath(outline)} fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth={SPEC.w1} strokeLinejoin="miter" />
          <path d={toPath(outline)} fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth={SPEC.w1} strokeLinejoin="miter" mask={`url(#cm${uid})`} />

          {/* colchete duplo perto do canto superior direito — so quando o
              cartao e largo o bastante pra ele nao encostar no degrau do topo */}
          {w > SPEC.cut * 2 + 360 && (
            <g stroke="rgba(255,255,255,0.5)" strokeWidth="1.3" fill="none">
              <path d={`M${w - SPEC.cut - 168},7 L${w - SPEC.cut - 168},3 L${w - SPEC.cut - 128},3`} />
              <path d={`M${w - SPEC.cut - 122},3 L${w - SPEC.cut - 104},3`} />
            </g>
          )}
        </svg>
      )}
    </div>
  );
}
