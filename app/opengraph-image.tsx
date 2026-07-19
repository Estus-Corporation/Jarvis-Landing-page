import { ImageResponse } from "next/og";
import { SITE } from "@/lib/site";

// Cartao de compartilhamento gerado por codigo, no build. Resolve o OG sem
// depender de ferramenta de imagem, e nunca sai do ar por link quebrado.
// runtime edge: no node, o @vercel/og resolve caminho de fonte com
// fileURLToPath e quebra em path do Windows durante o prerender do build.
export const runtime = "edge";

export const alt = `${SITE.name}, ${SITE.tagline.toLowerCase()}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0A0A0B",
          padding: "80px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Halo, o mesmo recurso visual do hero. */}
        <div
          style={{
            position: "absolute",
            top: 120,
            right: -160,
            width: 620,
            height: 620,
            borderRadius: 9999,
            background: "rgba(255,255,255,0.06)",
          }}
        />

        {/* Marca de quatro pontos, igual a do header. */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ position: "relative", width: 28, height: 28, display: "flex" }}>
            <div style={{ position: "absolute", top: 0, left: 11, width: 7, height: 7, borderRadius: 9999, background: "#FAFAFA" }} />
            <div style={{ position: "absolute", top: 11, left: 0, width: 7, height: 7, borderRadius: 9999, background: "#FAFAFA" }} />
            <div style={{ position: "absolute", top: 11, right: 0, width: 7, height: 7, borderRadius: 9999, background: "#FAFAFA" }} />
            <div style={{ position: "absolute", bottom: 0, left: 11, width: 7, height: 7, borderRadius: 9999, background: "#FAFAFA" }} />
          </div>
          <div style={{ fontSize: 26, letterSpacing: 6, color: "#FAFAFA", fontWeight: 600 }}>
            JARVIS
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 92,
              lineHeight: 1.03,
              letterSpacing: -3,
              color: "#FAFAFA",
              fontWeight: 600,
            }}
          >
            Fale. O Jarvis executa.
          </div>
          <div
            style={{
              marginTop: 28,
              fontSize: 32,
              lineHeight: 1.35,
              color: "rgba(250,250,250,0.55)",
              maxWidth: 820,
            }}
          >
            Um assistente de voz que vive no seu Windows.
          </div>
        </div>
      </div>
    ),
    size
  );
}
