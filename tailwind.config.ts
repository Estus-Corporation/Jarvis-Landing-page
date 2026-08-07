import type { Config } from "tailwindcss";

// Sistema monocromatico com profundidade.
//
// Cor: sem acento. A hierarquia vem de camadas de off-black e de opacidade do
// texto branco. Preto puro (#000) nao e usado em lugar nenhum: ele achata a
// profundidade porque todas as camadas colapsam no mesmo plano visual.
//
// Raio: botoes = full (pill), cartoes = 20px, chips/inputs = 10px.
// Essa regra vale para a pagina inteira, sem excecao.
const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        // Breakpoint proprio para a largura maxima (shell) das secoes. Fica
        // bem acima do 2xl padrao (1536px) porque notebooks comuns (1440,
        // 1536, ate 1728 com escala do Windows) tambem caem no 2xl e nao
        // devem receber o tratamento "monitor grande": eles ficam no nivel
        // compacto (max-w-6xl) ate aqui. So telas de verdade largas passam
        // a ver a largura mestra de 1400px.
        wide: "1800px",
      },
      colors: {
        ink: {
          950: "#0A0A0B", // base da pagina
          900: "#0E0E10", // secao elevada
          800: "#141417", // cartao
          700: "#1C1C21", // cartao destacado
          600: "#26262D", // borda forte
        },
      },
      borderRadius: {
        card: "20px",
        chip: "10px",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
        // So para o titulo da Hero, per pedido.
        display: ["var(--font-exo2)", "system-ui", "sans-serif"],
      },
      maxWidth: {
        // Largura mestra de todas as secoes e do header. Alargada de 1200 para
        // 1400: em telas grandes o layout antigo deixava tudo "para dentro",
        // com margens gordas. 1400 puxa os elementos para mais perto das bordas,
        // no espirito de sites como o React Bits, sem virar largura total (os
        // blocos de texto continuam com seu proprio limite de leitura).
        shell: "1400px",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s cubic-bezier(0.16,1,0.3,1) forwards",
      },
    },
  },
  plugins: [],
};

export default config;
