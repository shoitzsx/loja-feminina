import crypto from "crypto";

/** Armazena contadores por chave e janela. Em produção deve ser compartilhado entre instâncias (Postgres). */
export interface RateLimitStore {
  /** Registra uma tentativa e devolve quantas já houve na janela atual e quando ela termina (ms). */
  hit(key: string, windowMs: number): Promise<{ count: number; resetAt: number }>;
}

export class MemoryRateLimitStore implements RateLimitStore {
  private buckets = new Map<string, { count: number; resetAt: number }>();
  constructor(private now: () => number = Date.now) {}

  async hit(key: string, windowMs: number) {
    const now = this.now();
    const bucket = this.buckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
      const fresh = { count: 1, resetAt: now + windowMs };
      this.buckets.set(key, fresh);
      return fresh;
    }
    bucket.count += 1;
    return { ...bucket };
  }
}

export async function checkLimit(store: RateLimitStore, key: string, limit: number, windowMs: number) {
  const { count, resetAt } = await store.hit(key, windowMs);
  if (count <= limit) return { allowed: true as const, retryAfterSeconds: 0 };
  return { allowed: false as const, retryAfterSeconds: Math.max(1, Math.ceil((resetAt - Date.now()) / 1000)) };
}

export function clientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || "unknown";
}

/** Hash curto e estável (ignora maiúsculas) para não guardar e-mail em claro nas chaves de limite. */
export function hashKey(value: string) {
  return crypto.createHash("sha256").update(value.trim().toLowerCase()).digest("hex").slice(0, 32);
}

let sharedStore: RateLimitStore | undefined;

/** Postgres compartilhado quando DATABASE_URL existe; memória local caso contrário (desenvolvimento). */
export async function getRateLimitStore(): Promise<RateLimitStore> {
  if (sharedStore) return sharedStore;
  if (process.env.DATABASE_URL) {
    const { PostgresRateLimitStore } = await import("./rate-limit-pg");
    sharedStore = new PostgresRateLimitStore();
  } else {
    sharedStore = new MemoryRateLimitStore();
  }
  return sharedStore;
}
