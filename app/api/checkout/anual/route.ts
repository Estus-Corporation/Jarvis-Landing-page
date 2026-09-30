import { NextResponse } from "next/server";
import { createAnnualCheckout } from "@/lib/mercadopago";
import { SITE_URL } from "@/lib/site";

// Ver o comentario identico em ../mensal/route.ts.
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.redirect(await createAnnualCheckout(), 303);
  } catch (error) {
    console.error("[checkout/anual] falha ao criar checkout:", error);
    return NextResponse.redirect(`${SITE_URL}/pagamento-recusado`, 303);
  }
}
