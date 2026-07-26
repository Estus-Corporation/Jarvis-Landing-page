// Divisor em degrau: RETO -> QUEDA -> RETO.
//
// A geometria agora e parametrizada em vez de fixa, para poder controlar a
// INCLINACAO da diagonal independente da altura da caixa:
//  - `stepWidth`: largura da zona diagonal, em % da LARGURA da caixa. Menor =
//    diagonal mais fechada num espaco horizontal menor = mais INGREME.
//  - `dropDepth`: profundidade da queda, em % da ALTURA da caixa (0-100).
//    100 = a queda usa a altura inteira da caixa.
// O angulo real depende da caixa ser bem mais larga que alta (ela cobre a
// largura toda da secao): reduzir a caixa sem tocar nesses dois parametros
// deixa a mesma proporcao percentual, mas em pixels reais o mesmo "28% de
// altura" vira poucos pixels numa caixa curta, achatando a diagonal. Os
// defaults (stepWidth=10, dropDepth=28) reproduzem o codigo de referencia
// original. Quem precisa de mais inclinacao numa caixa curta passa
// stepWidth menor e/ou dropDepth maior.
//
// Duas camadas de cor, cada uma OPCIONAL e independente:
//  - `fill`: cobre a forma principal (o lado que fica "cheio", is dizer,
//    onde a secao de cima se estende por baixo da linha). Default "bg-black",
//    igual ao codigo de referencia. Passe "" para nao renderizar nada aqui
//    (regiao transparente, deixando o que estiver atras aparecer).
//  - `notchFill`: cobre a reentrancia complementar (o "furo" que revela o que
//    vem depois). Sem default: so aparece se for passado.
//
// `flip` espelha a forma na vertical, usado quando a secao ESCURA fica EM
// CIMA (a forma precisa ancorar no topo da caixa, nao na base).

function shapes(stepWidth: number, dropDepth: number, flip: boolean) {
  const half = stepWidth / 2;
  const left = 50 - half;
  const right = 50 + half;

  if (!flip) {
    // Ancorado no TOPO: lado direito cheio (y:0->100), lado esquerdo recuado
    // (y:0->dropDepth). A diagonal cai de y=0 (x=right) ate y=dropDepth (x=left).
    return {
      fill: `polygon(100% 0%, ${right}% 0%, ${left}% ${dropDepth}%, 0% ${dropDepth}%, 0% 100%, 100% 100%)`,
      notch: `polygon(0% 0%, ${right}% 0%, ${left}% ${dropDepth}%, 0% ${dropDepth}%)`,
      line: `100,0 ${right},0 ${left},${dropDepth} 0,${dropDepth}`,
    };
  }

  // Ancorado na BASE: lado direito cheio (y:0->100), lado esquerdo recuado
  // (y:100-dropDepth -> 100). A diagonal sobe de y=100 (x=right) ate
  // y=100-dropDepth (x=left).
  const top = 100 - dropDepth;
  return {
    fill: `polygon(100% 100%, ${right}% 100%, ${left}% ${top}%, 0% ${top}%, 0% 0%, 100% 0%)`,
    notch: `polygon(0% ${top}%, ${left}% ${top}%, ${right}% 100%, 0% 100%)`,
    line: `100,100 ${right},100 ${left},${top} 0,${top}`,
  };
}

export default function StepDivider({
  fill = "bg-black",
  notchFill,
  flip = false,
  className = "relative h-96 w-full md:h-[28rem]",
  lineColor = "rgba(255,255,255,0.35)",
  lineWidth = 0.3,
  stepWidth = 10,
  dropDepth = 28,
}: {
  fill?: string;
  notchFill?: string;
  flip?: boolean;
  className?: string;
  lineColor?: string;
  lineWidth?: number;
  stepWidth?: number;
  dropDepth?: number;
}) {
  const { fill: fillClip, notch: notchClip, line } = shapes(
    stepWidth,
    dropDepth,
    flip
  );

  return (
    <div className={className} aria-hidden>
      {/* Reentrancia: some se nenhuma cor for passada. */}
      {notchFill && (
        <div
          className={`absolute inset-0 ${notchFill}`}
          style={{ clipPath: notchClip }}
        />
      )}

      {/* Forma principal: fill="" desliga essa camada, deixando a regiao
          transparente (o que estiver atras, ex.: o fundo animado da hero,
          continua aparecendo normalmente). */}
      {fill && (
        <div
          className={`absolute inset-0 ${fill}`}
          style={{ clipPath: fillClip }}
        />
      )}

      {/* Fio seguindo exatamente o mesmo caminho */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <polyline
          points={line}
          fill="none"
          stroke={lineColor}
          strokeWidth={lineWidth}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}
