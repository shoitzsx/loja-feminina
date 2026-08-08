import { NextRequest, NextResponse } from "next/server";
import { hmacSha256, timingSafeCompare } from "@/server/security";

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const secret = process.env.FISCAL_WEBHOOK_SECRET;
  const signature = request.headers.get("x-fiscal-signature");

  if (secret) {
    const expected = hmacSha256(rawBody, secret);
    if (!signature || !timingSafeCompare(signature, expected)) {
      return NextResponse.json({ error: "Assinatura fiscal inválida." }, { status: 401 });
    }
  }

  const event = JSON.parse(rawBody);
  console.info("[fiscal:webhook] Fiscal event received", event);
  return NextResponse.json({ received: true });
}
