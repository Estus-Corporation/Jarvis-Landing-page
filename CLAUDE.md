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

4. **`components/Pricing.tsx`** — `PrismaticBurst` (shader WebGL, raymarching) substituído por um `radial-gradient` estático em modo leve. Raymarching é custo por pixel; não há parâmetro que barateie o suficiente numa GPU integrada. **[Obsoleto desde 2026-08-20: `Pricing.tsx` e `prismatic-burst.tsx` foram deletados — ver seção "Formulário de lista de espera" abaixo. O ponto sobre raymarching/GPU integrada continua válido caso a seção de Preços volte no lançamento.]**

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

## Formulário de lista de espera (2026-08-18 → 2026-08-20)

O produto ainda não lançou e não existe checkout de verdade — a seção de Preços linkava pra lugar nenhum real (`Obter plano` ia pra `#top`, um placeholder morto). Decisão: **tirar a seção de Preços da página inteiramente** e substituir por um formulário de captura de lead (`#formulario`, entre Depoimentos e o fim da página, dentro do `TracingBeam`), pra construir lista de espera antes do lançamento. `components/Pricing.tsx`, `components/ui/prismatic-burst.tsx` e `components/ui/hover-border-gradient.tsx` foram deletados (órfãos, só a Pricing usava). O `offers` do JSON-LD também saiu — preço em dado estruturado sem preço nenhum visível na página é o "dado enganoso" que o comentário original daquele bloco avisava pra evitar; volta junto se/quando Preços voltar.

### O que existe hoje

- **`components/Formulario.tsx`** — seção com 3 campos (nome, WhatsApp, email — rotulado "WhatsApp" e não "Telefone" de propósito, já responde por que o número é pedido). Segue a mesma anatomia de seção do resto do site (`SectionEyebrow`, `<h2>` com a fórmula de fonte fluida, linha de brilho no topo). Primeiro uso real do token `rounded-chip` (10px) do Tailwind config, que já existia reservado mas nunca tinha sido usado. Erro é sinalizado por **contraste de borda + tranco horizontal, nunca por cor** — o site é monocromático, um vermelho de erro seria o único acento da página inteira.
- **`app/api/waitlist/route.ts`** — grava os leads numa planilha do Google Sheets, falando REST cru (sem o pacote `googleapis`, que pesa ~100MB pra fazer ~40 linhas de trabalho). JWT da service account assinado com `node:crypto` (RS256). Runtime `nodejs` explícito (a assinatura precisa de `node:crypto`, não roda em Edge). Rate limit por IP **folgado de propósito** (30/min) — operadora móvel BR usa CGNAT, um teto apertado bloquearia gente real num disparo de marketing; quem barra robô é um honeypot (campo invisível), não o contador.
- **Todos os CTAs da página** (Header "Começar agora", Hero "Assinar agora", Roadmap "Quero ser notificado!" ×2, antigo botão de plano) apontam pra `#formulario`. Nav do Header e Footer também trocaram a entrada "Preços" por "Lista de espera".
- **Canal de aviso**: Comunidade do WhatsApp (não grupo — grupo tem teto de 1024 membros e o link de convite pode ser resetado; Comunidade tem canal de Avisos só-admin, formato certo pra "te aviso quando lançar") como principal, email como reforço via planilha (fase 2, Resend, ainda não implementado). O link da Comunidade é **hardcoded como default** em `Formulario.tsx` (não é segredo — link de convite existe pra ser divulgado), com `NEXT_PUBLIC_WHATSAPP_COMMUNITY_URL` como override se precisar trocar sem esperar deploy.

### Variáveis de ambiente (ver `.env.example` pro passo a passo completo)

`NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_WHATSAPP_COMMUNITY_URL` (opcional, já tem default), `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `GOOGLE_SHEET_ID`. As 3 do Google são de uma service account do Google Cloud (IAM e admin → Contas de serviço → Chaves → JSON) com a planilha compartilhada pra ela como Editor — **não dá pra usar um Gmail pessoal aqui**, precisa ser o `client_email` gerado pelo Cloud Console, senão a assinatura RS256 falha com `invalid_grant: Invalid JWT Signature` (sintoma de chave errada/revogada — já aconteceu 2x nesta feature, sempre foi isso).

### Formato da planilha

Colunas A–E: `data (DD/MM/AAAA HH:MM, fuso America/Sao_Paulo)`, `nome`, `telefone (E.164, +55...)`, `email (minúsculo)`, `origem (fixo "landing")`. O telefone foi cogitado em formato bonito `(DDD)99999-9999` pra leitura e **revertido de propósito**: o plano é importar a lista em massa futuramente (WhatsApp broadcast, ESP), e essas ferramentas esperam E.164, não o formato de tela. A data, ao contrário, não afeta import nenhum — fica formatada pra leitura humana.

### `lib/site.ts`: bug de `??` com string vazia

`SITE_URL` usava `process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"` — `??` só cai no fallback com `null`/`undefined`, não com string vazia. Um `.env` com `NEXT_PUBLIC_SITE_URL=` (variável definida, valor vazio — comum ao preencher um template aos poucos) quebrava `npm run build` inteiro em `new URL('')` dentro do `layout.tsx`. Trocado pra `||`. Vale o mesmo cuidado em qualquer env var nova que vire `new URL(...)`.

### Testando a rota sem passar pela UI

Playwright foi instalado como devDependency (`playwright.config.ts`, chromium apenas, sem exemplos) — mas não existe suite formal no repo; os testes de cada sessão foram ad-hoc, escritos em `tests/*.spec.ts`, rodados, e apagados depois (junto com `screenshots/`). Pra debugar a integração com Google Sheets sem depender do formulário na tela, um script node avulso (fora do repo, no scratchpad da sessão) usando `@next/env` pra carregar o `.env.local` + replicando a função `getAccessToken`/`appendRow` da rota foi o jeito mais rápido de isolar "é a chave ou é a permissão da planilha" — retorna `invalid_grant` se a credencial estiver errada, `403 PERMISSION_DENIED` se a planilha não estiver compartilhada com a service account, `200` se tudo certo. **Nunca imprimir `GOOGLE_PRIVATE_KEY` no terminal/transcript** — o classificador do Claude Code bloqueia isso por padrão (`cat .env.local` é negado); scripts de diagnóstico devem carregar a env var e usá-la sem nunca fazer `console.log` dela.

### Em aberto

- Email de confirmação via Resend (fase 2) — planejado, não implementado. Mesma rota `/api/waitlist`, só falta o disparo.
- Copy do Hero ("Assinar agora") aponta pra `#formulario` mas ainda promete ação de assinatura paga — mismatch de expectativa sinalizado, não resolvido; trocar a copy (ex: "Quero ser avisado") é decisão separada de só repontar o `href`.
- Bug pré-existente (não desta feature, mas achado durante ela): seções com `whileInView`/`once:true` ficam com opacidade 0 permanentemente **até a próxima passagem de scroll** se a página carregar direto numa âncora (`/#formulario`, `/#recursos` etc.) ou em modo `low-power` (Lenis inerte = scroll nativo, sem passar suavemente pelas seções no meio). Confirmado recuperável (rolar de volta por cima resolve), não é permanente — mas é a explicação mais provável se alguém reportar "seção em branco" de novo.
