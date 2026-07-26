import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import StepDivider from "@/components/ui/step-divider";

// Hero com fundo dividido por um corte diagonal via clip-path (nao imagem).
//
// Estrutura pedida:
//  - Container pai: position relative + overflow-hidden, para os cortes ficarem
//    alinhados e nada vazar.
//  - Camada 1: div cinza-claro (#e8e8e8) cobrindo a secao inteira.
//  - Camada 2: div preta por cima, recortada pelo clip-path para virar a faixa
//    de rodape com topo diagonal.
//
// O polygon(0 70%, 100% 40%, 100% 100%, 0 100%):
//  - (0 70%)   topo da faixa preta na borda ESQUERDA, a 70% da altura;
//  - (100% 40%) sobe ate 40% na borda DIREITA -> a linha inclina para cima da
//    esquerda para a direita;
//  - (100% 100%) e (0 100%) fecham a faixa ate o rodape.
// A diferenca vertical (70% -> 40%) espalhada pela largura toda da uma diagonal
// de poucos graus: sutil, longe de um corte de 45.
//
// Tema claro de proposito (conforme o pedido). Fica nesta rota isolada para nao
// conflitar com o tema escuro do site.
export default function HeroDemoPage() {
  return (
    <main className="relative min-h-[100dvh] w-full overflow-hidden bg-[#e8e8e8]">
      {/* Camada 1: fundo cinza-claro, secao toda */}
      <div aria-hidden className="absolute inset-0 bg-[#e8e8e8]" />

      {/* Camada 2: faixa preta do rodape no formato de degrau
          (RETO -> QUEDA -> RETO), com o fio branco. Caso padrao do divisor:
          conteudo claro em cima, preto embaixo, sem flip. */}
      <StepDivider className="absolute inset-x-0 bottom-0 h-[42%]" />

      {/* Conteudo, acima das duas camadas */}
      <div className="relative z-10 mx-auto flex min-h-[100dvh] max-w-[1400px] flex-col px-6 pt-28 sm:pt-32">
        <div className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-neutral-600">
            Assistente de voz
          </p>
          <h1 className="mt-5 text-5xl font-semibold leading-[1.02] tracking-[-0.03em] text-neutral-900 sm:text-7xl">
            Fale. O Jarvis
            <br />
            executa.
          </h1>
          <p className="mt-6 max-w-[46ch] text-lg leading-relaxed text-neutral-700">
            Um assistente de voz que vive no seu Windows. Controla o navegador,
            abre programas e roda comandos de terminal.
          </p>

          {/* CTA no padrao button-in-button: seta em circulo proprio, com fisica
              de hover magnetico. Preto sobre o cinza-claro, contraste de sobra. */}
          <a
            href="#"
            className="group mt-10 inline-flex items-center gap-3 rounded-full bg-black py-2 pl-7 pr-2 text-base font-semibold text-white transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-[1.015] active:scale-[0.98]"
          >
            <span>Começar agora</span>
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
              <ArrowUpRight size={18} weight="bold" aria-hidden />
            </span>
          </a>
        </div>

        {/* Linha de rodape, sobre a faixa preta: texto claro para contraste. */}
        <div className="mt-auto flex flex-wrap items-center gap-x-6 gap-y-2 pb-10 text-sm text-white/60">
          <span>Windows 10 e 11</span>
          <span aria-hidden className="hidden h-4 w-px bg-white/20 sm:block" />
          <span>Instala em minutos</span>
          <span aria-hidden className="hidden h-4 w-px bg-white/20 sm:block" />
          <span>Cancele quando quiser</span>
        </div>
      </div>
    </main>
  );
}
