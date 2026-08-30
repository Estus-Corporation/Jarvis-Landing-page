import { NextRequest, NextResponse } from "next/server";
import { requireEnv } from "@/lib/env";

// Repassa pro Credits Server em vez do navegador chamar direto: evita ter
// que abrir CORS la (que e outro dominio, outro deploy) so pra este formulario,
// e mantem o padrao ja usado pelos outros dois proxies do site (checkout,
// webhook) — tudo que fala com servico externo passa por uma rota aqui.
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  if (!email) {
    return NextResponse.json({ error: "e-mail obrigatório" }, { status: 400 });
  }

  try {
    const baseUrl = requireEnv("CREDITS_SERVER_URL");
    const upstream = await fetch(`${baseUrl}/v1/signup/request-code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await upstream.json().catch(() => ({}));
    return NextResponse.json(data, { status: upstream.status });
  } catch (error) {
    console.error("[free-trial/request-code] falha:", error);
    return NextResponse.json(
      { error: "Não foi possível enviar o código agora. Tente de novo em instantes." },
      { status: 502 }
    );
  }
}
