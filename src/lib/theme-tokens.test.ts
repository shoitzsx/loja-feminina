import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const css = readFileSync("src/app/themes.css", "utf8");

const REQUIRED_TOKENS = [
  "rb-50", "rb-100", "rb-200", "rb-300", "rb-400", "rb-500", "rb-600", "rb-700", "rb-800", "rb-900",
  "plum", "blush", "gold",
  "bg", "surface", "surface-2", "text", "text-muted", "border", "accent", "on-accent",
  "radius-card", "radius-btn", "shadow-soft", "shadow-card", "shadow-glow",
  "font-display", "font-body", "page-bg", "hero-img",
  "brand-gradient", "topbar-gradient", "toast-gradient"
];

function themeBlock(): Record<string, string> {
  const match = css.match(/:root\s*\{([^}]*)\}/);
  if (!match) throw new Error("bloco :root não encontrado em themes.css");
  const tokens: Record<string, string> = {};
  for (const declaration of match[1].matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)) {
    tokens[declaration[1]] = declaration[2].trim();
  }
  return tokens;
}

function channels(value: string): [number, number, number] {
  const parts = value.split(/\s+/).map(Number);
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) throw new Error(`canais RGB inválidos: "${value}"`);
  return [parts[0], parts[1], parts[2]];
}

function luminance(value: string) {
  const [r, g, b] = channels(value).map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

describe("tokens visuais", () => {
  const t = themeBlock();

  it("define todos os tokens obrigatórios", () => {
    for (const name of REQUIRED_TOKENS) expect(t[name], `--${name}`).toBeDefined();
  });

  it("usa a paleta rosa original da loja", () => {
    expect(t["rb-500"]).toBe("255 22 137");
    expect(t["rb-600"]).toBe("230 0 119");
    for (const color of ["#ff1689", "#ff4fac", "#e60077"]) expect(t["brand-gradient"]).toContain(color);
  });

  it("usa a cena 3D como hero, cantos arredondados e Playfair nos títulos", () => {
    expect(t["hero-img"]).toContain("/images/novas/fundo-3d-cena.webp");
    expect(parseFloat(t["radius-card"])).toBeGreaterThanOrEqual(16);
    expect(t["font-display"]).toContain("--font-playfair");
    expect(t["font-body"]).toContain("--font-inter");
  });

  it("todas as imagens citadas existem em public/", () => {
    for (const [, path] of css.matchAll(/url\("(\/[^"]+)"\)/g)) {
      expect(() => readFileSync(join("public", path)), path).not.toThrow();
    }
  });

  it("contraste AA (4,5:1) em texto e no texto sobre o destaque", () => {
    expect(contrast(t.text, t.bg), "text/bg").toBeGreaterThanOrEqual(4.5);
    expect(contrast(t.text, t.surface), "text/surface").toBeGreaterThanOrEqual(4.5);
    expect(contrast(t["text-muted"], t.bg), "text-muted/bg").toBeGreaterThanOrEqual(4.5);
    expect(contrast(t["on-accent"], t.accent), "on-accent/accent").toBeGreaterThanOrEqual(4.5);
  });

  it("não há triângulos no fundo", () => {
    expect(css).not.toMatch(/conic-gradient|polygon/);
  });

  it("o anel de foco usa a cor de destaque sólida", () => {
    expect(readFileSync("src/app/globals.css", "utf8")).toContain("outline: 3px solid rgb(var(--accent))");
  });

  it("nenhum componente usa bg-white nem text-neutral fixos", () => {
    const offenders: string[] = [];
    for (const file of readdirSync("src", { recursive: true, encoding: "utf8" })) {
      if (!file.endsWith(".tsx")) continue;
      const source = readFileSync(join("src", file), "utf8");
      if (/bg-white/.test(source) || /text-neutral-/.test(source)) offenders.push(file);
    }
    expect(offenders).toEqual([]);
  });
});
