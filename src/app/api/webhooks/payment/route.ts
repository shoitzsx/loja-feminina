import { NextRequest, NextResponse } from "next/server";
import { verifyPaymentWebhook } from "@/server/integrations/payment";

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-payment-signature");

  if (!verifyPaymentWebhook(rawBody, signature)) {
    return NextResponse.json({ error: "Assinatura inválida." }, { status: 401 });
  }

  const event = JSON.parse(rawBody) as {
    type?: string;
    orderNumber?: string;
    paymentStatus?: string;
  };

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
