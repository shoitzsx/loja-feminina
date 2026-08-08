function normalizePublicAssetPath(value: string | undefined, fallback: string) {
  const trimmed = value?.trim();
  if (!trimmed) return fallback;
  if (/^https?:\/\//i.test(trimmed)) return trimmed.replace(/\/+$/, "");
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

export const brandLogoPath = normalizePublicAssetPath(process.env.NEXT_PUBLIC_BRAND_LOGO_PATH, "/brand/logo.png");
export const brandFaviconPath = normalizePublicAssetPath(process.env.NEXT_PUBLIC_BRAND_FAVICON_PATH, "/brand/favicon.png");
