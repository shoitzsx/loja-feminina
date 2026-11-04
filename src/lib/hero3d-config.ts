/** O hero 3D só monta com WebGL e sem preferência por movimento reduzido. */
export function shouldRender3D(input: { prefersReducedMotion: boolean; hasWebGL: boolean }): boolean {
  return !input.prefersReducedMotion && input.hasWebGL;
}

/** Densidade de pixels do canvas: 1 em celular estreito, no máximo 1,5 nas telas maiores. */
export function dprFor(viewportWidth: number): number {
  return viewportWidth < 480 ? 1 : 1.5;
}
