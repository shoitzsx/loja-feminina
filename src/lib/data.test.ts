import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { products } from "./data";

describe("imagens dos produtos", () => {
  it("todo produto aponta para arquivos que existem em public/", () => {
    for (const product of products) {
      for (const image of product.images) {
        expect(existsSync(join("public", image)), `${product.name}: ${image}`).toBe(true);
      }
    }
  });

  it("nenhum produto usa a foto de categoria como principal", () => {
    for (const product of products) {
      expect(product.images[0], product.name).toMatch(/^\/images\/novas\/produto-/);
    }
  });
});
