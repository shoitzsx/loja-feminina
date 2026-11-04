import { describe, expect, it } from "vitest";
import { dprFor, shouldRender3D } from "./hero3d-config";

const ok = { prefersReducedMotion: false, hasWebGL: true } as const;

describe("shouldRender3D", () => {
  it("renderiza com WebGL e movimento normal", () => {
    expect(shouldRender3D(ok)).toBe(true);
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
