import Header from "@/components/Header";
import Hero from "@/components/Hero";
import FeatureTicker from "@/components/FeatureTicker";
import Organization from "@/components/Organization";
import Features from "@/components/Features";
import Showcase from "@/components/Showcase";
import Roadmap from "@/components/Roadmap";
import Testimonials from "@/components/Testimonials";
import Formulario from "@/components/Formulario";
import Footer from "@/components/Footer";
import Grain from "@/components/ui/grain";
import { TracingBeam } from "@/components/ui/tracing-beam";
import { SITE, SITE_URL } from "@/lib/site";

// Dados estruturados do app.
//
// SEM "offers": a secao de Precos saiu da pagina (produto ainda nao lancou,
// site inteiro converteu pra lista de espera). Preco no JSON-LD sem preco
// nenhum visivel na pagina e o proprio "dado estruturado enganoso" que o
// comentario antigo deste bloco avisava pra evitar — quando a secao de Precos
// voltar (no lancamento), o bloco "offers" volta junto, espelhando os
// mesmos valores exibidos.
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: SITE.name,
  description: SITE.description,
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Windows 10, Windows 11",
  url: SITE_URL,
  author: { "@type": "Organization", name: SITE.company },
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
            Recursos ate o fim do Formulario (ver FINISH_SECTION_ID em
            components/ui/tracing-beam.tsx). */}
        <TracingBeam>
          <Features />
          {/* Interface antes de Organizacao: as duas trocaram de lugar, mas os
              FUNDOS ficaram onde estavam — cada secao adotou o fundo da outra
              pra ordem visual da pagina (grade + feixe, depois halo) nao mudar
              junto com o conteudo. */}
          <Showcase />
          <Organization />
          <Roadmap />
          <Testimonials />
          {/* Ultima secao da pagina: sem checkout ainda, todos os CTAs (Hero,
              header, Futuro) desaguam aqui — captura de lead no lugar de
              venda, enquanto o produto nao lanca. */}
          <Formulario />
        </TracingBeam>
        <Footer />
      </main>
    </>
  );
}
