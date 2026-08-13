"use client";

// Medidor de FPS na tela, ligado so por "?fps=1" na URL.
//
// Existe porque otimizar sem medir na maquina CERTA e chute: aqui do lado de
// ca, num navegador sem GPU, a rolagem trava em ~28fps por causa do
// rasterizador por software, entao qualquer melhora que eu tentasse validar
// por aqui se perderia nesse piso. Com isto, quem esta no aparelho lento le
// tres numeros na tela e manda de volta — e a conversa passa a ser sobre
// dado, nao sobre impressao.
//
// O numero que mais importa NAO e o FPS medio: e o PIOR. Travar e sentido nos
// engasgos, nao na media — uma pagina que fica em 55 e cai pra 12 de vez em
// quando parece pior que uma presa em 40 o tempo todo. Por isso guardamos
// tambem a pior janela de 1s e em qual secao ela aconteceu, que e o que
// aponta onde mexer.
import { useEffect, useState } from "react";

const SECTION_NAMES: Record<string, string> = {
  top: "Hero",
  recursos: "Recursos",
  interface: "Interface",
  organizacao: "Organização",
  futuro: "Próximas atualizações",
  depoimentos: "Depoimentos",
  precos: "Preços",
};

// Qual secao esta ocupando o meio da tela agora. O meio, e nao o topo, porque
// e o que a pessoa esta de fato olhando quando sente o engasgo.
function currentSection(): string {
  const middle = window.innerHeight / 2;
  const sections = Array.from(document.querySelectorAll("section[id]"));
  for (const s of sections) {
    const r = s.getBoundingClientRect();
    if (r.top <= middle && r.bottom >= middle)
      return SECTION_NAMES[s.id] ?? s.id;
  }
  return "—";
}

// Quem esta desenhando de verdade. Este e o dado que separa "a pagina e
// pesada" de "o navegador esta renderizando por software": se vier
// SwiftShader/Software, a aceleracao de hardware esta desligada e NENHUMA
// otimizacao de pagina conserta isso — a placa de video nem esta sendo usada.
// Vale a pena estar aqui porque, de fora, o sintoma e identico ao de uma
// pagina mal feita, e sem isto a gente ficaria cortando visual a esmo.
function gpuInfo(): string {
  try {
    const gl = document.createElement("canvas").getContext("webgl");
    if (!gl) return "sem WebGL";
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    if (!ext) return "n/d";
    return String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)).slice(0, 40);
  } catch {
    return "erro";
  }
}

export default function FpsMeter() {
  const [on, setOn] = useState(false);
  const [now, setNow] = useState(0);
  const [worst, setWorst] = useState({ fps: Infinity, where: "—" });
  const [lowPower, setLowPower] = useState(false);
  const [env, setEnv] = useState({ gpu: "", dpr: 0, w: 0, h: 0 });

  useEffect(() => {
    if (new URLSearchParams(location.search).get("fps") !== "1") return;
    setOn(true);
    setEnv({
      gpu: gpuInfo(),
      // dpr importa porque o custo de PINTAR cresce com a quantidade de
      // pixels: uma tela em 150% pinta mais que o dobro de area que uma em
      // 100%, com a pagina sendo exatamente a mesma.
      dpr: window.devicePixelRatio,
      w: window.innerWidth,
      h: window.innerHeight,
    });

    let raf = 0;
    let frames = 0;
    let windowStart = 0;

    const tick = (t: number) => {
      raf = requestAnimationFrame(tick);
      if (!windowStart) windowStart = t;
      frames += 1;

      // Fecha uma janela a cada ~500ms. Atualizar o estado do React a cada
      // frame faria o proprio medidor virar parte do problema que ele mede.
      const elapsed = t - windowStart;
      if (elapsed < 500) return;

      const fps = Math.round((frames * 1000) / elapsed);
      setNow(fps);
      setLowPower(document.documentElement.classList.contains("low-power"));
      // Ignora a primeira janela: ela pega o fim do carregamento e marcaria
      // um "pior" que nao representa o uso da pagina.
      if (windowStart > 3000)
        setWorst((w) => (fps < w.fps ? { fps, where: currentSection() } : w));

      frames = 0;
      windowStart = t;
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  if (!on) return null;

  return (
    <button
      type="button"
      // Clicar zera o "pior". Sem isso a medicao e fragil de um jeito que
      // enganaria: basta UM engasgo solto (uma imagem decodificando, o
      // coletor de lixo passando) pra o pior travar num numero baixo e nunca
      // mais subir — quem estivesse do outro lado reportaria "8 fps" de uma
      // pagina que esta lisa. Zerando antes de rolar, o numero passa a
      // descrever so a rolagem.
      onClick={() => setWorst({ fps: Infinity, where: "—" })}
      // Canto inferior esquerdo: o header flutuante e os CTAs vivem em cima,
      // e o rodape nao tem nada nessa quina — assim o medidor nao esconde
      // justamente o que a pessoa precisaria conseguir olhar enquanto rola.
      className="fixed bottom-4 left-4 z-[100] cursor-pointer rounded-xl border border-white/20 bg-black/85 px-4 py-3 text-left font-mono text-sm leading-tight text-white shadow-lg"
    >
      <div className="text-2xl font-bold">{now} fps</div>
      <div className="mt-1 text-white/70">
        pior: {worst.fps === Infinity ? "—" : `${worst.fps} fps`}
      </div>
      <div className="text-white/50">em: {worst.where}</div>
      <div className="mt-1 text-white/70">
        modo leve: {lowPower ? "SIM" : "não"}
      </div>
      <div className="mt-2 max-w-[260px] border-t border-white/15 pt-2 text-[11px] leading-snug text-white/50">
        <div>
          tela: {env.w}x{env.h} @{env.dpr}x
        </div>
        <div className="break-words">gpu: {env.gpu}</div>
      </div>
      <div className="mt-1 text-[11px] text-white/40">toque para zerar</div>
    </button>
  );
}
