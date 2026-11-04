import { afterEach, describe, expect, it, vi } from "vitest";
import { verifyTurnstile } from "./turnstile";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("verifyTurnstile", () => {
  it("sem segredo em produção: falha fechada (indisponível)", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("TURNSTILE_SECRET_KEY", "");
    expect(await verifyTurnstile("tok", "1.1.1.1")).toEqual({ ok: false, reason: "unavailable" });
  });

  it("sem segredo fora de produção: pula a verificação", async () => {
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("TURNSTILE_SECRET_KEY", "");
    expect(await verifyTurnstile(undefined)).toEqual({ ok: true });
  });

  it("com segredo e sem token: recusa", async () => {
    vi.stubEnv("TURNSTILE_SECRET_KEY", "s");
    expect(await verifyTurnstile("")).toEqual({ ok: false, reason: "missing-token" });
    expect(await verifyTurnstile("x".repeat(3000))).toEqual({ ok: false, reason: "missing-token" });
  });

  it("envia segredo, token e IP à Cloudflare e aceita success=true", async () => {
    vi.stubEnv("TURNSTILE_SECRET_KEY", "segredo-de-teste");
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ success: true }) });
    vi.stubGlobal("fetch", fetchMock);
    expect(await verifyTurnstile("tok", "9.9.9.9")).toEqual({ ok: true });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://challenges.cloudflare.com/turnstile/v0/siteverify");
    const body = String(init.body);
    expect(body).toContain("secret=segredo-de-teste");
    expect(body).toContain("response=tok");
    expect(body).toContain("remoteip=9.9.9.9");
  });

  it("success=false: inválido", async () => {
    vi.stubEnv("TURNSTILE_SECRET_KEY", "s");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ success: false }) }));
    expect(await verifyTurnstile("tok")).toEqual({ ok: false, reason: "invalid" });
  });

  it("Cloudflare fora do ar: indisponível (não libera)", async () => {
    vi.stubEnv("TURNSTILE_SECRET_KEY", "s");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("rede")));
    expect(await verifyTurnstile("tok")).toEqual({ ok: false, reason: "unavailable" });
  });
});
