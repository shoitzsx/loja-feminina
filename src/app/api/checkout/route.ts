import { NextRequest, NextResponse } from "next/server";
import { checkoutSchema } from "@/lib/checkout-schema";
import { CheckoutError, createCheckoutOrder } from "@/server/order";
import { guardAuth } from "@/server/auth-guard";
import { rateLimit } from "@/server/security";
import { getSessionUser } from "@/server/supabase";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "local";
  const limited = rateLimit(`checkout:${ip}`, 10, 60_000);
  if (!limited.allowed) return NextResponse.json({ error: "Muitas tentativas de checkout." }, { status: 429 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Dados de checkout inválidos." }, { status: 400 });
  }
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dados de checkout inválidos." }, { status: 400 });

  const { turnstileToken, ...orderData } = parsed.data;
  const blocked = await guardAuth(request, { action: "checkout", token: turnstileToken });
  if (blocked) return blocked;

  try {
    // O dono do pedido vem da sessão (cookie httpOnly), nunca do corpo da requisição.
    const user = await getSessionUser().catch(() => null);
    const order = await createCheckoutOrder(orderData, { userId: user?.id });
    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    // Só mensagens pensadas para o cliente (CheckoutError) saem; o resto fica no log do servidor.
    if (error instanceof CheckoutError) return NextResponse.json({ error: error.message }, { status: 400 });
    console.error("[checkout] erro inesperado", error instanceof Error ? error.name : "desconhecido");
    return NextResponse.json({ error: "Não foi possível criar o pedido agora. Tente novamente." }, { status: 500 });
  }
}
