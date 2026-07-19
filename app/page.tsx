import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Signals from "@/components/Signals";
import Integrations from "@/components/Integrations";
import Features from "@/components/Features";
import InAction from "@/components/InAction";
import Showcase from "@/components/Showcase";
import Voice from "@/components/Voice";
import Pricing from "@/components/Pricing";
import CallToAction from "@/components/CallToAction";
import Footer from "@/components/Footer";
import Grain from "@/components/ui/grain";
import { SITE, SITE_URL } from "@/lib/site";

// Dados estruturados do app.
//
// A oferta declara apenas o piso (o plano gratuito, que e fato). Publicar os
// valores do Pro e do vitalicio aqui faria o Google exibir preco desatualizado
// toda vez que a tabela mudasse.
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: SITE.name,
  description: SITE.description,
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Windows 10, Windows 11",
  url: SITE_URL,
  author: { "@type": "Organization", name: SITE.company },
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "BRL",
    availability: "https://schema.org/InStock",
  },
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
        <Signals />
        <Integrations />
        <Features />
        <InAction />
        <Showcase />
        <Voice />
        <Pricing />
        <CallToAction />
        <Footer />
      </main>
    </>
  );
}
