import { describe, expect, it, vi } from "vitest";
import { confirmPayment, findOrderForGuest, hashGuestToken, listOrdersForUser, newGuestToken, saveOrder, type OrderRepoDb } from "./order-repo";

function fakeDb(overrides: Record<string, unknown> = {}) {
  const db = {
    order: { create: vi.fn(async (a: unknown) => a), findMany: vi.fn(async () => []), findFirst: vi.fn(async () => null), updateMany: vi.fn(async () => ({ count: 1 })) },
    payment: { updateMany: vi.fn(async () => ({ count: 1 })) },
    webhookEvent: { create: vi.fn(async () => ({})) },
    $transaction: vi.fn(async (fn: (tx: unknown) => unknown) => fn(db)),
    ...overrides
  };
  return db as unknown as OrderRepoDb & typeof db;
}

type SavedData = Record<string, unknown> & { items: { create: Record<string, unknown>[] }; payments: { create: Record<string, unknown> } };

const input = {
  orderNumber: "BC123",
  userId: "u1" as string | null,
  guestTokenHash: null as string | null,
  customerName: "Ana Silva",
  customerEmail: "ana@example.com",
  customerPhoneEncrypted: "enc",
  shippingAddress: { street: "Rua A" },
  shippingMethod: "standard",
  paymentMethod: "PIX" as const,
  provider: "mock",
  providerRef: "mock_BC123",
  subtotal: 239.9,
  discount: 10,
  shipping: 19.9,
  total: 249.8,
  items: [{ slug: "vestido", name: "Vestido", sku: "V-P", size: "P", color: "Rosa", quantity: 1, unitPrice: 239.9, subtotal: 239.9 }]
};

describe("saveOrder", () => {
  it("grava em centavos, com itens e pagamento pendente, sem CPF", async () => {
    const db = fakeDb();
    await saveOrder(db, input);
    const data = (db.order.create.mock.calls[0] as unknown as [{ data: SavedData }])[0].data;
    expect(data.totalCents).toBe(24980);
    expect(data.subtotalCents).toBe(23990);
    expect(data.discountCents).toBe(1000);
    expect(data.shippingCents).toBe(1990);
    expect(data.userId).toBe("u1");
    expect(data.items.create[0]).toMatchObject({ productSlug: "vestido", unitPriceCents: 23990, totalCents: 23990, quantity: 1 });
    expect(data.payments.create).toMatchObject({ method: "PIX", status: "PENDING", amountCents: 24980, providerRef: "mock_BC123" });
    expect(JSON.stringify(data)).not.toMatch(/cpf/i);
  });

  it("pedido sem dono nem token de convidado é recusado", async () => {
    await expect(saveOrder(fakeDb(), { ...input, userId: null, guestTokenHash: null })).rejects.toThrow();
  });
});

describe("listOrdersForUser (Minha conta só do dono)", () => {
  it("filtra SEMPRE pelo usuário da sessão", async () => {
    const db = fakeDb();
    await listOrdersForUser(db, "u1");
    expect(db.order.findMany.mock.calls[0]).toEqual([expect.objectContaining({ where: { userId: "u1" } })]);
  });

  it("sem ID de usuário: erro (nunca lista tudo)", async () => {
    await expect(listOrdersForUser(fakeDb(), "")).rejects.toThrow();
  });
});

describe("convidado", () => {
  it("token aleatório e longo; só o hash é guardado/consultado", async () => {
    const t = newGuestToken();
    expect(t.length).toBeGreaterThanOrEqual(40);
    expect(newGuestToken()).not.toBe(t);
    expect(hashGuestToken(t)).not.toContain(t);
    const db = fakeDb();
    await findOrderForGuest(db, "BC123", t);
    expect(db.order.findFirst.mock.calls[0]).toEqual([expect.objectContaining({ where: { orderNumber: "BC123", guestTokenHash: hashGuestToken(t) } })]);
  });

  it("token vazio: não consulta o banco", async () => {
    const db = fakeDb();
    expect(await findOrderForGuest(db, "BC123", "")).toBeNull();
    expect(db.order.findFirst).not.toHaveBeenCalled();
  });
});

describe("confirmPayment (webhook idempotente)", () => {
  it("evento novo: marca o pedido e o pagamento como pagos", async () => {
    const db = fakeDb();
    expect(await confirmPayment(db, { provider: "mock", eventId: "e1", orderNumber: "BC123" })).toBe("applied");
    expect(db.order.updateMany.mock.calls[0]).toEqual([expect.objectContaining({ where: { orderNumber: "BC123", status: "PENDING_PAYMENT" } })]);
  });

  it("mesmo evento repetido (violação de unicidade): não aplica de novo", async () => {
    const db = fakeDb({ webhookEvent: { create: vi.fn(async () => { throw Object.assign(new Error("dup"), { code: "P2002" }); }) } });
    expect(await confirmPayment(db, { provider: "mock", eventId: "e1", orderNumber: "BC123" })).toBe("duplicate");
    expect(db.order.updateMany).not.toHaveBeenCalled();
  });

  it("pedido inexistente ou já pago: não regride nem cria nada", async () => {
    const db = fakeDb({ order: { updateMany: vi.fn(async () => ({ count: 0 })) } });
    expect(await confirmPayment(db, { provider: "mock", eventId: "e2", orderNumber: "NOPE" })).toBe("not_found");
  });

  it("erro inesperado do banco é propagado (o webhook responde 500 e o gateway tenta de novo)", async () => {
    const db = fakeDb({ webhookEvent: { create: vi.fn(async () => { throw new Error("conexao"); }) } });
    await expect(confirmPayment(db, { provider: "mock", eventId: "e3", orderNumber: "BC1" })).rejects.toThrow("conexao");
  });
});
