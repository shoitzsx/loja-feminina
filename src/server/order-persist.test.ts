import { beforeEach, describe, expect, it, vi } from "vitest";

const create = vi.fn(async (a: unknown) => a);
const db = { order: { create } };
let currentDb: unknown = db;
vi.mock("./db", () => ({ getDb: () => currentDb }));

import { createCheckoutOrder } from "./order";
import { products } from "@/lib/data";

const variant = products[0].variants[0];
const payload = {
  customer: { firstName: "Ana", lastName: "Silva", cpf: "12345678900", phone: "42999999999", email: "ana@example.com" },
  address: { zipCode: "84000000", street: "Rua A", number: "1", district: "Centro", city: "Ponta Grossa", state: "PR" },
  items: [{ productId: products[0].id, variantId: variant.id, quantity: 1 }],
  shippingOptionId: "standard",
  paymentMethod: "PIX" as const
};

beforeEach(() => {
  vi.clearAllMocks();
  currentDb = db;
});

describe("createCheckoutOrder com banco", () => {
  it("convidado: grava o pedido com HASH do token e devolve o token uma única vez", async () => {
    const result = await createCheckoutOrder(payload, {});
    const data = (create.mock.calls[0] as unknown as [{ data: Record<string, unknown> }])[0].data;
    expect(result.guestToken).toBeTruthy();
    expect(data.guestTokenHash).toBeTruthy();
    expect(data.guestTokenHash).not.toBe(result.guestToken);
    expect(data.userId).toBeNull();
  });

  it("usuário logado: o dono vem da sessão e não há token de convidado", async () => {
    const result = await createCheckoutOrder(payload, { userId: "user-da-sessao" });
    const data = (create.mock.calls[0] as unknown as [{ data: Record<string, unknown> }])[0].data;
    expect(data.userId).toBe("user-da-sessao");
    expect(data.guestTokenHash).toBeNull();
    expect(result.guestToken).toBeUndefined();
  });

  it("não grava CPF nem telefone em claro", async () => {
    await createCheckoutOrder(payload, {});
    const text = JSON.stringify(create.mock.calls[0]);
    expect(text).not.toContain("12345678900");
    expect(text).not.toContain("42999999999");
  });

  it("falha ao gravar: o erro sobe (não confirma pedido que não foi salvo)", async () => {
    create.mockRejectedValueOnce(new Error("db caiu"));
    await expect(createCheckoutOrder(payload, {})).rejects.toThrow("db caiu");
  });
});

describe("createCheckoutOrder sem banco configurado", () => {
  it("continua funcionando como antes, sem gravar", async () => {
    currentDb = null;
    const result = await createCheckoutOrder(payload, {});
    expect(result.orderNumber).toMatch(/^BC/);
    expect(result.guestToken).toBeUndefined();
    expect(create).not.toHaveBeenCalled();
  });
});
