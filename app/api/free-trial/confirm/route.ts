// DESATIVADA. Esta rota existia só pro FreeTrialModal, que saiu do site (ver
// components/Header.tsx): o teste grátis agora começa no app, que cria a conta
// sozinho e manda o identificador da máquina. Esta rota NÃO manda esse
// identificador, então quem criasse conta por aqui furava a trava de "crédito
// grátis uma vez por máquina". Além disso era pública, sem limite de pedidos e
// sem timeout: dava pra disparar código pra qualquer e-mail (e-mail bombing).
// Se um dia o formulário voltar, precisa de rate limit, timeout e deviceId.
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST() {
  return NextResponse.json(
    { error: "O teste grátis agora começa no aplicativo. Baixe o Jarvis para testar." },
    { status: 410 }
  );
}
