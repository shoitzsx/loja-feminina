import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { POST as checkoutPost } from "./checkout/route";
import { POST as registerPost } from "./auth/register/route";

vi.mock("@/server/supabase", async (importOriginal) => ({ ...(await importOriginal<typeof import("@/server/supabase")>()), createSupabaseServer: vi.fn(async () => ({ auth: { signUp: vi.fn(async () => ({ data: { user: { id: "1" } }, error: null })) } })) }));

afterEach(() => vi.restoreAllMocks());

function json(url: string, body: unknown) {
  return new NextRequest(`http://localhost${url}`, { method: "POST", body: JSON.stringify(body), headers: { "content-type": "application/json", "x-forwarded-for": `t-${Math.random()}` } });
}

describe("cadastro", () => {
  it("não grava nome, e-mail, telefone nem hash nos logs", async () => {
    const spy = vi.spyOn(console, "info").mockImplementation(() => undefined);
    const response = await registerPost(json("/api/auth/register", { name: "Maria Teste", email: "maria.teste@example.com", phone: "42988887777", password: "Senha#Forte123" }));
    expect(response.status).toBe(200);
    expect(JSON.stringify(spy.mock.calls)).not.toMatch(/Maria|maria\.teste|42988887777|argon2/i);
  });
});

describe("checkout", () => {
  it("dados inválidos: resposta genérica, sem detalhes do validador", async () => {
    const response = await checkoutPost(json("/api/checkout", { items: [] }));
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.details).toBeUndefined();
    expect(data.error).toBe("Dados de checkout inválidos.");
  });

  it("erro inesperado não vaza a mensagem interna", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const order = await import("@/server/order");
    vi.spyOn(order, "createCheckoutOrder").mockRejectedValue(new Error("connection to db.internal:5432 refused"));
    const body = {
      customer: { firstName: "Ana", lastName: "Silva", phone: "42999999999", email: "ana@example.com" },
      address: { zipCode: "84000000", street: "Rua A", number: "1", district: "Centro", city: "Ponta Grossa", state: "PR" },
      items: [{ productId: "p", variantId: "v", quantity: 1 }],
      shippingOptionId: "standard",
      paymentMethod: "PIX"
    };
    const response = await checkoutPost(json("/api/checkout", body));
    expect(response.status).toBe(500);
    expect(JSON.stringify(await response.json())).not.toMatch(/db\.internal|5432|refused/);
  });
});
