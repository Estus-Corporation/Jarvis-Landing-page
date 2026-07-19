import { ImageResponse } from "next/og";

// Favicon gerado a partir da mesma marca de quatro pontos do header.
// runtime edge pelo mesmo motivo do opengraph-image.
export const runtime = "edge";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  const dot = {
    position: "absolute" as const,
    width: 6,
    height: 6,
    borderRadius: 9999,
    background: "#FAFAFA",
  };

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: "#0A0A0B",
        }}
      >
        <div style={{ ...dot, top: 4, left: 13 }} />
        <div style={{ ...dot, top: 13, left: 4 }} />
        <div style={{ ...dot, top: 13, right: 4 }} />
        <div style={{ ...dot, bottom: 4, left: 13 }} />
      </div>
    ),
    size
  );
}
