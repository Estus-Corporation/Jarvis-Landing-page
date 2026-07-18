import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Jarvis — Seu agente de IA",
  description:
    "Jarvis é o agente de IA que automatiza tarefas, executa código e trabalha por você, com a precisão de um assistente pessoal e a potência de um dev sênior.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body className="bg-black font-sans antialiased">{children}</body>
    </html>
  );
}
