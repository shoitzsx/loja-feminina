import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

const body = {
  customer: { firstName: "Ana", lastName: "Silva", phone: "42999999999", email: "ana@example.com" },
  address: { zipCode: "84000000", street: "Rua A", number: "1", district: "Centro", city: "Ponta Grossa", state: "PR" },
  items: [{ productId: "p", variantId: "v", quantity: 1 }],
  shippingOptionId: "standard",
  paymentMethod: "PIX"
};

let n = 0;
function post(extra: Record<string, unknown> = {}) {
  return new NextRequest("http://localhost/api/checkout", {
    method: "POST",
    body: JSON.stringify({ ...body, ...extra }),
    headers: { "content-type": "application/json", host: "localhost", "x-forwarded-for": `8.8.${n++}.1` }
  });
}

describe("checkout com Turnstile", () => {
  it("sem token (com segredo configurado): 400 e nenhum pedido é criado", async () => {
    vi.stubEnv("TURNSTILE_SECRET_KEY", "s");
    const order = await import("@/server/order");
    const spy = vi.spyOn(order, "createCheckoutOrder");
    const res = await POST(post());
    expect(res.status).toBe(400);
    expect(spy).not.toHaveBeenCalled();
  });

  it("token válido: segue para criar o pedido", async () => {
    vi.stubEnv("TURNSTILE_SECRET_KEY", "s");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ success: true }) }));
    const order = await import("@/server/order");
    const spy = vi.spyOn(order, "createCheckoutOrder").mockResolvedValue({ orderNumber: "BC1", confirmation: "ok" } as never);
    const res = await POST(post({ turnstileToken: "tok" }));
    expect(res.status).toBe(201);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("o token não é repassado ao pedido", async () => {
    vi.stubEnv("TURNSTILE_SECRET_KEY", "");
    const order = await import("@/server/order");
    const spy = vi.spyOn(order, "createCheckoutOrder").mockResolvedValue({ orderNumber: "BC1", confirmation: "ok" } as never);
    await POST(post({ turnstileToken: "tok" }));
    expect(JSON.stringify(spy.mock.calls[0][0])).not.toContain("turnstileToken");
  });
});
