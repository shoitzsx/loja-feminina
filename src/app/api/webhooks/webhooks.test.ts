import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { hmacSha256 } from "@/server/security";
import { POST as fiscalPost } from "./fiscal/route";
import { POST as paymentPost } from "./payment/route";

const SECRET = "segredo-de-teste";

function req(url: string, body: string, signatureHeader?: string, signature?: string) {
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (signatureHeader && signature) headers[signatureHeader] = signature;
  return new NextRequest(`http://localhost${url}`, { method: "POST", body, headers });
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("webhook fiscal", () => {
  it("em produção, sem segredo configurado, recusa (falha fechada)", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("FISCAL_WEBHOOK_SECRET", "");
    const response = await fiscalPost(req("/api/webhooks/fiscal", JSON.stringify({ type: "x" })));
    expect(response.status).toBe(401);
  });

  it("aceita assinatura válida", async () => {
    vi.stubEnv("FISCAL_WEBHOOK_SECRET", SECRET);
    const body = JSON.stringify({ type: "invoice.issued", orderNumber: "BC1" });
    const response = await fiscalPost(req("/api/webhooks/fiscal", body, "x-fiscal-signature", hmacSha256(body, SECRET)));
    expect(response.status).toBe(200);
  });

  it("recusa assinatura inválida", async () => {
    vi.stubEnv("FISCAL_WEBHOOK_SECRET", SECRET);
    const response = await fiscalPost(req("/api/webhooks/fiscal", "{}", "x-fiscal-signature", "00"));
    expect(response.status).toBe(401);
  });

  it("corpo que não é JSON válido devolve 400 sem detalhes internos", async () => {
    vi.stubEnv("FISCAL_WEBHOOK_SECRET", SECRET);
    const body = "isto não é json";
    const response = await fiscalPost(req("/api/webhooks/fiscal", body, "x-fiscal-signature", hmacSha256(body, SECRET)));
    expect(response.status).toBe(400);
    expect(JSON.stringify(await response.json())).not.toMatch(/SyntaxError|Unexpected|position/i);
  });

  it("não registra o evento inteiro no log", async () => {
    vi.stubEnv("FISCAL_WEBHOOK_SECRET", SECRET);
    const spy = vi.spyOn(console, "info").mockImplementation(() => undefined);
    const body = JSON.stringify({ type: "invoice.issued", customerCpf: "12345678900", customerEmail: "cliente@example.com" });
    await fiscalPost(req("/api/webhooks/fiscal", body, "x-fiscal-signature", hmacSha256(body, SECRET)));
    expect(JSON.stringify(spy.mock.calls)).not.toMatch(/12345678900|cliente@example\.com/);
  });
});

describe("webhook de pagamento", () => {
  it("corpo que não é JSON válido (com assinatura correta) devolve 400", async () => {
    vi.stubEnv("PAYMENT_WEBHOOK_SECRET", SECRET);
    const body = "{quebrado";
    const response = await paymentPost(req("/api/webhooks/payment", body, "x-payment-signature", hmacSha256(body, SECRET)));
    expect(response.status).toBe(400);
  });

  it("recusa sem assinatura em produção", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("PAYMENT_WEBHOOK_SECRET", "");
    const response = await paymentPost(req("/api/webhooks/payment", "{}"));
    expect(response.status).toBe(401);
  });

  it("evento fora do formato esperado é ignorado com 200, sem executar nada", async () => {
    vi.stubEnv("PAYMENT_WEBHOOK_SECRET", SECRET);
    const body = JSON.stringify({ type: 123, orderNumber: { x: 1 } });
    const response = await paymentPost(req("/api/webhooks/payment", body, "x-payment-signature", hmacSha256(body, SECRET)));
    expect(response.status).toBe(400);
  });
});
