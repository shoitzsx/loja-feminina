import { describe, expect, it } from "vitest";
import { calculateCartPricing } from "./pricing";
import type { CartLine } from "./types";

const roseMidi: CartLine = { productId: "prod_rose-midi", variantId: "var_rose-m", quantity: 1 }; // R$ 289,90 por R$ 239,90
const blouse: CartLine = { productId: "prod-white-blouse", variantId: "var_blouse-m", quantity: 1 }; // R$ 219,90
const bracelet: CartLine = { productId: "prod-bracelet-charm", variantId: "var_bracelet-charm", quantity: 1 }; // R$ 149,90
const pearlHoops: CartLine = { productId: "prod-pearl-hoops", variantId: "var_pearl-hoops", quantity: 1 }; // R$ 119,90 por R$ 99,90
const goldBangle: CartLine = { productId: "prod-gold-bangle", variantId: "var_gold-bangle", quantity: 1 }; // estoque 5

describe("calculateCartPricing", () => {
  it("usa o preço promocional e fecha a conta do resumo", () => {
    const pricing = calculateCartPricing([roseMidi]);

    expect(pricing.subtotal).toBeCloseTo(239.9, 2);
    expect(pricing.productDiscount).toBeCloseTo(50, 2);
    expect(pricing.shipping).toBeCloseTo(19.9, 2);
    // productDiscount é informativo: o subtotal já está com o preço promocional.
    expect(pricing.total).toBeCloseTo(pricing.subtotal - pricing.couponDiscount + pricing.shipping, 2);
    expect(pricing.total).toBeCloseTo(259.8, 2);
  });

  describe("cupom BARBS10 (10%, mínimo R$ 149)", () => {
    it("recusa abaixo do mínimo", () => {
      const pricing = calculateCartPricing([pearlHoops], "BARBS10");

      expect(pricing.couponDiscount).toBe(0);
      expect(pricing.couponMessage).toBe("Cupom válido para compras acima de R$ 149,00.");
    });

    it("aplica 10% quando atinge o mínimo", () => {
      const pricing = calculateCartPricing([bracelet], "BARBS10");

      expect(pricing.couponDiscount).toBeCloseTo(14.99, 2);
      expect(pricing.couponMessage).toBe("Cupom BARBS10 aplicado.");
      expect(pricing.total).toBeCloseTo(149.9 - 14.99 + 19.9, 2);
    });

    it("aceita minúsculas e espaços", () => {
      expect(calculateCartPricing([bracelet], "  barbs10 ").couponDiscount).toBeCloseTo(14.99, 2);
    });
  });

  describe("cupom GLAM20 (−R$ 20, mínimo R$ 199)", () => {
    it("recusa abaixo do mínimo", () => {
      expect(calculateCartPricing([bracelet], "GLAM20").couponDiscount).toBe(0);
    });

    it("dá −R$ 20 acima do mínimo", () => {
      const pricing = calculateCartPricing([blouse], "GLAM20");

      expect(pricing.couponDiscount).toBe(20);
      expect(pricing.total).toBeCloseTo(219.9 - 20 + 19.9, 2);
    });
  });

  it("informa cupom inexistente sem dar desconto", () => {
    const pricing = calculateCartPricing([blouse], "NAOEXISTE");

    expect(pricing.couponDiscount).toBe(0);
    expect(pricing.couponMessage).toBe("Cupom não encontrado.");
  });

  describe("frete", () => {
    it("cobra o frete escolhido abaixo de R$ 299", () => {
      expect(calculateCartPricing([blouse], undefined, "standard").shipping).toBeCloseTo(19.9, 2);
      expect(calculateCartPricing([blouse], undefined, "express").shipping).toBeCloseTo(34.9, 2);
    });

    it("é grátis a partir de R$ 299", () => {
      const pricing = calculateCartPricing([blouse, pearlHoops]); // 219,90 + 99,90 = 319,80

      expect(pricing.subtotal).toBeCloseTo(319.8, 2);
      expect(pricing.shipping).toBe(0);
      expect(pricing.total).toBeCloseTo(319.8, 2);
    });
  });

  describe("estoque e itens inválidos", () => {
    it("limita a quantidade ao estoque", () => {
      const pricing = calculateCartPricing([{ ...goldBangle, quantity: 99 }]);

      expect(pricing.lines[0].quantity).toBe(5);
      expect(pricing.subtotal).toBeCloseTo(149.9 * 5, 2);
    });

    it("descarta quantidade zero, negativa ou produto inexistente", () => {
      const pricing = calculateCartPricing([
        { ...bracelet, quantity: 0 },
        { ...bracelet, quantity: -3 },
        { productId: "inexistente", variantId: "x", quantity: 1 },
        { ...bracelet, variantId: "variante-inexistente" }
      ]);

      expect(pricing.lines).toHaveLength(0);
      expect(pricing.subtotal).toBe(0);
    });
  });
});
