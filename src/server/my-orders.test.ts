import { beforeEach, describe, expect, it, vi } from "vitest";

const listOrdersForUser = vi.fn();
let currentDb: unknown = {};
let currentUser: { id: string } | null = { id: "u1" };
vi.mock("./db", () => ({ getDb: () => currentDb }));
vi.mock("./supabase", () => ({ getSessionUser: async () => currentUser }));
vi.mock("./order-repo", () => ({ listOrdersForUser: (...a: unknown[]) => listOrdersForUser(...a) }));

import { getMyOrders } from "./my-orders";

beforeEach(() => {
  vi.clearAllMocks();
  currentDb = {};
  currentUser = { id: "u1" };
});

describe("getMyOrders (Meus pedidos só do dono)", () => {
  it("sem banco neste ambiente: indisponível (a página mostra o exemplo)", async () => {
    currentDb = null;
    expect((await getMyOrders()).status).toBe("unavailable");
  });

  it("sem sessão: anônimo, e o banco nem é consultado", async () => {
    currentUser = null;
    expect((await getMyOrders()).status).toBe("anonymous");
    expect(listOrdersForUser).not.toHaveBeenCalled();
  });

  it("com sessão: lista usando SÓ o ID da sessão e devolve só o resumo", async () => {
    listOrdersForUser.mockResolvedValue([
      { orderNumber: "BC1", createdAt: new Date("2026-11-04T10:00:00Z"), status: "PAID", totalCents: 24980, customerEmail: "x@y.com", items: [{ productName: "Vestido", quantity: 2, size: "P" }] }
    ]);
    const result = await getMyOrders();
    expect(listOrdersForUser).toHaveBeenCalledWith(currentDb, "u1");
    expect(result.status).toBe("ok");
    if (result.status === "ok") {
      expect(result.orders[0]).toEqual({ number: "BC1", date: "2026-11-04T10:00:00.000Z", status: "PAID", totalCents: 24980, items: "2x Vestido (P)" });
      expect(JSON.stringify(result)).not.toContain("x@y.com");
    }
  });

  it("erro do banco: indisponível (sem vazar detalhe)", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    listOrdersForUser.mockRejectedValue(new Error("db.internal falhou"));
    const result = await getMyOrders();
    expect(result.status).toBe("unavailable");
  });
});
