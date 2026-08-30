import { NextRequest, NextResponse } from "next/server";
import { requireEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const code = typeof body?.code === "string" ? body.code.trim() : "";
  if (!email || !code) {
    return NextResponse.json({ error: "e-mail e código obrigatórios" }, { status: 400 });
  }

  try {
    const baseUrl = requireEnv("CREDITS_SERVER_URL");
    const upstream = await fetch(`${baseUrl}/v1/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
    });
    const data = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      return NextResponse.json(data, { status: upstream.status });
    }
    // downloadUrl sai daqui (server-side), nao vira NEXT_PUBLIC_ so pra isso —
    // mesma logica do lib/env.ts: segredo/config de deploy fica no servidor,
    // o cliente so recebe o que precisa mostrar nesta resposta especifica.
    return NextResponse.json({ ...data, downloadUrl: requireEnv("DOWNLOAD_URL") });
  } catch (error) {
    console.error("[free-trial/confirm] falha:", error);
    return NextResponse.json(
      { error: "Não foi possível confirmar agora. Tente de novo em instantes." },
      { status: 502 }
    );
  }
}
