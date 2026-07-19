// Compartilhado entre a secao visivel e o JSON-LD da pagina. Mantido em um
// lugar so de proposito: dado estruturado que nao bate com o texto visivel e
// tratado como conteudo enganoso pelo Google.
//
// Toda resposta aqui deriva do que a pagina ja afirma em outra secao.
export const faqs = [
  {
    q: "Em quais versões do Windows funciona?",
    a: "Windows 10 e Windows 11. A configuração leva alguns minutos e não exige conhecimento técnico.",
  },
  {
    q: "Preciso decorar comandos?",
    a: "Não. Você fala como falaria com uma pessoa. O Jarvis interpreta a intenção e decide sozinho quais ferramentas o pedido exige.",
  },
  {
    q: "Como funciona a voz clonada?",
    a: "A síntese é treinada em uma amostra da sua própria fala, então a resposta sai na sua voz e não em uma voz genérica de catálogo.",
  },
  {
    q: "Dá para mudar a palavra de ativação?",
    a: "Sim. A palavra de ativação e o atalho global são configuráveis, e você escolhe se prefere ativar pela voz ou pelo teclado.",
  },
  {
    q: "Ele lembra do que eu falei antes?",
    a: "Sim, no plano Pro. A memória persistente guarda fatos e preferências que você contou e usa esse contexto nas conversas seguintes.",
  },
  {
    q: "Posso cancelar quando quiser?",
    a: "Pode, sem multa. O plano Grátis continua disponível para sempre, e a licença vitalícia é pagamento único.",
  },
] as const;
