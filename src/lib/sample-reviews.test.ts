import { describe, expect, it } from "vitest";
import { initialsOf, purchaseLabel, sampleReviews } from "./sample-reviews";

describe("avaliações de exemplo", () => {
  it("formata as iniciais da autora", () => {
    expect(initialsOf("Mariana S.")).toBe("MS");
    expect(initialsOf("Camila")).toBe("C");
  });

  it("formata mês e ano da compra", () => {
    expect(purchaseLabel("2026-10")).toBe("Comprou em out/2026");
    expect(purchaseLabel("2026-01")).toBe("Comprou em jan/2026");
  });

  it("tem notas de 1 a 5 e nenhuma foto de produto", () => {
    for (const review of sampleReviews) {
      expect(review.rating).toBeGreaterThanOrEqual(1);
      expect(review.rating).toBeLessThanOrEqual(5);
      expect(Object.keys(review)).not.toContain("photos");
    }
  });
});
