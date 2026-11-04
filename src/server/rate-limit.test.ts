import { describe, expect, it } from "vitest";
import { MemoryRateLimitStore, checkLimit, clientIp, hashKey } from "./rate-limit";

describe("checkLimit", () => {
  it("permite até o limite e bloqueia depois, com tempo de espera", async () => {
    const store = new MemoryRateLimitStore(() => 1000);
    for (let i = 0; i < 3; i++) expect((await checkLimit(store, "k", 3, 60_000)).allowed).toBe(true);
    const blocked = await checkLimit(store, "k", 3, 60_000);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("chaves diferentes não se misturam", async () => {
    const store = new MemoryRateLimitStore(() => 1000);
    await checkLimit(store, "a", 1, 60_000);
    expect((await checkLimit(store, "b", 1, 60_000)).allowed).toBe(true);
  });

  it("a janela expira e o contador reinicia", async () => {
    let now = 1000;
    const store = new MemoryRateLimitStore(() => now);
    await checkLimit(store, "k", 1, 1000);
    expect((await checkLimit(store, "k", 1, 1000)).allowed).toBe(false);
    now += 1001;
    expect((await checkLimit(store, "k", 1, 1000)).allowed).toBe(true);
  });
});

describe("clientIp e hashKey", () => {
  it("usa o primeiro IP de x-forwarded-for", () => {
    const req = new Request("http://x", { headers: { "x-forwarded-for": "1.2.3.4, 5.6.7.8" } });
    expect(clientIp(req)).toBe("1.2.3.4");
  });
  it("sem cabeçalho: valor fixo, nunca vazio", () => {
    expect(clientIp(new Request("http://x"))).toBe("unknown");
  });
  it("hashKey não guarda o e-mail em claro e ignora maiúsculas", () => {
    expect(hashKey("Maria@Example.com")).toBe(hashKey("maria@example.com"));
    expect(hashKey("maria@example.com")).not.toContain("maria");
  });
});
