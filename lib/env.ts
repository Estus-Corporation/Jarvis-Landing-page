// Le uma variavel de ambiente obrigatoria.
//
// Sempre chamada DENTRO de funcao, nunca no topo do modulo: as rotas de
// checkout sao avaliadas durante `next build`, quando os segredos de producao
// nao existem no processo. Ler no topo quebraria o build inteiro por causa de
// uma chave que so faz falta em runtime.
export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Variavel de ambiente ausente: ${name}. Defina-a no .env.local (dev) ou em Project Settings > Environment Variables (Vercel).`
    );
  }
  return value;
}
