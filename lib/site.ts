// Fonte unica de verdade para metadados, OG, sitemap e dados estruturados.
//
// TROQUE ANTES DE LANCAR: defina NEXT_PUBLIC_SITE_URL no ambiente de producao
// (na Vercel, em Project Settings > Environment Variables) com o dominio real.
// O fallback de localhost so serve para desenvolvimento: se ele for para o ar,
// as URLs canonicas e as imagens de OG apontam para lugar nenhum.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const SITE = {
  name: "Jarvis",
  tagline: "Assistente de voz para Windows",
  description:
    "Um assistente de voz que vive no seu Windows. Controla o navegador, abre programas, roda comandos de terminal e responde com a sua própria voz clonada.",
  locale: "pt_BR",
  company: "Estus Corporation",
} as const;
