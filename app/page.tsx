import Header from "@/components/Header";
import Hero from "@/components/Hero";
import FeatureTicker from "@/components/FeatureTicker";
import Organization from "@/components/Organization";
import Features from "@/components/Features";
import Showcase from "@/components/Showcase";
import Roadmap from "@/components/Roadmap";
import Testimonials from "@/components/Testimonials";
import Pricing from "@/components/Pricing";
import Footer from "@/components/Footer";
import Grain from "@/components/ui/grain";
import { TracingBeam } from "@/components/ui/tracing-beam";
import { SITE, SITE_URL } from "@/lib/site";

// Dados estruturados do app.
//
// As ofertas espelham exatamente a tabela de precos. Nao existe mais plano
// gratuito, entao declarar price "0" aqui faria o Google anunciar um plano que
// a pagina nao vende, o que conta como dado estruturado enganoso.
//
// ATENCAO AO FIM DO LANCAMENTO: quando o mensal subir para R$ 147, este valor
// precisa subir junto. Preco no JSON-LD divergente do preco na pagina e motivo
// de penalizacao no rich result.
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: SITE.name,
  description: SITE.description,
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Windows 10, Windows 11",
  url: SITE_URL,
  author: { "@type": "Organization", name: SITE.company },
  offers: [
    {
      "@type": "Offer",
      name: "Mensal",
      price: "79",
      priceCurrency: "BRL",
      availability: "https://schema.org/InStock",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: "79",
        priceCurrency: "BRL",
        billingDuration: 1,
        billingIncrement: 1,
        unitCode: "MON",
      },
    },
    {
      "@type": "Offer",
      name: "Anual",
      price: "650",
      priceCurrency: "BRL",
      availability: "https://schema.org/InStock",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: "650",
        priceCurrency: "BRL",
        billingDuration: 12,
        billingIncrement: 12,
        unitCode: "MON",
      },
    },
  ],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="min-h-[100dvh] bg-ink-950">
        <Grain />
        <Header />
        <Hero />
        <FeatureTicker />
        {/* Barra de progresso do site (lado esquerdo/direito), do topo de
            Recursos ate o fim de Precos. */}
        <TracingBeam>
          <Features />
          <Organization />
          <Showcase />
          <Roadmap />
          <Testimonials />
          <Pricing />
        </TracingBeam>
        <Footer />
      </main>
    </>
  );
}
