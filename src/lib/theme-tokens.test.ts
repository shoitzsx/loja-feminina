import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { THEME_IDS, type ThemeId } from "./theme";

const css = readFileSync("src/app/themes.css", "utf8");

const REQUIRED_TOKENS = [
  "rb-50", "rb-100", "rb-200", "rb-300", "rb-400", "rb-500", "rb-600", "rb-700", "rb-800", "rb-900",
  "plum", "blush", "gold",
  "bg", "surface", "surface-2", "text", "text-muted", "border", "accent", "on-accent",
  "radius-card", "radius-btn", "shadow-soft", "shadow-card", "shadow-glow",
  "font-display", "font-body", "page-bg", "hero-img",
  "brand-gradient", "topbar-gradient", "toast-gradient"
];

function themeBlock(id: ThemeId): Record<string, string> {
  const match = css.match(new RegExp(`\\[data-theme="${id}"\\]\\s*\\{([^}]*)\\}`));
  if (!match) throw new Error(`bloco do tema ${id} não encontrado em themes.css`);
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

describe("tokens de tema", () => {
  it("cada tema define todos os tokens obrigatórios", () => {
    for (const id of THEME_IDS) {
      const tokens = themeBlock(id);
      for (const name of REQUIRED_TOKENS) {
        expect(tokens[name], `${id}: --${name}`).toBeDefined();
      }
    }
  });

  it("o tema vibrante também vale em :root", () => {
    expect(css).toMatch(/:root,\s*\[data-theme="vibrante"\]\s*\{/);
  });

  it("vibrante reproduz a paleta atual", () => {
    const vibrante = themeBlock("vibrante");
    expect(vibrante["rb-500"]).toBe("255 22 137");
    expect(vibrante["rb-600"]).toBe("230 0 119");
    for (const color of ["#ff1689", "#ff4fac", "#e60077"]) {
      expect(vibrante["brand-gradient"]).toContain(color);
    }
  });

  it("nenhum tema usa o degradê de triângulos", () => {
    const globals = readFileSync("src/app/globals.css", "utf8");
    for (const source of [css, globals]) {
      expect(source).not.toContain("rgba(255, 22, 137, 0.08) 0 12%");
    }
    expect(themeBlock("vibrante")["page-bg-size"]).toBe("auto");
  });

  it("o hero do vibrante usa a imagem nova", () => {
    expect(themeBlock("vibrante")["hero-img"]).toContain("/images/novas/hero-novo.webp");
  });

  it("editorial usa Playfair nos títulos e raio pequeno", () => {
    const editorial = themeBlock("editorial");
    expect(editorial["font-display"]).toContain("--font-playfair");
    expect(parseFloat(editorial["radius-card"])).toBeLessThanOrEqual(4);
    expect(parseFloat(editorial["radius-btn"])).toBeLessThanOrEqual(4);
  });

  it("editorial usa a imagem de fundo e o hero novos", () => {
    const editorial = themeBlock("editorial");
    expect(editorial["page-bg"]).toContain("/images/novas/fundo-editorial.webp");
    expect(editorial["hero-img"]).toContain("/images/novas/hero-novo.webp");
  });

  it("contraste AA (4,5:1) em todos os temas", () => {
    for (const id of THEME_IDS) {
      const t = themeBlock(id);
      expect(contrast(t.text, t.bg), `${id}: text/bg`).toBeGreaterThanOrEqual(4.5);
      expect(contrast(t.text, t.surface), `${id}: text/surface`).toBeGreaterThanOrEqual(4.5);
      expect(contrast(t["text-muted"], t.bg), `${id}: text-muted/bg`).toBeGreaterThanOrEqual(4.5);
      expect(contrast(t["on-accent"], t.accent), `${id}: on-accent/accent`).toBeGreaterThanOrEqual(4.5);
    }
  });
});
