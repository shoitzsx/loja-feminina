import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { middleware } from "./middleware";

afterEach(() => vi.unstubAllEnvs());

describe("cabeçalhos de segurança", () => {
  it("envia HSTS em produção mesmo sem x-forwarded-proto", () => {
    vi.stubEnv("NODE_ENV", "production");
    const response = middleware(new NextRequest("http://localhost/"));
    expect(response.headers.get("Strict-Transport-Security")).toContain("max-age=31536000");
  });

  it("não envia HSTS em desenvolvimento (localhost em http)", () => {
    vi.stubEnv("NODE_ENV", "development");
    const response = middleware(new NextRequest("http://localhost/"));
    expect(response.headers.get("Strict-Transport-Security")).toBeNull();
  });

  it("envia CSP em modo relatório, sem quebrar o site", () => {
    const csp = middleware(new NextRequest("http://localhost/")).headers.get("Content-Security-Policy-Report-Only") ?? "";
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("base-uri 'self'");
  });

  it("mantém os cabeçalhos que já existiam", () => {
    const headers = middleware(new NextRequest("http://localhost/")).headers;
    expect(headers.get("X-Frame-Options")).toBe("DENY");
    expect(headers.get("X-Content-Type-Options")).toBe("nosniff");
  });
});
