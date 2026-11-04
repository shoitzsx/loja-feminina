import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRateLimitStore } from "./rate-limit";
import { guardAuth } from "./auth-guard";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

function req(headers: Record<string, string> = {}) {
  return new Request("http://localhost/api/auth/login", { method: "POST", headers: { host: "localhost", "x-forwarded-for": "7.7.7.7", ...headers } });
}

describe("guardAuth", () => {
  it("origem de outro site: 403", async () => {
    const res = await guardAuth(req({ origin: "https://evil.example" }), { action: "login", account: "a@b.com", token: "t", store: new MemoryRateLimitStore() });
    expect(res?.status).toBe(403);
  });

  it("mesma origem e Turnstile ok: libera (null)", async () => {
    vi.stubEnv("TURNSTILE_SECRET_KEY", "");
    const res = await guardAuth(req({ origin: "http://localhost" }), { action: "login", account: "a@b.com", token: "t", store: new MemoryRateLimitStore() });
    expect(res).toBeNull();
  });

  it("Turnstile inválido: 400 genérico", async () => {
    vi.stubEnv("TURNSTILE_SECRET_KEY", "s");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ success: false }) }));
    const res = await guardAuth(req(), { action: "login", account: "a@b.com", token: "t", store: new MemoryRateLimitStore() });
    expect(res?.status).toBe(400);
  });

  it("Turnstile indisponível em produção: 503", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("TURNSTILE_SECRET_KEY", "");
    const res = await guardAuth(req(), { action: "login", account: "a@b.com", token: "t", store: new MemoryRateLimitStore() });
    expect(res?.status).toBe(503);
  });

  it("limite por conta: 6ª tentativa no mesmo e-mail vira 429 com Retry-After, mesmo de IPs diferentes", async () => {
    vi.stubEnv("TURNSTILE_SECRET_KEY", "");
    const store = new MemoryRateLimitStore();
    let last: Response | null = null;
    for (let i = 0; i < 6; i++) {
      last = await guardAuth(req({ "x-forwarded-for": `10.0.0.${i}` }), { action: "login", account: "Alvo@Example.com", token: "t", store });
    }
    expect(last?.status).toBe(429);
    expect(last?.headers.get("retry-after")).toBeTruthy();
  });

  it("limite por IP: muitas contas diferentes do mesmo IP também bloqueiam", async () => {
    vi.stubEnv("TURNSTILE_SECRET_KEY", "");
    const store = new MemoryRateLimitStore();
    let last: Response | null = null;
    for (let i = 0; i < 31; i++) last = await guardAuth(req(), { action: "login", account: `u${i}@x.com`, token: "t", store });
    expect(last?.status).toBe(429);
  });
});
