import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Signals from "@/components/Signals";
import Features from "@/components/Features";
import InAction from "@/components/InAction";
import Voice from "@/components/Voice";
import Pricing from "@/components/Pricing";
import Faq from "@/components/Faq";
import CallToAction from "@/components/CallToAction";
import Footer from "@/components/Footer";
import Grain from "@/components/ui/grain";
import { faqs } from "@/lib/faqs";
import { SITE, SITE_URL } from "@/lib/site";

// Dados estruturados. As perguntas vem do mesmo arquivo que a secao visivel,
// entao o que o Google le e exatamente o que a pessoa ve.
//
// A oferta declara apenas o piso (o plano gratuito, que e fato). Publicar os
// valores do Pro e do vitalicio aqui faria o Google exibir preco desatualizado
// toda vez que a tabela mudasse.
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
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
    },
    {
      "@type": "FAQPage",
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.q,
        acceptedAnswer: { "@type": "Answer", text: faq.a },
      })),
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
        <Signals />
        <Features />
        <InAction />
        <Voice />
        <Pricing />
        <Faq />
        <CallToAction />
        <Footer />
      </main>
    </>
  );
}
