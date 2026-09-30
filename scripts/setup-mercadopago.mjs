// Cria o PLANO de assinatura do Jarvis Mensal no Mercado Pago.
//
// Roda UMA VEZ por ambiente (teste e producao tem contas e planos separados).
// O ID que ele imprime vai para MP_PREAPPROVAL_PLAN_ID — sem isso a rota
// /api/checkout/mensal nao tem pra onde mandar o comprador.
//
//   MP_ACCESS_TOKEN=... NEXT_PUBLIC_SITE_URL=https://seusite.com \
//     node scripts/setup-mercadopago.mjs            → plano normal (R$ 110)
//   ... node scripts/setup-mercadopago.mjs fundador   → plano de fundador (R$ 79)
//
// O de fundador vai para MP_PREAPPROVAL_PLAN_ID_FOUNDER (ver lib/plans.ts).
//
// O plano nao e criado a cada clique de proposito: seria um plano novo no
// painel por visitante. Ele e um molde, criado uma vez e reusado por todos.

import { MercadoPagoConfig, PreApprovalPlan } from "mercadopago";

const accessToken = process.env.MP_ACCESS_TOKEN;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

if (!accessToken || !siteUrl) {
  console.error(
    "Defina MP_ACCESS_TOKEN e NEXT_PUBLIC_SITE_URL antes de rodar este script."
  );
  process.exit(1);
}

const founder = process.argv[2] === "fundador";
const client = new MercadoPagoConfig({ accessToken });

const plan = await new PreApprovalPlan(client).create({
  body: {
    reason: founder ? "Jarvis Mensal (fundador)" : "Jarvis Mensal",
    back_url: `${siteUrl}/obrigado`,
    auto_recurring: {
      frequency: 1,
      frequency_type: "months",
      transaction_amount: founder ? 79 : 110,
      currency_id: "BRL",
    },
  },
});

console.log("\nPlano criado.\n");
console.log(
  `  MP_PREAPPROVAL_PLAN_ID${founder ? "_FOUNDER" : ""}=${plan.id}\n`
);
console.log(`  status:     ${plan.status}`);
console.log(`  init_point: ${plan.init_point}\n`);
console.log(
  "Copie a linha MP_PREAPPROVAL_PLAN_ID para o .env.local (dev) ou para as\n" +
    "variaveis de ambiente da Vercel (producao).\n"
);
