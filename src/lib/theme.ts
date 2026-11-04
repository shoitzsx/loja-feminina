export const THEME_IDS = ["vibrante", "editorial", "vitrine-3d", "escuro"] as const;

export type ThemeId = (typeof THEME_IDS)[number];

export const DEFAULT_THEME: ThemeId = "vibrante";
export const THEME_STORAGE_KEY = "barbs_theme";

export const THEME_LABELS: Record<ThemeId, string> = {
  vibrante: "Vibrante",
  editorial: "Editorial",
  "vitrine-3d": "Vitrine 3D",
  escuro: "Escuro"
};

export function isThemeId(value: unknown): value is ThemeId {
  return typeof value === "string" && (THEME_IDS as readonly string[]).includes(value);
}

function themeFromSearch(search: string | undefined): string | null {
  if (!search) return null;
  return new URLSearchParams(search).get("tema");
}

/** A URL vence o valor salvo; valor inválido cai no seguinte e, por fim, no padrão. */
export function resolveTheme({ search, stored }: { search?: string; stored?: string | null }): ThemeId {
  const fromUrl = themeFromSearch(search);
  if (isThemeId(fromUrl)) return fromUrl;
  if (isThemeId(stored)) return stored;
  return DEFAULT_THEME;
}

/**
 * JavaScript autocontido para o <head>: aplica data-theme antes da primeira pintura.
 * Espelha resolveTheme (há teste de paridade) e nunca lança erro.
 */
export function themeInitScript(): string {
  return `(function(){var ids=${JSON.stringify(THEME_IDS)};var theme=${JSON.stringify(DEFAULT_THEME)};try{var q=new URLSearchParams(location.search).get("tema");var s=null;try{s=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)})}catch(e){}if(ids.indexOf(q)>-1){theme=q;try{localStorage.setItem(${JSON.stringify(THEME_STORAGE_KEY)},q)}catch(e){}}else if(ids.indexOf(s)>-1){theme=s}}catch(e){}document.documentElement.dataset.theme=theme})();`;
}
