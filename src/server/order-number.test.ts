import { describe, expect, it } from "vitest";
import { generateOrderNumber } from "./order-number";

describe("generateOrderNumber", () => {
  it("tem o formato BC + 10 caracteres", () => {
    expect(generateOrderNumber()).toMatch(/^BC[0-9A-Z]{10}$/);
  });

  it("não repete em 5000 pedidos gerados no mesmo instante", () => {
    const numbers = new Set(Array.from({ length: 5000 }, () => generateOrderNumber()));
    expect(numbers.size).toBe(5000);
  });
});
