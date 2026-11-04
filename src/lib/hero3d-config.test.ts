import { describe, expect, it } from "vitest";
import { dprFor, shouldRender3D } from "./hero3d-config";

const ok = { theme: "vitrine-3d", prefersReducedMotion: false, hasWebGL: true } as const;

describe("shouldRender3D", () => {
  it("renderiza no tema vitrine-3d com WebGL e movimento normal", () => {
    expect(shouldRender3D(ok)).toBe(true);
  });

  it("não renderiza nos outros temas", () => {
    for (const theme of ["vibrante", "editorial", "escuro"] as const) {
      expect(shouldRender3D({ ...ok, theme }), theme).toBe(false);
    }
  });

  it("não renderiza com movimento reduzido", () => {
    expect(shouldRender3D({ ...ok, prefersReducedMotion: true })).toBe(false);
  });

  it("não renderiza sem WebGL", () => {
    expect(shouldRender3D({ ...ok, hasWebGL: false })).toBe(false);
  });
});

describe("dprFor", () => {
  it("usa 1 em celular estreito e no máximo 1,5 nas telas maiores", () => {
    expect(dprFor(390)).toBe(1);
    expect(dprFor(1280)).toBe(1.5);
  });
});
