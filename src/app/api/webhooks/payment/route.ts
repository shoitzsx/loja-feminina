import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyPaymentWebhook } from "@/server/integrations/payment";

const paymentEventSchema = z.object({
  type: z.string().max(100).optional(),
  orderNumber: z.string().max(50).optional(),
  paymentStatus: z.string().max(50).optional()
});

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-payment-signature");

  if (!verifyPaymentWebhook(rawBody, signature)) {
    return NextResponse.json({ error: "Assinatura inválida." }, { status: 401 });
  }

  let parsed: z.SafeParseReturnType<unknown, z.infer<typeof paymentEventSchema>>;
  try {
    parsed = paymentEventSchema.safeParse(JSON.parse(rawBody));
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }
  if (!parsed.success) return NextResponse.json({ error: "Evento inválido." }, { status: 400 });
  const event = parsed.data;

  if (event.type === "payment.confirmed" && event.paymentStatus === "PAID") {
    console.info("[payment:webhook] Confirmed paid order", event.orderNumber);
    return NextResponse.json({
      received: true,
      nextSteps: [
        "Atualizar pedido como pago no banco",
        "Baixar estoque da variação",
        "Enviar e-mail ao administrador",
        "Enviar WhatsApp Business quando configurado",
        "Solicitar emissão fiscal"
      ]
    });
  }

  return NextResponse.json({ received: true });
}
