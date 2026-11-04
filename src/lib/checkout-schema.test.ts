import { describe, expect, it } from "vitest";
import { checkoutSchema } from "./checkout-schema";

const base = {
  customer: { firstName: "Ana", lastName: "Silva", phone: "42999999999", email: "ana@example.com" },
  address: { zipCode: "84000000", street: "Rua A", number: "1", district: "Centro", city: "Ponta Grossa", state: "PR" },
  shippingOptionId: "standard",
  paymentMethod: "PIX"
};
const item = { productId: "p", variantId: "v", quantity: 1 };

describe("checkoutSchema", () => {
  it("aceita até 50 itens", () => {
    expect(checkoutSchema.safeParse({ ...base, items: Array(50).fill(item) }).success).toBe(true);
  });

  it("rejeita lista com mais de 50 itens (evita consumo de memória)", () => {
    expect(checkoutSchema.safeParse({ ...base, items: Array(51).fill(item) }).success).toBe(false);
  });

  it("limita o tamanho dos textos livres", () => {
    const longText = "a".repeat(201);
    expect(checkoutSchema.safeParse({ ...base, items: [item], customer: { ...base.customer, firstName: longText } }).success).toBe(false);
    expect(checkoutSchema.safeParse({ ...base, items: [item], couponCode: longText }).success).toBe(false);
  });

  it("rejeita boleto", () => {
    expect(checkoutSchema.safeParse({ ...base, items: [item], paymentMethod: "BOLETO" }).success).toBe(false);
  });
});
