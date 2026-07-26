// Divisor em degrau: RETO -> QUEDA -> RETO.
//
// Forma exata do codigo de referencia:
//   polygon(0% 0%, 44% 0%, 54% 28%, 100% 28%, 100% 100%, 0% 100%)
// O preenchimento e cheio a ESQUERDA (do topo ate a base) e, a partir de 44%
// da largura, uma unica diagonal o derruba para 28%, onde ele segue reto ate a
// borda direita. Ou seja: alto a esquerda, recuado a direita.
//
// A linha branca e desenhada por um polyline que segue exatamente o mesmo
// caminho, com vector-effect para a espessura nao esticar junto com o
// preserveAspectRatio="none".
//
// Props adicionadas sobre o codigo original, com defaults identicos a ele:
//  - fill:  classe de cor do preenchimento (default bg-black).
//  - flip:  espelha a forma na vertical. Necessario quando o divisor separa
//           uma secao ESCURA EM CIMA de uma clara embaixo, em vez do caso
//           padrao (conteudo em cima, faixa preta embaixo).
//  - className: permite posicionar/dimensionar o divisor no lugar de uso.

// Espelhado na horizontal (x -> 100-x) em relacao a forma de referencia:
// agora o preenchimento e cheio a DIREITA e a queda acontece do lado esquerdo.
const SHAPE = "polygon(100% 0%, 56% 0%, 46% 28%, 0% 28%, 0% 100%, 100% 100%)";
const LINE = "100,0 56,0 46,28 0,28";

const SHAPE_FLIPPED =
  "polygon(100% 100%, 56% 100%, 46% 72%, 0% 72%, 0% 0%, 100% 0%)";
const LINE_FLIPPED = "100,100 56,100 46,72 0,72";

export default function StepDivider({
  fill = "bg-black",
  flip = false,
  className = "relative h-96 w-full md:h-[28rem]",
}: {
  fill?: string;
  flip?: boolean;
  className?: string;
}) {
  return (
    <div className={className} aria-hidden>
      {/* Preenchimento recortado na forma: RETO -> QUEDA -> RETO */}
      <div
        className={`absolute inset-0 ${fill}`}
        style={{ clipPath: flip ? SHAPE_FLIPPED : SHAPE }}
      />

      {/* Fio branco seguindo exatamente o mesmo caminho */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <polyline
          points={flip ? LINE_FLIPPED : LINE}
          fill="none"
          stroke="rgba(255,255,255,0.35)"
          strokeWidth="0.3"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}
