import { NextResponse } from "next/server";
import { getMonthlyCheckout } from "@/lib/mercadopago";
import { SITE_URL } from "@/lib/site";

// Sem isto o Next 14 trata um GET de Route Handler como estatico e o congela
// no build: todo visitante receberia o MESMO link de checkout gerado uma vez,
// em vez de um novo a cada clique.
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.redirect(await getMonthlyCheckout(), 303);
  } catch (error) {
    console.error("[checkout/mensal] falha ao criar checkout:", error);
    return NextResponse.redirect(`${SITE_URL}/pagamento-recusado`, 303);
  }
}
