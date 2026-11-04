import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/server/db";
import { verifyPaymentWebhook } from "@/server/integrations/payment";
import { confirmPayment } from "@/server/order-repo";

const paymentEventSchema = z.object({
  type: z.string().max(100).optional(),
  orderNumber: z.string().max(50).optional(),
  eventId: z.string().min(1).max(100).optional(),
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
    const db = getDb();
    if (db) {
      // Com banco: exige eventId (idempotência) e só avança PENDING_PAYMENT → PAID.
      if (!event.eventId || !event.orderNumber) return NextResponse.json({ error: "Evento inválido." }, { status: 400 });
      try {
        const result = await confirmPayment(db, { provider: "gateway", eventId: event.eventId, orderNumber: event.orderNumber });
        return NextResponse.json({ received: true, duplicate: result === "duplicate" });
      } catch (error) {
        console.error("[payment:webhook] falha ao gravar", error instanceof Error ? error.name : "desconhecido");
        return NextResponse.json({ error: "Falha ao processar o evento." }, { status: 500 });
      }
    }
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
