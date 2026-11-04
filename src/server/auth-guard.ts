import { NextResponse } from "next/server";
import { MemoryRateLimitStore, checkLimit, clientIp, getRateLimitStore, hashKey, type RateLimitStore } from "./rate-limit";
import { verifyTurnstile } from "./turnstile";

type GuardOptions = {
  action: "login" | "register" | "recover" | "suggestion" | "checkout";
  /** Identificador da conta alvo (e-mail). Vazio quando não se aplica. */
  account?: string;
  token?: string | null;
  store?: RateLimitStore;
};

const WINDOW_MS = 15 * 60_000;
const ACCOUNT_LIMIT = 5;
const IP_LIMIT = 30;

function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

/**
 * Porta de entrada das rotas sensíveis. Devolve uma resposta de erro, ou null se pode seguir.
 * Ordem: origem → limite por IP → Turnstile → limite por conta. Mensagens genéricas.
 */
export async function guardAuth(request: Request, options: GuardOptions): Promise<NextResponse | null> {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Requisição não permitida." }, { status: 403 });

  const store = options.store ?? (await getRateLimitStore().catch(() => new MemoryRateLimitStore()));
  const ip = clientIp(request);

  const byIp = await checkLimit(store, `${options.action}:ip:${ip}`, IP_LIMIT, WINDOW_MS);
  if (!byIp.allowed) return tooMany(byIp.retryAfterSeconds);

  const captcha = await verifyTurnstile(options.token, ip);
  if (!captcha.ok) {
    if (captcha.reason === "unavailable") return NextResponse.json({ error: "Serviço temporariamente indisponível. Tente novamente em instantes." }, { status: 503 });
    return NextResponse.json({ error: "Não foi possível confirmar que você não é um robô. Tente novamente." }, { status: 400 });
  }

  if (options.account) {
    const byAccount = await checkLimit(store, `${options.action}:acct:${hashKey(options.account)}`, ACCOUNT_LIMIT, WINDOW_MS);
    if (!byAccount.allowed) return tooMany(byAccount.retryAfterSeconds);
  }
  return null;
}

function tooMany(retryAfterSeconds: number) {
  return NextResponse.json({ error: "Muitas tentativas. Aguarde um pouco antes de tentar novamente." }, { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } });
}
