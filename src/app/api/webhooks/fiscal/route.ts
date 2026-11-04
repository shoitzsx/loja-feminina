import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { hmacSha256, timingSafeCompare } from "@/server/security";

const fiscalEventSchema = z.object({
  type: z.string().max(100).optional(),
  orderNumber: z.string().max(50).optional()
});

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const secret = process.env.FISCAL_WEBHOOK_SECRET;
  const signature = request.headers.get("x-fiscal-signature");

  // Sem segredo configurado, só em desenvolvimento se aceita; em produção a falta do segredo recusa (falha fechada).
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Assinatura fiscal inválida." }, { status: 401 });
    }
  } else {
    const expected = hmacSha256(rawBody, secret);
    if (!signature || !timingSafeCompare(signature, expected)) {
      return NextResponse.json({ error: "Assinatura fiscal inválida." }, { status: 401 });
    }
  }

  let parsed: z.SafeParseReturnType<unknown, z.infer<typeof fiscalEventSchema>>;
  try {
    parsed = fiscalEventSchema.safeParse(JSON.parse(rawBody));
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }
  if (!parsed.success) return NextResponse.json({ error: "Evento inválido." }, { status: 400 });

  // Só tipo e número do pedido: o evento completo pode ter CPF, e-mail e endereço.
  console.info("[fiscal:webhook] evento recebido", { type: parsed.data.type, orderNumber: parsed.data.orderNumber });
  return NextResponse.json({ received: true });
}
