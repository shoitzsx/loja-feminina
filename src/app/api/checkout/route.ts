import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createCheckoutOrder } from "@/server/order";
import { rateLimit } from "@/server/security";

const checkoutSchema = z.object({
  customer: z.object({
    firstName: z.string().min(2),
    lastName: z.string().min(2),
    cpf: z.string().optional(),
    phone: z.string().min(8),
    email: z.string().email()
  }),
  address: z.object({
    zipCode: z.string().min(8),
    street: z.string().min(2),
    number: z.string().min(1),
    complement: z.string().optional(),
    district: z.string().min(2),
    city: z.string().min(2),
    state: z.string().min(2).max(2)
  }),
  items: z.array(
    z.object({
      productId: z.string(),
      variantId: z.string(),
      quantity: z.number().int().positive().max(20)
    })
  ).min(1),
  couponCode: z.string().optional(),
  shippingOptionId: z.string(),
  paymentMethod: z.enum(["PIX", "CREDIT_CARD", "DEBIT_CARD", "BOLETO"])
});

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "local";
  const limited = rateLimit(`checkout:${ip}`, 10, 60_000);
  if (!limited.allowed) return NextResponse.json({ error: "Muitas tentativas de checkout." }, { status: 429 });

  const body = await request.json();
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dados de checkout inválidos.", details: parsed.error.flatten() }, { status: 400 });

  try {
    const order = await createCheckoutOrder(parsed.data);
    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erro ao criar pedido." }, { status: 400 });
  }
}
