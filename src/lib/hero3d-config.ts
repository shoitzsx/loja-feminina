import type { ThemeId } from "./theme";

/** O hero 3D só monta no tema vitrine-3d, com WebGL e sem preferência por movimento reduzido. */
export function shouldRender3D(input: { theme: ThemeId; prefersReducedMotion: boolean; hasWebGL: boolean }): boolean {
  return input.theme === "vitrine-3d" && !input.prefersReducedMotion && input.hasWebGL;
}

/** Densidade de pixels do canvas: 1 em celular estreito, no máximo 1,5 nas telas maiores. */
export function dprFor(viewportWidth: number): number {
  return viewportWidth < 480 ? 1 : 1.5;
}
