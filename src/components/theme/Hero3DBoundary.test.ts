import { describe, expect, it } from "vitest";
import { Hero3DBoundary } from "./Hero3DBoundary";

describe("Hero3DBoundary", () => {
  it("vira estado de erro quando o 3D lança (textura 404, chunk, renderer)", () => {
    expect(Hero3DBoundary.getDerivedStateFromError()).toEqual({ hasError: true });
  });

  it("avisa quem o usa para cair no hero estático", () => {
    let notified = 0;
    const boundary = new Hero3DBoundary({ onError: () => notified++, children: null });
    boundary.componentDidCatch();
    expect(notified).toBe(1);
  });

  it("não renderiza nada depois do erro", () => {
    const boundary = new Hero3DBoundary({ onError: () => undefined, children: "conteudo" });
    expect(boundary.render()).toBe("conteudo");
    boundary.state = { hasError: true };
    expect(boundary.render()).toBeNull();
  });
});
