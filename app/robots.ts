import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Rotas de checkout e telas de retorno do pagamento: nao sao conteudo,
      // e uma delas indexada mandaria visitante de busca direto pra uma
      // confirmacao de compra que ele nunca fez.
      disallow: [
        "/api/",
        "/obrigado",
        "/pagamento-pendente",
        "/pagamento-recusado",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
