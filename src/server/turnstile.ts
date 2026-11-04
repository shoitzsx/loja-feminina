export type TurnstileResult = { ok: true } | { ok: false; reason: "missing-token" | "invalid" | "unavailable" };

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/**
 * Valida o token do Cloudflare Turnstile no servidor.
 * Sem segredo configurado: em produção falha fechada; fora dela pula (desenvolvimento/testes).
 * Cloudflare fora do ar ou resposta estranha: "unavailable" (nunca libera por engano).
 */
export async function verifyTurnstile(token: string | null | undefined, ip?: string): Promise<TurnstileResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    return process.env.NODE_ENV === "production" ? { ok: false, reason: "unavailable" } : { ok: true };
  }
  if (!token || token.length > 2048) return { ok: false, reason: "missing-token" };

  const body = new URLSearchParams({ secret, response: token });
  if (ip && ip !== "unknown") body.set("remoteip", ip);

  try {
    const response = await fetch(VERIFY_URL, { method: "POST", body, signal: AbortSignal.timeout(5000) });
    if (!response.ok) return { ok: false, reason: "unavailable" };
    const data = (await response.json()) as { success?: boolean };
    return data.success === true ? { ok: true } : { ok: false, reason: "invalid" };
  } catch {
    return { ok: false, reason: "unavailable" };
  }
}
