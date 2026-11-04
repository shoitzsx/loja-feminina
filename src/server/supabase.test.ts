import { afterEach, describe, expect, it, vi } from "vitest";
import { authCookieOptions } from "./supabase";

afterEach(() => vi.unstubAllEnvs());

describe("authCookieOptions", () => {
  it("cookie de sessão: httpOnly, SameSite e caminho raiz", () => {
    const o = authCookieOptions();
    expect(o.httpOnly).toBe(true);
    expect(o.sameSite).toBe("lax");
    expect(o.path).toBe("/");
  });
  it("Secure em produção", () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(authCookieOptions().secure).toBe(true);
  });
  it("não força Secure em desenvolvimento (http://localhost)", () => {
    vi.stubEnv("NODE_ENV", "development");
    expect(authCookieOptions().secure).toBe(false);
  });
});
