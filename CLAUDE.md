# Jarvis Landing Page

Landing page em Next.js 14 (App Router) + Tailwind + Framer Motion (`motion/react`) para o Jarvis, assistente de voz para Windows. Site monocromático (preto/branco, sem cor de acento — ver comentário em `tailwind.config.ts`), com seções tipo scrollytelling e vários efeitos decorativos (canvas, WebGL, animações CSS).

## Comandos

```
npm run dev      # dev server
npm run build    # build de produção
npm run lint     # eslint
npx tsc --noEmit -p .   # typecheck (não tem script próprio)
```

## Investigação de performance (2026-08-12 → 2026-08-13)

O usuário reportou o site travando num notebook de terceiros. Isto documenta o que foi investigado, corrigido, revertido em parte, e o que ainda está em aberto — para não repetir trabalho numa próxima sessão.

### Estado atual (2026-08-13) — leia isto primeiro

O modo `low-power` (classe `low-power` no `<html>`, ver `components/ui/use-low-power.tsx`) hoje é **deliberadamente fraco**. Ele só:
- deixa o Lenis (smooth scroll) inerte, devolvendo o scroll nativo;
- para o SVG de progresso do `TracingBeam` de reanimar o gradiente;
- troca o shader WebGL do `PrismaticBurst` (Preços) por um gradiente estático;
- desliga `backdrop-filter` em tudo.

Ele **não** mexe mais em: partículas/esfera da Hero, nenhuma das 14 animações CSS (`led-ping`, `glow-spin`, `beam-sweep`, `wave-bar`, `marquee`, etc.), nem nos cartões de depoimento. Isso é intencional — ver "Por que foi revertido" abaixo.

A detecção também mudou: **não existe mais palpite por hardware** (`navigator.hardwareConcurrency`/`deviceMemory`). Hoje é só medição real de FPS (`FPS_FLOOR = 45` por ~1s, com uma segunda checagem na primeira rolagem). `?lowpower=1` / `?lowpower=0` na URL continuam forçando o modo pra teste.

### Por que foi revertido (o que aconteceu entre as duas datas)

No dia seguinte ao commit `ee66711`, dois relatos do usuário mudaram a decisão:

1. **Falso positivo real**: um amigo abriu o site e caiu em modo `low-power` **mesmo o PC dele rodando o site bem sem o modo ligado**. Causa mais provável: `navigator.deviceMemory` reporta memória *disponível pro navegador*, não a RAM nominal — é comum uma máquina de 8GB com vídeo integrado (que reserva parte da RAM pra si) reportar `4`, o mesmo valor que a heurística antiga tratava como "fraca". `hardwareConcurrency <= 4` tem o mesmo problema (muito notebook comum, nada fraco, tem só 4 núcleos). **Correção**: removido o palpite por hardware inteiro; agora só a medição real de FPS decide.

2. **A otimização anterior era exagerada**: testando em vários PCs/notebooks reais, o usuário confirmou que a maioria roda a página completa (sem modo leve) sem dificuldade. O caso que motivou tudo (ver seção de 2026-08-12 abaixo) era **o navegador da pessoa** (Firefox, possivelmente renderizando por software — ver "Em aberto"), não o peso da página. Matar todas as animações da página (inclusive Hero/esfera/botões/cartões) resolvia um problema que morava em outro lugar. **Correção**: `app/globals.css` e `components/Hero.tsx` voltaram a rodar tudo sempre; só as 4 coisas estruturais listadas acima continuam degradando.

### O que foi corrigido e continua valendo (commits `f2e3988` → `ee66711`)

1. **Imagens do Roadmap** — 3 PNGs de 1,4-1,7MB viravam `<img>` cru. Convertidas para WebP (`sharp`, quality 90) e servidas via `next/image` com `unoptimized` (mesmo padrão de `Showcase.tsx`). 4,45MB → 270KB.

2. **`components/ui/smooth-scroll.tsx`** (Lenis) — em modo leve, `autoRaf:false` + `smoothWheel:false` em vez de trocar `<ReactLenis>` por fragmento. **Isto corrigiu um bug que eu mesmo introduzi**: trocar o tipo do nó fazia o React desmontar/remontar a página inteira (medido: 1 frame de 1270ms). A troca de árvore condicional é uma armadilha a evitar nesse tipo de toggle.

3. **`components/ui/tracing-beam.tsx`** — em modo leve, o SVG de progresso (altura da página inteira) para de reanimar o gradiente (`animated={!lowPower}`), e a fonte do `useTransform` vira um `MotionValue` parado em vez de `scrollYProgress`, pra não recalcular à toa.

4. **`components/Pricing.tsx`** — `PrismaticBurst` (shader WebGL, raymarching) substituído por um `radial-gradient` estático em modo leve. Raymarching é custo por pixel; não há parâmetro que barateie o suficiente numa GPU integrada.

5. **`components/Roadmap.tsx`** + `app/globals.css` — a barra de progresso do carrossel (`.roadmap-fill`) animava `height` (força layout todo frame). Trocada para `transform: scaleY()` + `transform-origin: top` (compositor, sem layout). Era a única seção que ficava abaixo de 60fps no Firefox depois de tudo o resto corrigido (36fps → 60fps). Isto **não** depende do modo leve, sempre foi assim.

6. **`components/ui/fps-meter.tsx`** (novo) — medidor de FPS na tela, ligado por `?fps=1` na URL. Mostra: FPS atual, **pior FPS numa janela de 500ms** (clicável pra zerar — importante, um engasgo isolado no load trava o "pior" pra sempre se não zerar), em qual seção ocorreu o pior, se `low-power` está ativo, resolução/DPR da tela, e **a GPU/renderer via `WEBGL_debug_renderer_info`**. Sem o parâmetro, não renderiza nada e não roda loop nenhum. Ainda é a ferramenta certa pra próxima vez que alguém reportar travamento.

### Metodologia que funcionou (e a que não funcionou)

- **Não confiar em "parece caro"**: a primeira rodada de otimizações (Lenis, TracingBeam, PrismaticBurst) melhorou pouco na prática porque o problema real — animações CSS infinitas + canvas da Hero rodando simultaneamente — só aparece na combinação dos dois. Desligar um sozinho quase não mudava o FPS medido.
- **Nem toda otimização medida vale a pena aplicar**: mesmo depois de confirmar com dados que "matar tudo" melhorava o FPS numa máquina degradada de propósito, isso não significava que valia a pena pagar o custo visual — a maioria das máquinas reais nunca precisava disso. Medir prova que uma otimização *funciona*; não prova que ela *é necessária*. Essa distinção só ficou clara depois de testar em hardware real.
- **Um palpite instantâneo (hardware) é sedutor mas arriscado**: parecia grátis (zero custo, decide no primeiro frame), mas as APIs que ele usa (`deviceMemory`, `hardwareConcurrency`) não medem o que a gente queria — medem um proxy ruidoso. Preferir medição real (mais lenta, ~1s) a um atalho que pode estar sistematicamente errado.
- **Medir com CPU throttled no Chromium via CDP** (`Emulation.setCPUThrottlingRate`) foi o que revelou o problema original de verdade: a página ficava em ~9fps **parada**, sem rolar nada.
- **Chromium headless não tem GPU** — ele renderiza por software (`SwiftShader`). Isso é ótimo pra achar problemas de CPU/layout, mas **não serve pra medir custo de pintura/composição** (backdrop-filter, gradientes, sombras) porque o piso já é baixo demais pra ver diferença. Usar `firefox` (também via Playwright, `npx playwright install firefox`) quando precisar medir isso — mas mesmo Firefox real, se a aceleração de hardware não estiver ligada, também renderiza por software.
- **`document.getAnimations()`** e a **Long Animation Frames API** (`PerformanceObserver({type: 'long-animation-frame'})`) foram essenciais pra atribuir custo a scripts/animações específicos em vez de adivinhar.

### Em aberto

O relato que gerou a rodada de 2026-08-12 (usuário testou com um amigo, i5 + 8GB RAM + **RTX 4050**, **Firefox**) deu ~11fps em todas as seções (menos a Hero, que ficou boa). Isso é anômalo: com GPU dedicada, não deveria travar por peso de página — e de fato, medido aqui num Firefox real (sem CPU throttled), a página inteira roda a 60fps.

**Hipótese forte, não confirmada**: o Firefox daquela máquina está renderizando por software (aceleração de hardware desligada), o que faria a RTX 4050 não estar sendo usada de fato. O medidor (`?fps=1`) expõe a linha `gpu:` — se aparecer algo como `llvmpipe`, `SwiftShader`, `Software` ou `Basic`, confirma a hipótese, e a correção é fora do código (driver de vídeo / `about:config` do Firefox dele), não uma otimização de página.

**Próximo passo quando puder testar de novo**: pedir pra pessoa abrir `<site>/?fps=1`, tocar no medidor pra zerar, rolar a página inteira devagar, e mandar print. A linha `gpu:` resolve a dúvida na hora. Como o modo `low-power` agora é bem mais leve, mesmo que a detecção dispare de novo o impacto visual é pequeno — então não há urgência em caçar mais falsos positivos, só a curiosidade de confirmar a hipótese do Firefox.

### Como testar localmente

```
npm run build && npm run start -- -p 3111
```
Depois `http://localhost:3111/?fps=1` (medidor) ou `?lowpower=1` / `?lowpower=0` (força o modo). Pra medir de verdade (não só abrir), usar Playwright com CDP `Emulation.setCPUThrottlingRate` no Chromium, ou `firefox` do Playwright pra reproduzir bugs específicos de Gecko — não tem script formal disso no repo, foi tudo feito com scripts ad-hoc no scratchpad da sessão.
