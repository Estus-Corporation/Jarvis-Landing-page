// Grao fixo sobre a pagina inteira. Tira o aspecto "chapado" de um fundo
// escuro solido e disfarca o banding dos halos com blur.
//
// Fica em elemento fixed + pointer-events-none de proposito: aplicar textura
// em container que rola forca repaint de GPU a cada frame e derruba o FPS no
// mobile.
const NOISE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="140" height="140">
      <filter id="n">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch"/>
        <feColorMatrix type="saturate" values="0"/>
      </filter>
      <rect width="140" height="140" filter="url(#n)"/>
    </svg>`
  );

export default function Grain() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[60] opacity-[0.035] mix-blend-soft-light"
      style={{ backgroundImage: `url("${NOISE}")`, backgroundRepeat: "repeat" }}
    />
  );
}
