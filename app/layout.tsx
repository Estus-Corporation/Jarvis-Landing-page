import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Exo_2 } from "next/font/google";
import { SITE, SITE_URL } from "@/lib/site";
import "./globals.css";

// So para o titulo da Hero: peso 600/700 cobre o font-semibold usado la.
const exo2 = Exo_2({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-exo2",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE.name}, ${SITE.tagline.toLowerCase()}`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: [
    "assistente de voz",
    "Windows",
    "automação por voz",
    "voz clonada",
    "assistente de IA",
    "controle por voz",
  ],
  authors: [{ name: SITE.company }],
  creator: SITE.company,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: SITE.locale,
    url: SITE_URL,
    siteName: SITE.name,
    title: `${SITE.name}, ${SITE.tagline.toLowerCase()}`,
    description: SITE.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name}, ${SITE.tagline.toLowerCase()}`,
    description: SITE.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export const viewport: Viewport = {
  themeColor: "#0A0A0B",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pt-BR"
      className={`${GeistSans.variable} ${GeistMono.variable} ${exo2.variable}`}
    >
      <body className="bg-ink-950 font-sans antialiased">
        {/* Atalho de teclado: primeiro Tab pula o menu e vai direto ao conteudo. */}
        <a
          href="#top"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[80] focus:rounded-full focus:bg-[#FAFAFA] focus:px-5 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-ink-950"
        >
          Pular para o conteúdo
        </a>
        {children}
      </body>
    </html>
  );
}
