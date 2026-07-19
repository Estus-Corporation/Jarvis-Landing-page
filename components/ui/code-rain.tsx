"use client";

import { useEffect, useRef } from "react";

// Chuva de codigo atras do hero.
//
// Os glifos vem de comandos que o Jarvis de fato executa (git, pwsh, spotify,
// code .), nao de katakana. O efeito continua sendo "codigo caindo", mas fala
// do produto em vez de citar um filme.
const SOURCE =
  "git pull origin main  pwsh -c  code .  spotify next  explorer  npm run dev  $env:PATH  {} () => []  0123456789  clone  commit  play  pause  open  close  jarvis";
const GLYPHS = Array.from(new Set(SOURCE.replace(/\s+/g, "").split("")));

const FONT_SIZE = 13;
const COLUMN_WIDTH = FONT_SIZE * 1.15;
const FRAME_MS = 55; // ~18fps. Chuva nao precisa de 60, e economiza bateria.

export default function CodeRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = 0;
    let height = 0;
    let columns: number[] = [];
    let frame = 0;
    let lastDraw = 0;
    let visible = true;

    const setup = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (!rect) return;
      // DPR travado em 1.5: acima disso o custo de preenchimento sobe sem
      // ganho visivel, porque os glifos ja sao translucidos.
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.font = `${FONT_SIZE}px ui-monospace, monospace`;
      ctx.textBaseline = "top";

      const count = Math.ceil(width / COLUMN_WIDTH);
      columns = Array.from({ length: count }, () =>
        Math.floor((Math.random() * -height) / FONT_SIZE)
      );
      ctx.clearRect(0, 0, width, height);
    };

    const glyph = () => GLYPHS[(Math.random() * GLYPHS.length) | 0];

    const paint = () => {
      // Retangulo quase transparente por cima: e o que deixa o rastro decaindo
      // atras de cada gota, sem precisar guardar historico.
      ctx.fillStyle = "rgba(10, 10, 11, 0.075)";
      ctx.fillRect(0, 0, width, height);

      for (let i = 0; i < columns.length; i++) {
        const x = i * COLUMN_WIDTH;
        const y = columns[i] * FONT_SIZE;

        ctx.fillStyle = "rgba(250, 250, 250, 0.62)";
        ctx.fillText(glyph(), x, y);

        if (y > height && Math.random() > 0.982) columns[i] = 0;
        else columns[i]++;
      }
    };

    // Movimento reduzido: um unico quadro esparso, sem loop.
    if (reduce) {
      setup();
      ctx.fillStyle = "rgba(250, 250, 250, 0.16)";
      for (let i = 0; i < columns.length; i += 2) {
        for (let r = 0; r < height / FONT_SIZE; r += 5) {
          ctx.fillText(glyph(), i * COLUMN_WIDTH, r * FONT_SIZE);
        }
      }
      return;
    }

    const tick = (ts: number) => {
      frame = requestAnimationFrame(tick);
      if (!visible || ts - lastDraw < FRAME_MS) return;
      lastDraw = ts;
      paint();
    };

    setup();
    frame = requestAnimationFrame(tick);

    // Fora da tela ou aba em segundo plano: para de desenhar.
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting && !document.hidden;
      },
      { threshold: 0 }
    );
    observer.observe(canvas);

    const onVisibility = () => {
      visible = !document.hidden;
    };
    document.addEventListener("visibilitychange", onVisibility);

    const resizeObserver = new ResizeObserver(setup);
    if (canvas.parentElement) resizeObserver.observe(canvas.parentElement);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <canvas
        ref={canvasRef}
        aria-hidden
        className="h-full w-full opacity-[0.55]"
        style={{
          // Mascara dupla: a chuva some no topo, no rodape e no centro, onde
          // ficam o titulo e a esfera. Legibilidade ganha da textura.
          maskImage:
            "radial-gradient(ellipse 78% 62% at 50% 50%, transparent 18%, black 78%), linear-gradient(to bottom, transparent, black 14%, black 74%, transparent)",
          WebkitMaskImage:
            "radial-gradient(ellipse 78% 62% at 50% 50%, transparent 18%, black 78%), linear-gradient(to bottom, transparent, black 14%, black 74%, transparent)",
          maskComposite: "intersect",
          WebkitMaskComposite: "source-in",
        }}
      />
    </div>
  );
}
