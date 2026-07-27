"use client";

import { useEffect, useRef } from "react";

// PixelCard (React Bits) adaptado ao projeto.
//
// Mudancas em relacao ao codigo colado:
//  - `active`: MODO FIXO. O original so anima no hover/foco. Com `active`
//    definido, o efeito fica ligado o tempo todo (true) ou desligado (false),
//    sem depender do mouse. E o que se pediu para o cartao Anual.
//  - Tamanho/borda/raio saem do container pai (via className): aqui ele e uma
//    CAMADA de fundo dentro do cartao, nao o quadro 400x300 fixo do original.
//  - Cor: o uso passa uma paleta monocromatica; rosa/azul quebrariam o sistema.
//  - prefers-reduced-motion: em vez de um requestAnimationFrame eterno
//    desenhando quadros parados, desenha os pixels UMA vez e nao roda loop.

class Pixel {
  width: number;
  height: number;
  ctx: CanvasRenderingContext2D;
  x: number;
  y: number;
  color: string;
  speed: number;
  size: number;
  sizeStep: number;
  minSize: number;
  maxSizeInteger: number;
  maxSize: number;
  delay: number;
  counter: number;
  counterStep: number;
  isIdle: boolean;
  isReverse: boolean;
  isShimmer: boolean;

  constructor(
    canvas: HTMLCanvasElement,
    context: CanvasRenderingContext2D,
    x: number,
    y: number,
    color: string,
    speed: number,
    delay: number
  ) {
    this.width = canvas.width;
    this.height = canvas.height;
    this.ctx = context;
    this.x = x;
    this.y = y;
    this.color = color;
    this.speed = this.getRandomValue(0.1, 0.9) * speed;
    this.size = 0;
    this.sizeStep = Math.random() * 0.4;
    this.minSize = 0.5;
    this.maxSizeInteger = 2;
    this.maxSize = this.getRandomValue(this.minSize, this.maxSizeInteger);
    this.delay = delay;
    this.counter = 0;
    this.counterStep = Math.random() * 4 + (this.width + this.height) * 0.01;
    this.isIdle = false;
    this.isReverse = false;
    this.isShimmer = false;
  }

  getRandomValue(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  draw() {
    const centerOffset = this.maxSizeInteger * 0.5 - this.size * 0.5;
    this.ctx.fillStyle = this.color;
    this.ctx.fillRect(
      this.x + centerOffset,
      this.y + centerOffset,
      this.size,
      this.size
    );
  }

  appear() {
    this.isIdle = false;
    if (this.counter <= this.delay) {
      this.counter += this.counterStep;
      return;
    }
    if (this.size >= this.maxSize) {
      this.isShimmer = true;
    }
    if (this.isShimmer) {
      this.shimmer();
    } else {
      this.size += this.sizeStep;
    }
    this.draw();
  }

  disappear() {
    this.isShimmer = false;
    this.counter = 0;
    if (this.size <= 0) {
      this.isIdle = true;
      return;
    } else {
      this.size -= 0.1;
    }
    this.draw();
  }

  shimmer() {
    if (this.size >= this.maxSize) {
      this.isReverse = true;
    } else if (this.size <= this.minSize) {
      this.isReverse = false;
    }
    if (this.isReverse) {
      this.size -= this.speed;
    } else {
      this.size += this.speed;
    }
  }
}

function getEffectiveSpeed(value: number, reducedMotion: boolean) {
  const min = 0;
  const max = 100;
  const throttle = 0.001;

  if (value <= min || reducedMotion) {
    return min;
  } else if (value >= max) {
    return max * throttle;
  } else {
    return value * throttle;
  }
}

const VARIANTS = {
  default: { gap: 5, speed: 35, colors: "#f8fafc,#f1f5f9,#cbd5e1", noFocus: false },
  blue: { gap: 10, speed: 25, colors: "#e0f2fe,#7dd3fc,#0ea5e9", noFocus: false },
  yellow: { gap: 3, speed: 20, colors: "#fef08a,#fde047,#eab308", noFocus: false },
  pink: { gap: 6, speed: 80, colors: "#fecdd3,#fda4af,#e11d48", noFocus: true },
} as const;

interface PixelCardProps {
  variant?: "default" | "blue" | "yellow" | "pink";
  gap?: number;
  speed?: number;
  colors?: string;
  noFocus?: boolean;
  // Modo fixo: ligado (true) ou desligado (false) o tempo todo, sem hover.
  active?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export default function PixelCard({
  variant = "default",
  gap,
  speed,
  colors,
  noFocus,
  active,
  className = "",
  children,
}: PixelCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pixelsRef = useRef<Pixel[]>([]);
  const animationRef = useRef<ReturnType<typeof requestAnimationFrame> | null>(
    null
  );
  // Nada de performance.now() nem matchMedia durante o RENDER: no servidor os
  // dois dao resultado diferente do cliente, e isso quebra a hidratacao. Os
  // dois viram refs neutros aqui e sao preenchidos dentro do efeito, que so
  // roda no cliente.
  const timePreviousRef = useRef(0);
  const reducedMotionRef = useRef(false);
  // Modo `active` liga o shimmer pra sempre (ele nunca fica isIdle sozinho,
  // e o ponto do efeito). Sem isso, o cartao Anual desenha pixels a 60fps
  // pra sempre, mesmo depois que a secao de Precos ja saiu da tela.
  const visibleRef = useRef(true);

  const variantCfg = VARIANTS[variant] || VARIANTS.default;
  const finalGap = gap ?? variantCfg.gap;
  const finalSpeed = speed ?? variantCfg.speed;
  const finalColors = colors ?? variantCfg.colors;
  const finalNoFocus = noFocus ?? variantCfg.noFocus;

  const controlled = active !== undefined;

  const initPixels = () => {
    if (!containerRef.current || !canvasRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const width = Math.floor(rect.width);
    const height = Math.floor(rect.height);
    const ctx = canvasRef.current.getContext("2d");

    canvasRef.current.width = width;
    canvasRef.current.height = height;
    canvasRef.current.style.width = `${width}px`;
    canvasRef.current.style.height = `${height}px`;

    const colorsArray = finalColors.split(",");
    const pxs = [];
    for (let x = 0; x < width; x += parseInt(finalGap.toString(), 10)) {
      for (let y = 0; y < height; y += parseInt(finalGap.toString(), 10)) {
        const color =
          colorsArray[Math.floor(Math.random() * colorsArray.length)];
        const dx = x - width / 2;
        const dy = y - height / 2;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const delay = reducedMotionRef.current ? 0 : distance;
        if (!ctx) return;
        pxs.push(
          new Pixel(
            canvasRef.current,
            ctx,
            x,
            y,
            color,
            getEffectiveSpeed(finalSpeed, reducedMotionRef.current),
            delay
          )
        );
      }
    }
    pixelsRef.current = pxs;
  };

  // Quadro estatico: usado em prefers-reduced-motion para nao rodar um loop
  // eterno so para desenhar pixels parados.
  const drawStatic = () => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx || !canvasRef.current) return;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    for (const p of pixelsRef.current) {
      p.size = p.maxSize;
      p.draw();
    }
  };

  const doAnimate = (fnName: keyof Pixel) => {
    animationRef.current = requestAnimationFrame(() => doAnimate(fnName));
    if (!visibleRef.current) return;
    const timeNow = performance.now();
    const timePassed = timeNow - timePreviousRef.current;
    const timeInterval = 1000 / 60;

    if (timePassed < timeInterval) return;
    timePreviousRef.current = timeNow - (timePassed % timeInterval);

    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx || !canvasRef.current) return;

    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    let allIdle = true;
    for (let i = 0; i < pixelsRef.current.length; i++) {
      const pixel = pixelsRef.current[i];
      // @ts-expect-error dynamic method name is one of the Pixel animators
      pixel[fnName]();
      if (!pixel.isIdle) {
        allIdle = false;
      }
    }
    if (allIdle && animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const handleAnimation = (name: keyof Pixel) => {
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
    }
    animationRef.current = requestAnimationFrame(() => doAnimate(name));
  };

  const onMouseEnter = () => handleAnimation("appear");
  const onMouseLeave = () => handleAnimation("disappear");
  const onFocus: React.FocusEventHandler<HTMLDivElement> = (e) => {
    if (e.currentTarget.contains(e.relatedTarget)) return;
    handleAnimation("appear");
  };
  const onBlur: React.FocusEventHandler<HTMLDivElement> = (e) => {
    if (e.currentTarget.contains(e.relatedTarget)) return;
    handleAnimation("disappear");
  };

  useEffect(() => {
    // Preenche no cliente o que nao pode ser lido no render.
    reducedMotionRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    timePreviousRef.current = performance.now();

    initPixels();

    // Modo fixo: dispara sozinho, sem hover.
    if (controlled) {
      if (reducedMotionRef.current) drawStatic();
      else if (active) handleAnimation("appear");
      else handleAnimation("disappear");
    }

    const observer = new ResizeObserver(() => {
      initPixels();
      if (controlled && active) {
        if (reducedMotionRef.current) drawStatic();
        else handleAnimation("appear");
      }
    });
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        visibleRef.current = entry.isIntersecting && !document.hidden;
      },
      { threshold: 0 }
    );
    if (containerRef.current) visibilityObserver.observe(containerRef.current);
    const onVisibility = () => {
      visibleRef.current = !document.hidden;
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      observer.disconnect();
      visibilityObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finalGap, finalSpeed, finalColors, finalNoFocus, active]);

  return (
    <div
      ref={containerRef}
      className={`relative isolate select-none overflow-hidden ${className}`}
      onMouseEnter={controlled ? undefined : onMouseEnter}
      onMouseLeave={controlled ? undefined : onMouseLeave}
      onFocus={controlled || finalNoFocus ? undefined : onFocus}
      onBlur={controlled || finalNoFocus ? undefined : onBlur}
      tabIndex={controlled || finalNoFocus ? -1 : 0}
    >
      <canvas className="block h-full w-full" ref={canvasRef} />
      {children}
    </div>
  );
}
