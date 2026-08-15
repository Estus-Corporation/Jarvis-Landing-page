import crypto from "node:crypto";
import { NextResponse } from "next/server";

// node:crypto assina o JWT da conta de servico do Google, entao esta rota
// precisa do runtime Node (nao Edge).
export const runtime = "nodejs";

// Armazenamento: Google Sheets, falado direto pela API REST.
//
// Por que planilha e nao banco: o dado dono aqui e o site, nao um terceiro
// (importa — telefone e PII e o produto e brasileiro), e uma aba de planilha
// vira, sem trabalho nenhum, tanto lista de transmissao do WhatsApp quanto
// import de contatos no Resend. Se o volume passar do que planilha aguenta,
// trocar o corpo de `append` por outro destino e o unico ponto que muda.
//
// Por que REST cru e nao o pacote `googleapis`: o pacote pesa ~100MB instalado
// pra fazer o que sao ~40 linhas aqui, e este repo nao tem NENHUMA dependencia
// de backend hoje. Assinar o JWT com node:crypto mantem isso.
const SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets";
const TOKEN_URL = "https://oauth2.googleapis.com/token";

function base64url(input: Buffer | string) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=+$/, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

async function getAccessToken(clientEmail: string, privateKey: string) {
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = base64url(
    JSON.stringify({
      iss: clientEmail,
      scope: SHEETS_SCOPE,
      aud: TOKEN_URL,
      iat: now,
      exp: now + 3600,
    })
  );

  const signature = crypto
    .createSign("RSA-SHA256")
    .update(`${header}.${claim}`)
    .sign(privateKey);

  const assertion = `${header}.${claim}.${base64url(signature)}`;

  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });

  if (!response.ok) {
    throw new Error(`token ${response.status}: ${await response.text()}`);
  }

  const data = (await response.json()) as { access_token: string };
  return data.access_token;
}

async function appendRow(row: string[]) {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  // A chave vem do painel da Vercel numa linha so, com "\n" literal no lugar
  // das quebras. Sem esta troca o OpenSSL rejeita o PEM.
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const sheetId = process.env.GOOGLE_SHEET_ID;

  if (!clientEmail || !privateKey || !sheetId) {
    throw new Error(
      "credenciais do Google ausentes (GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY, GOOGLE_SHEET_ID)"
    );
  }

  const token = await getAccessToken(clientEmail, privateKey);

  const url =
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}` +
    `/values/A:E:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ values: [row] }),
  });

  if (!response.ok) {
    throw new Error(`sheets ${response.status}: ${await response.text()}`);
  }
}

// Freio simples por IP. Vive na memoria da instancia serverless, entao NAO e
// garantia — a Vercel pode ter varias instancias vivas e elas nao se falam.
// Serve pro caso barato (um script ingenuo martelando a rota); barreira de
// verdade seria um KV/Redis, que nao se justifica no volume de uma lista de
// espera.
//
// O teto e FOLGADO de proposito. Operadora movel brasileira usa CGNAT: milhares
// de celulares saem pela MESMA rota "x-forwarded-for". Num disparo de marketing
// que va bem, apertar aqui bloquearia gente de verdade — e perder lead custa
// muito mais que aguentar algumas requisicoes a toa. Quem barra robo aqui e o
// honeypot, nao este contador.
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 30;
const hits = new Map<string, number[]>();

function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > RATE_MAX;
}

// Validacao do servidor: espelha a do formulario porque a do cliente nao vale
// nada sozinha — qualquer um manda POST direto na rota.
function validate(nome: string, whatsapp: string, email: string) {
  if (nome.trim().length < 2) return "nome";
  const digits = whatsapp.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 11) return "whatsapp";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) return "email";
  return null;
}

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";

  if (rateLimited(ip)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "json_invalido" }, { status: 400 });
  }

  const nome = String(body.nome ?? "");
  const whatsapp = String(body.whatsapp ?? "");
  const email = String(body.email ?? "");
  const website = String(body.website ?? "");

  // Honeypot preenchido = robo. Responde 200 de propósito: dizer "te barrei"
  // ensina o robo a tentar de novo sem o campo.
  if (website.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const invalid = validate(nome, whatsapp, email);
  if (invalid) {
    return NextResponse.json(
      { error: "campo_invalido", campo: invalid },
      { status: 400 }
    );
  }

  const digits = whatsapp.replace(/\D/g, "");

  try {
    await appendRow([
      new Date().toISOString(),
      nome.trim(),
      // Guardado em E.164 (+55...) e nao formatado: e o formato que WhatsApp e
      // qualquer import de contatos esperam. O bonitinho com parenteses so
      // existe na tela.
      `+55${digits}`,
      email.trim().toLowerCase(),
      "landing",
    ]);
  } catch (error) {
    // Log alto e 503: melhor a pessoa ver "tente de novo" e o erro aparecer no
    // painel da Vercel do que responder 200 e perder o lead em silencio.
    console.error("[waitlist] falha ao gravar lead:", error);
    return NextResponse.json({ error: "falha_ao_gravar" }, { status: 503 });
  }

  return NextResponse.json({ ok: true });
}
