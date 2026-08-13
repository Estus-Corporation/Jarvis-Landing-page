# Jarvis Landing Page

Landing page em Next.js 14 (App Router) + Tailwind + Framer Motion (`motion/react`) para o Jarvis, assistente de voz para Windows. Site monocromático (preto/branco, sem cor de acento — ver comentário em `tailwind.config.ts`), com seções tipo scrollytelling e vários efeitos decorativos (canvas, WebGL, animações CSS).

## Comandos

```
npm run dev      # dev server
npm run build    # build de produção
npm run lint     # eslint
npx tsc --noEmit -p .   # typecheck (não tem script próprio)
```

## Investigação de performance (2026-08-12)

O usuário reportou o site travando num notebook de terceiros. Isto documenta o que foi investigado, corrigido, e o que ainda está em aberto — para não repetir trabalho numa próxima sessão.

### O que foi corrigido (commits `f2e3988` → `ee66711` em `main`)

1. **Imagens do Roadmap** — 3 PNGs de 1,4-1,7MB viravam `<img>` cru. Convertidas para WebP (`sharp`, quality 90) e servidas via `next/image` com `unoptimized` (mesmo padrão de `Showcase.tsx`). 4,45MB → 270KB.

2. **`components/ui/use-low-power.tsx`** (novo) — detecção de "máquina fraca", compartilhada por quem for caro (Lenis, TracingBeam, PrismaticBurst, Hero). Combina:
   - Palpite estático por `navigator.hardwareConcurrency`/`deviceMemory` (instantâneo, mas cego pra GPU).
   - Medição real de FPS (~1s, após a página assentar) — reprovada se < 45fps.
   - Segunda checagem na primeira rolagem (a primeira mede parado, pode passar batido numa máquina que só engasga em movimento).
   - `?lowpower=1` / `?lowpower=0` na URL força o modo, para poder revisar sem depender do hardware.
   - Aplica a classe `low-power` no `<html>`, consumida tanto por CSS (`app/globals.css`) quanto por componentes via `useLowPowerDevice()`.

3. **`app/globals.css`** — em `.low-power`: `backdrop-filter: none`, `animation: none` em tudo (mata as 14 animações CSS `infinite` da página), e `display:none` nos 4 enfeites cujo estado-base é um artefato visual (beam-sweep, scan-y, core-ping, led-dot::after — todos começam/terminam fora de vista, então "congelar" ficaria errado).

4. **`components/Hero.tsx`** — em modo leve: partículas (canvas) não renderizam, `JarvisOrb` recebe `paused` (desenha 1 frame e para — a esfera continua visível, só não gira).

5. **`components/ui/smooth-scroll.tsx`** (Lenis) — em modo leve, `autoRaf:false` + `smoothWheel:false` em vez de trocar `<ReactLenis>` por fragmento. **Isto corrigiu um bug que eu mesmo introduzi**: trocar o tipo do nó fazia o React desmontar/remontar a página inteira (medido: 1 frame de 1270ms). A troca de árvore condicional é uma armadilha a evitar nesse tipo de toggle.

6. **`components/ui/tracing-beam.tsx`** — em modo leve, o SVG de progresso (altura da página inteira) para de reanimar o gradiente (`animated={!lowPower}`), e a fonte do `useTransform` vira um `MotionValue` parado em vez de `scrollYProgress`, pra não recalcular à toa.

7. **`components/Pricing.tsx`** — `PrismaticBurst` (shader WebGL, raymarching) substituído por um `radial-gradient` estático em modo leve. Raymarching é custo por pixel; não há parâmetro que barateie o suficiente numa GPU integrada.

8. **`components/Roadmap.tsx`** + `app/globals.css` — a barra de progresso do carrossel (`.roadmap-fill`) animava `height` (força layout todo frame). Trocada para `transform: scaleY()` + `transform-origin: top` (compositor, sem layout). Era a única seção que ficava abaixo de 60fps no Firefox depois de tudo o resto corrigido (36fps → 60fps).

9. **`components/ui/fps-meter.tsx`** (novo) — medidor de FPS na tela, ligado por `?fps=1` na URL. Mostra: FPS atual, **pior FPS numa janela de 500ms** (clicável pra zerar — importante, um engasgo isolado no load trava o "pior" pra sempre se não zerar), em qual seção ocorreu o pior, se `low-power` está ativo, resolução/DPR da tela, e **a GPU/renderer via `WEBGL_debug_renderer_info`**. Sem o parâmetro, não renderiza nada e não roda loop nenhum.

### Metodologia que funcionou (e a que não funcionou)

- **Não confiar em "parece caro"**: a primeira rodada de otimizações (Lenis, TracingBeam, PrismaticBurst) melhorou pouco na prática porque o problema real — animações CSS infinitas + canvas da Hero rodando simultaneamente — só aparece na combinação dos dois. Desligar um sozinho quase não mudava o FPS medido.
- **Medir com CPU throttled no Chromium via CDP** (`Emulation.setCPUThrottlingRate`) foi o que revelou o problema de verdade: a página ficava em ~9fps **parada**, sem rolar nada.
- **Chromium headless não tem GPU** — ele renderiza por software (`SwiftShader`). Isso é ótimo pra achar problemas de CPU/layout, mas **não serve pra medir custo de pintura/composição** (backdrop-filter, gradientes, sombras) porque o piso já é baixo demais pra ver diferença. Usar `firefox` (também via Playwright, `npx playwright install firefox`) quando precisar medir isso — mas mesmo Firefox real, se a aceleração de hardware não estiver ligada, também renderiza por software.
- **`document.getAnimations()`** e a **Long Animation Frames API** (`PerformanceObserver({type: 'long-animation-frame'})`) foram essenciais pra atribuir custo a scripts/animações específicos em vez de adivinhar.

### Em aberto

O relato mais recente (usuário testou com um amigo, i5 + 8GB RAM + **RTX 4050**, **Firefox**) deu ~11fps em todas as seções (menos a Hero, que ficou boa). Isso é anômalo: com GPU dedicada, não deveria travar por peso de página — e de fato, medido aqui num Firefox real (sem CPU throttled), a página inteira roda a 60fps.

**Hipótese forte, não confirmada**: o Firefox daquela máquina está renderizando por software (aceleração de hardware desligada), o que faria a RTX 4050 não estar sendo usada de fato. O medidor (`?fps=1`) agora expõe a linha `gpu:` — se aparecer algo como `llvmpipe`, `SwiftShader`, `Software` ou `Basic`, confirma a hipótese, e a correção é fora do código (driver de vídeo / `about:config` do Firefox dele), não uma otimização de página.

**Próximo passo quando puder testar de novo**: pedir pra pessoa abrir `<site>/?fps=1`, tocar no medidor pra zerar, rolar a página inteira devagar, e mandar print. A linha `gpu:` resolve a dúvida na hora.

### Como testar localmente

```
npm run build && npm run start -- -p 3111
```
Depois `http://localhost:3111/?fps=1` (medidor) ou `?lowpower=1` / `?lowpower=0` (força o modo). Pra medir de verdade (não só abrir), usar Playwright com CDP `Emulation.setCPUThrottlingRate` no Chromium, ou `firefox` do Playwright pra reproduzir bugs específicos de Gecko — não tem script formal disso no repo, foi tudo feito com scripts ad-hoc no scratchpad da sessão.
