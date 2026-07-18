"use client";

// Esfera de rede geodésica do app Jarvis, adaptada para a landing page.
// Mesma malha, projeção e shading do app original (NetworkSphere + OrbRings em
// MainInterface.tsx) — só a sequência de "ignição" (big bang + som de boot) foi
// removida, já que aqui a esfera deve nascer já "online" e girando.

import { useEffect, useLayoutEffect, useRef, useState } from "react";

export type JarvisState = "idle" | "listening" | "thinking" | "working" | "speaking";

const PHI = (1 + Math.sqrt(5)) / 2;
const N = 210; // nós da malha — mesma densidade do app

const NODES = Array.from({ length: N }, (_, i) => {
  const theta = Math.acos(1 - (2 * (i + 0.5)) / N);
  const phi = (2 * Math.PI * i) / PHI;
  return {
    x: Math.sin(theta) * Math.cos(phi),
    y: Math.sin(theta) * Math.sin(phi),
    z: Math.cos(theta),
  };
});

// Malha triangulada — conecta cada nó aos vizinhos mais próximos
const EDGES: [number, number][] = [];
const EDGE_THRESH = 0.42;
for (let i = 0; i < N; i++) {
  const nn: { j: number; d: number }[] = [];
  for (let j = i + 1; j < N; j++) {
    const dx = NODES[i].x - NODES[j].x;
    const dy = NODES[i].y - NODES[j].y;
    const dz = NODES[i].z - NODES[j].z;
    const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (d < EDGE_THRESH) nn.push({ j, d });
  }
  nn
    .sort((a, b) => a.d - b.d)
    .slice(0, 6)
    .forEach(({ j }) => EDGES.push([i, j]));
}

// speed em radianos/segundo — dt-based, independente de frame-rate
const NET_CFG: Record<
  JarvisState,
  { speed: number; tilt: number; dimMax: number; brightMax: number; pulse: number }
> = {
  idle: { speed: 0.08, tilt: 0.02, dimMax: 0.38, brightMax: 0.92, pulse: 0 },
  listening: { speed: 0.55, tilt: 0.14, dimMax: 0.45, brightMax: 1.0, pulse: 0.08 },
  thinking: { speed: 0.8, tilt: 0.2, dimMax: 0.35, brightMax: 0.88, pulse: 0.05 },
  working: { speed: 0.65, tilt: 0.16, dimMax: 0.38, brightMax: 0.9, pulse: 0.06 },
  speaking: { speed: 1.1, tilt: 0.28, dimMax: 0.5, brightMax: 1.0, pulse: 0.12 },
};

function NetworkSphere({
  state,
  size = 460,
  paused = false,
  color,
}: {
  state: JarvisState;
  size?: number;
  paused?: boolean;
  color?: [number, number, number];
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glowCanvasRef = useRef<HTMLCanvasElement>(null);
  const trailCanvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef(state);
  const colorRef = useRef<[number, number, number]>(color ?? [255, 255, 255]);
  const frameRef = useRef(0);
  const prevTsRef = useRef<number>(0);
  const angleRef = useRef(0);
  const tiltRef = useRef(0);
  const speedRef = useRef(0);
  const tiltSpeedRef = useRef(0);
  const introT0Ref = useRef(-1); // timestamp do 1º frame

  useEffect(() => {
    stateRef.current = state;
  }, [state]);
  useEffect(() => {
    colorRef.current = color ?? [255, 255, 255];
  }, [color]);

  useLayoutEffect(() => {
    cancelAnimationFrame(frameRef.current);
    const dpr = window.devicePixelRatio || 1;
    for (const ref of [canvasRef, glowCanvasRef, trailCanvasRef]) {
      const canvas = ref.current;
      if (!canvas) continue;
      canvas.width = Math.round(size * dpr);
      canvas.height = Math.round(size * dpr);
      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;
      canvas.getContext("2d")!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  }, [size]);

  useEffect(() => {
    if (paused) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const glowCanvas = glowCanvasRef.current;
    if (!glowCanvas) return;
    const trailCanvas = trailCanvasRef.current;
    if (!trailCanvas) return;
    const ctx = canvas.getContext("2d")!;
    const glowCtx = glowCanvas.getContext("2d")!;
    const trailCtx = trailCanvas.getContext("2d")!;

    const cx = size / 2,
      cy = size / 2;
    const FOV = 3.0;
    const R = FOV * size * 0.44;

    const px = new Float32Array(N);
    const py = new Float32Array(N);
    const tz = new Float32Array(N);
    const rz = new Float32Array(N);
    const sh = new Float32Array(N);
    const ppx = new Float32Array(N).fill(NaN);
    const ppy = new Float32Array(N).fill(NaN);
    const ei = new Float32Array(N).fill(1);
    const br = new Float32Array(N);
    const order = Array.from({ length: N }, (_, i) => i);

    const haloSprite = document.createElement("canvas");
    const HS = 64;
    haloSprite.width = HS;
    haloSprite.height = HS;
    let spriteKey = "";
    const makeHaloSprite = (cr: number, cg: number, cb: number) => {
      const hctx = haloSprite.getContext("2d")!;
      hctx.clearRect(0, 0, HS, HS);
      const g = hctx.createRadialGradient(HS / 2, HS / 2, 0, HS / 2, HS / 2, HS / 2);
      g.addColorStop(0, `rgba(${cr},${cg},${cb},0.5)`);
      g.addColorStop(0.4, `rgba(${cr},${cg},${cb},0.12)`);
      g.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
      hctx.fillStyle = g;
      hctx.fillRect(0, 0, HS, HS);
      spriteKey = `${cr},${cg},${cb}`;
    };
    let lastDrawTs = 0;

    const LX = -0.484,
      LY = -0.591,
      LZ = 0.645;

    const animate = (ts: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      // Landing page: a esfera já nasce "ligada" — pula a ignição do app e
      // fixa Praw bem acima de 1.6 (fim de qualquer efeito de boot).
      if (introT0Ref.current < 0) introT0Ref.current = ts - 10000;

      const sinceIntro = ts - introT0Ref.current;
      const calmIdle = stateRef.current === "idle" && sinceIntro > 6000;
      const minFrame = calmIdle ? 32 : 0;
      if (minFrame > 0 && ts - lastDrawTs < minFrame) {
        frameRef.current = requestAnimationFrame(animate);
        return;
      }
      lastDrawTs = ts;

      const [cr, cg, cb] = colorRef.current;
      if (spriteKey !== `${cr},${cg},${cb}`) makeHaloSprite(cr, cg, cb);
      const rgb = (a: number) => `rgba(${cr},${cg},${cb},${Math.min(1, Math.max(0, a)).toFixed(3)})`;
      const dt = Math.min((ts - prevTsRef.current) / 1000, 0.05);
      prevTsRef.current = ts;

      const Praw = (ts - introT0Ref.current) / 4000;
      const P = Math.min(Praw, 1);
      const flash = 0;
      const rimTouch = 0;

      const s = stateRef.current;
      const c = NET_CFG[s];
      const scl = size / 460;

      const lerpK = 1 - Math.pow(0.02, dt);
      speedRef.current += (c.speed - speedRef.current) * lerpK;
      tiltSpeedRef.current += (c.tilt - tiltSpeedRef.current) * lerpK;

      const drift = 1 + 0.15 * (Math.sin(ts * 0.00048) * 0.6 + Math.sin(ts * 0.00089 + 1.7) * 0.4);
      angleRef.current += speedRef.current * drift * dt;
      tiltRef.current += tiltSpeedRef.current * dt;

      const speaking = s === "speaking";
      const talkOsc = Math.sin(ts * 0.011) * 0.6 + Math.sin(ts * 0.021) * 0.4;
      const globalPulse = c.pulse > 0 ? 1 + (speaking ? talkOsc : Math.sin(ts * 0.0038)) * c.pulse : 1;
      const breath = speaking ? 1 + talkOsc * 0.035 : 1;

      const cosA = Math.cos(angleRef.current),
        sinA = Math.sin(angleRef.current);
      const tiltA = Math.sin(tiltRef.current) * 0.3;
      const cosB = Math.cos(tiltA),
        sinB = Math.sin(tiltA);

      for (let idx = 0; idx < N; idx++) {
        const p = NODES[idx];
        const rx1 = p.x * cosA + p.z * sinA;
        const ry1 = p.y;
        const rz1 = -p.x * sinA + p.z * cosA;
        const rx2 = rx1;
        const ry2 = ry1 * cosB - rz1 * sinB;
        const rz2 = ry1 * sinB + rz1 * cosB;
        const pz = rz2 + FOV;
        px[idx] = (rx2 / pz) * R * breath + cx;
        py[idx] = (ry2 / pz) * R * breath + cy;
        tz[idx] = Math.max(0, (rz2 + 1.0) / 2.0);
        rz[idx] = rz2;
        const dot = rx2 * LX + ry2 * LY + rz2 * LZ;
        sh[idx] = 0.7 + 0.34 * (dot * 0.5 + 0.5);
        ei[idx] = 1;
      }

      ctx.clearRect(0, 0, size, size);

      const rimR = (R / FOV) * breath;

      const rimBright = 0.036 * (P * P) * (1 + flash + rimTouch);
      const rimGrad = ctx.createRadialGradient(cx, cy, rimR * 0.62, cx, cy, rimR * 1.12);
      rimGrad.addColorStop(0, rgb(0));
      rimGrad.addColorStop(0.72, rgb(rimBright * 0.18));
      rimGrad.addColorStop(0.92, rgb(rimBright));
      rimGrad.addColorStop(1, rgb(0));
      ctx.beginPath();
      ctx.arc(cx, cy, rimR * 1.12, 0, Math.PI * 2);
      ctx.fillStyle = rimGrad;
      ctx.fill();

      const nodeB = (t: number) => (0.42 + 0.58 * t) * globalPulse * (1 + flash * 0.7);
      const edgeB = (t: number) => (0.2 + 0.42 * t) * globalPulse * (1 + flash * 0.35);

      ctx.strokeStyle = rgb(1);
      ctx.lineWidth = 0.5 * scl;
      const wvRamp = 1;
      let lastAlpha = -1;
      ctx.beginPath();
      ctx.globalAlpha = 0;
      for (const [i, j] of EDGES) {
        const avgT = (tz[i] + tz[j]) * 0.5;
        if (avgT < 0.05) continue;
        const a = Math.min(edgeB(avgT) * ((sh[i] + sh[j]) * 0.5) * c.dimMax * 1.5, 0.5) * wvRamp;
        const bucket = Math.round(a / 0.02) * 0.02;
        if (bucket !== lastAlpha) {
          ctx.stroke();
          ctx.beginPath();
          ctx.globalAlpha = bucket;
          lastAlpha = bucket;
        }
        ctx.moveTo(px[i], py[i]);
        ctx.lineTo(px[j], py[j]);
      }
      ctx.stroke();
      ctx.globalAlpha = 1;

      order.sort((a, b) => rz[a] - rz[b]);

      const tw = (i: number) => 1 + 0.18 * Math.sin(ts * (0.0009 + (i % 5) * 0.00025) + i * 2.399963);

      for (let bi = 0; bi < N; bi++) br[bi] = nodeB(tz[bi]) * tw(bi) * sh[bi] * ei[bi];

      const fadeK = Math.min(0.5, Math.max(0.02, 1 - Math.pow(0.88, dt * 60)));
      trailCtx.save();
      trailCtx.globalCompositeOperation = "destination-out";
      trailCtx.fillStyle = `rgba(0,0,0,${fadeK.toFixed(4)})`;
      trailCtx.fillRect(0, 0, size, size);
      trailCtx.restore();
      trailCtx.strokeStyle = rgb(1);
      trailCtx.lineCap = "round";
      for (const idx of order) {
        const t = tz[idx];
        const x = px[idx],
          y = py[idx];
        const ox = ppx[idx],
          oy = ppy[idx];
        ppx[idx] = x;
        ppy[idx] = y;
        if (t < 0.05 || !Number.isFinite(ox)) continue;
        const d = Math.hypot(x - ox, y - oy);
        if (d < 0.3 || d > 40 * scl) continue;
        const b = br[idx];
        const speedK = Math.min(d / (5 * scl), 1);
        trailCtx.globalAlpha = Math.min(b * c.brightMax, 1) * 0.16 * speedK;
        trailCtx.lineWidth = (0.5 + b * 0.7) * scl;
        trailCtx.beginPath();
        trailCtx.moveTo(ox, oy);
        trailCtx.lineTo(x, y);
        trailCtx.stroke();
      }
      trailCtx.globalAlpha = 1;
      ctx.save();
      ctx.globalCompositeOperation = "lighter" as GlobalCompositeOperation;
      ctx.drawImage(trailCanvas, 0, 0, size, size);
      ctx.restore();

      glowCtx.clearRect(0, 0, size, size);
      for (const idx of order) {
        const t = tz[idx];
        if (t < 0.05 || ei[idx] < 0.02) continue;
        const b = br[idx];
        const dotR = (1.0 + b * 1.5) * scl;
        const hR = dotR * 4.5;
        glowCtx.globalAlpha = Math.min(b * c.brightMax, 1);
        glowCtx.drawImage(haloSprite, px[idx] - hR, py[idx] - hR, hR * 2, hR * 2);
      }
      glowCtx.globalAlpha = 1;
      ctx.save();
      ctx.globalCompositeOperation = "lighter" as GlobalCompositeOperation;
      ctx.drawImage(glowCanvas, 0, 0, size, size);
      ctx.restore();

      ctx.fillStyle = rgb(1);
      const CONC = 0.4 * Math.SQRT1_2;
      for (const idx of order) {
        const t = tz[idx];
        if (t < 0.05 || ei[idx] < 0.02) continue;
        const b = br[idx];
        const sR = (1.0 + b * 1.5) * scl * 1.7;
        const x = px[idx],
          y = py[idx];
        const q = sR * CONC;
        ctx.globalAlpha = Math.min(b * c.brightMax * 1.1, 1);
        ctx.beginPath();
        ctx.moveTo(x, y - sR);
        ctx.quadraticCurveTo(x + q, y - q, x + sR, y);
        ctx.quadraticCurveTo(x + q, y + q, x, y + sR);
        ctx.quadraticCurveTo(x - q, y + q, x - sR, y);
        ctx.quadraticCurveTo(x - q, y - q, x, y - sR);
        ctx.closePath();
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [size, paused]);

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <canvas ref={canvasRef} style={{ display: "block", position: "absolute", inset: 0 }} />
      <canvas ref={glowCanvasRef} style={{ position: "absolute", inset: 0, opacity: 0, pointerEvents: "none" }} />
      <canvas ref={trailCanvasRef} style={{ position: "absolute", inset: 0, opacity: 0, pointerEvents: "none" }} />
    </div>
  );
}

export function JarvisOrb({
  state,
  sphereSize,
  paused = false,
  color,
}: {
  state: JarvisState;
  sphereSize: number;
  paused?: boolean;
  color?: [number, number, number];
}) {
  const PAD = 72;
  const TOT = sphereSize + PAD * 2;
  const CX = TOT / 2;
  const RI = sphereSize / 2 + 6;
  const RO = sphereSize / 2 + 30;
  const [cr, cg, cb] = color ?? [255, 255, 255];
  const rgb = (a: number) => `rgba(${cr},${cg},${cb},${a.toFixed(3)})`;
  const wh = (a: number) => `rgba(255,255,255,${a.toFixed(3)})`;

  const alphaCfg: Record<JarvisState, number> = {
    idle: 0.34,
    listening: 0.8,
    thinking: 0.45,
    working: 0.58,
    speaking: 0.92,
  };
  const a = alphaCfg[state];

  const ticks = Array.from({ length: 72 }, (_, i) => {
    const ang = ((i / 72) * 360 - 90) * (Math.PI / 180);
    const long = i % 18 === 0;
    const med = i % 6 === 0;
    const r1 = RO - 1;
    const r2 = RO + (long ? 10 : med ? 6 : 3);
    return {
      x1: CX + Math.cos(ang) * r1,
      y1: CX + Math.sin(ang) * r1,
      x2: CX + Math.cos(ang) * r2,
      y2: CX + Math.sin(ang) * r2,
      long,
      med,
    };
  });

  const tri = (cxp: number, cyp: number, size: number, pointDown: boolean) => {
    const h = size * 0.87;
    if (pointDown) {
      return `${cxp - size},${cyp - h * 0.5} ${cxp + size},${cyp - h * 0.5} ${cxp},${cyp + h * 0.5}`;
    }
    return `${cxp - size},${cyp + h * 0.5} ${cxp + size},${cyp + h * 0.5} ${cxp},${cyp - h * 0.5}`;
  };

  const TOFF = RO + 18;
  const TSIZ = 5.5;

  return (
    <div style={{ position: "relative", width: TOT, height: TOT, flexShrink: 0 }}>
      <div style={{ position: "absolute", top: PAD, left: PAD }}>
        <NetworkSphere state={state} size={sphereSize} paused={paused} color={color} />
      </div>

      <svg
        width={TOT}
        height={TOT}
        style={{ position: "absolute", inset: 0, overflow: "visible", pointerEvents: "none" }}
      >
        <defs>
          <filter id="jrGlow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="2.2" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="jrGlowSoft" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="1.4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <circle cx={CX} cy={CX} r={RI} fill="none" stroke={rgb(0.92 * 0.18)} strokeWidth="0.7" />
        <circle
          cx={CX}
          cy={CX}
          r={RI}
          fill="none"
          stroke={rgb(0.92 * 0.45)}
          strokeWidth="0.9"
          filter="url(#jrGlow)"
        />

        <circle cx={CX} cy={CX} r={RO} fill="none" stroke={rgb(a * 0.14)} strokeWidth="0.6" />

        {ticks.map((t, i) => (
          <line
            key={i}
            x1={t.x1}
            y1={t.y1}
            x2={t.x2}
            y2={t.y2}
            stroke={rgb(t.long ? a * 0.8 : t.med ? a * 0.4 : a * 0.16)}
            strokeWidth={t.long ? 1.4 : t.med ? 0.8 : 0.45}
            filter={t.long ? "url(#jrGlowSoft)" : undefined}
          />
        ))}

        <polygon
          points={tri(CX, CX - TOFF, TSIZ, true)}
          fill="none"
          stroke={wh(a * 0.9)}
          strokeWidth="1.2"
          strokeLinejoin="round"
          filter="url(#jrGlow)"
        />

        <polygon
          points={tri(CX, CX + TOFF, TSIZ, false)}
          fill="none"
          stroke={wh(a * 0.9)}
          strokeWidth="1.2"
          strokeLinejoin="round"
          filter="url(#jrGlow)"
        />

        <line
          x1={CX - TOFF - TSIZ * 0.8}
          y1={CX}
          x2={CX - TOFF + TSIZ * 0.8}
          y2={CX}
          stroke={wh(a * 0.75)}
          strokeWidth="1.4"
          strokeLinecap="round"
          filter="url(#jrGlowSoft)"
        />

        <line
          x1={CX + TOFF - TSIZ * 0.8}
          y1={CX}
          x2={CX + TOFF + TSIZ * 0.8}
          y2={CX}
          stroke={wh(a * 0.75)}
          strokeWidth="1.4"
          strokeLinecap="round"
          filter="url(#jrGlowSoft)"
        />

        <circle cx={CX} cy={CX - RI} r={2.5} fill={rgb(a)} filter="url(#jrGlow)" />
      </svg>
    </div>
  );
}

// Wrapper que alterna sozinho entre os estados do Jarvis — para uso direto
// na landing page, sem precisar de um app de voz real por trás.
const DEMO_CYCLE: { state: JarvisState; duration: number }[] = [
  { state: "idle", duration: 2600 },
  { state: "listening", duration: 2400 },
  { state: "thinking", duration: 1800 },
  { state: "speaking", duration: 3200 },
];

export default function JarvisSphereDemo({
  size = 340,
  color = [255, 255, 255],
}: {
  size?: number;
  color?: [number, number, number];
}) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = setTimeout(
      () => setStep((s) => (s + 1) % DEMO_CYCLE.length),
      DEMO_CYCLE[step].duration
    );
    return () => clearTimeout(timer);
  }, [step]);

  return <JarvisOrb state={DEMO_CYCLE[step].state} sphereSize={size} color={color} />;
}
