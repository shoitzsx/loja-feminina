import { describe, expect, it } from "vitest";
import { DEFAULT_THEME, THEME_IDS, THEME_STORAGE_KEY, isThemeId, resolveTheme, themeInitScript } from "./theme";

type Stubs = { search?: string; stored?: string | null; storageThrows?: boolean };

function runInitScript({ search = "", stored = null, storageThrows = false }: Stubs) {
  const document = { documentElement: { dataset: {} as Record<string, string> } };
  const localStorage = {
    getItem: (key: string) => {
      if (storageThrows) throw new Error("SecurityError");
      return key === THEME_STORAGE_KEY ? stored : null;
    }
  };
  new Function("document", "localStorage", "location", themeInitScript())(document, localStorage, { search });
  return document.documentElement.dataset.theme;
}

describe("resolveTheme", () => {
  it("a URL vence o valor salvo", () => {
    expect(resolveTheme({ search: "?tema=escuro", stored: "editorial" })).toBe("escuro");
  });

  it("usa o valor salvo quando não há tema na URL", () => {
    expect(resolveTheme({ stored: "editorial" })).toBe("editorial");
  });

  it("ignora tema inválido na URL e usa o salvo", () => {
    expect(resolveTheme({ search: "?tema=xyz", stored: "editorial" })).toBe("editorial");
  });

  it("cai no padrão quando URL e valor salvo são inválidos", () => {
    expect(resolveTheme({ search: "?tema=xyz", stored: "lixo" })).toBe(DEFAULT_THEME);
  });

  it("o padrão é vibrante", () => {
    expect(resolveTheme({})).toBe("vibrante");
    expect(DEFAULT_THEME).toBe("vibrante");
  });
});

describe("isThemeId", () => {
  it("aceita os 4 ids e recusa o resto", () => {
    expect(THEME_IDS).toEqual(["vibrante", "editorial", "vitrine-3d", "escuro"]);
    for (const id of THEME_IDS) expect(isThemeId(id)).toBe(true);
    expect(isThemeId("outro")).toBe(false);
    expect(isThemeId(undefined)).toBe(false);
  });
});

describe("themeInitScript", () => {
  it("aplica o tema da URL", () => {
    expect(runInitScript({ search: "?tema=escuro" })).toBe("escuro");
  });

  it("não quebra com localStorage bloqueado e cai no padrão", () => {
    expect(runInitScript({ storageThrows: true })).toBe("vibrante");
  });

  it("concorda com resolveTheme em todos os casos", () => {
    const cases: Stubs[] = [
      { search: "?tema=escuro", stored: "editorial" },
      { stored: "vitrine-3d" },
      { search: "?tema=xyz", stored: "editorial" },
      { search: "?tema=xyz", stored: "lixo" },
      {}
    ];
    for (const c of cases) {
      expect(runInitScript(c), JSON.stringify(c)).toBe(resolveTheme({ search: c.search, stored: c.stored }));
    }
  });
});
