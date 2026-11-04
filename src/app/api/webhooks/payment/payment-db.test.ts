import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const confirmPayment = vi.fn();
let currentDb: unknown = {};
vi.mock("@/server/db", () => ({ getDb: () => currentDb }));
vi.mock("@/server/order-repo", () => ({ confirmPayment: (...a: unknown[]) => confirmPayment(...a) }));

import { POST } from "./route";

function req(body: unknown) {
  return new NextRequest("http://localhost/api/webhooks/payment", { method: "POST", body: JSON.stringify(body), headers: { "content-type": "application/json" } });
}
const confirmed = { type: "payment.confirmed", paymentStatus: "PAID", orderNumber: "BC123", eventId: "evt_1" };

beforeEach(() => {
  vi.clearAllMocks();
  currentDb = {};
});

describe("webhook de pagamento com banco", () => {
  it("confirmação nova: aplica e responde 200", async () => {
    confirmPayment.mockResolvedValue("applied");
    const res = await POST(req(confirmed));
    expect(res.status).toBe(200);
    expect(confirmPayment).toHaveBeenCalledWith(currentDb, { provider: "gateway", eventId: "evt_1", orderNumber: "BC123" });
  });

  it("evento repetido: 200 sem reaplicar (o gateway pode reenviar)", async () => {
    confirmPayment.mockResolvedValue("duplicate");
    const res = await POST(req(confirmed));
    expect(res.status).toBe(200);
    expect((await res.json()).duplicate).toBe(true);
  });

  it("confirmação sem eventId: 400 (sem como garantir idempotência)", async () => {
    const res = await POST(req({ ...confirmed, eventId: undefined }));
    expect(res.status).toBe(400);
    expect(confirmPayment).not.toHaveBeenCalled();
  });

  it("falha do banco: 500 genérico, para o gateway tentar de novo", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    confirmPayment.mockRejectedValue(new Error("conexao com db.internal"));
    const res = await POST(req(confirmed));
    expect(res.status).toBe(500);
    expect(JSON.stringify(await res.json())).not.toContain("db.internal");
  });
});
