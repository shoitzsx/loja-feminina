import { hmacSha256, timingSafeCompare } from "../security";

export type PaymentIntentInput = {
  orderNumber: string;
  amount: number;
  customerEmail: string;
  method: "PIX" | "CREDIT_CARD" | "DEBIT_CARD" | "BOLETO";
};

export type PaymentIntent = {
  provider: string;
  providerRef: string;
  status: "PENDING" | "AUTHORIZED";
  paymentUrl?: string;
  pixQrCode?: string;
  instructions: string;
};

export async function createPaymentIntent(input: PaymentIntentInput): Promise<PaymentIntent> {
  if (process.env.PAYMENT_PROVIDER === "mock" || !process.env.PAYMENT_API_KEY) {
    return {
      provider: "mock",
      providerRef: `mock_${input.orderNumber}`,
      status: "PENDING",
      pixQrCode: input.method === "PIX" ? `000201_mock_pix_${input.orderNumber}` : undefined,
      instructions:
        "Integração preparada. Configure PAYMENT_API_KEY e implemente o provedor escolhido para tokenização e captura real."
    };
  }

  throw new Error("Payment provider credentials are configured, but the concrete gateway adapter has not been selected.");
}

export function verifyPaymentWebhook(rawBody: string, signatureHeader: string | null) {
  const secret = process.env.PAYMENT_WEBHOOK_SECRET;
  if (!secret) return process.env.NODE_ENV !== "production";
  if (!signatureHeader) return false;
  const expected = hmacSha256(rawBody, secret);
  return timingSafeCompare(signatureHeader, expected);
}
