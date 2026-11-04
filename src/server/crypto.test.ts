import crypto from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";
import { decryptField, encryptField } from "./crypto";

const KEY = crypto.randomBytes(32).toString("base64");

afterEach(() => vi.unstubAllEnvs());

describe("criptografia de campos pessoais (AES-256-GCM)", () => {
  it("ida e volta devolve o texto original, e o texto cifrado não contém o original", () => {
    vi.stubEnv("DATA_ENCRYPTION_KEY", KEY);
    const enc = encryptField("42999998888");
    expect(enc).not.toContain("42999998888");
    expect(decryptField(enc!)).toBe("42999998888");
  });

  it("cada cifragem é diferente (IV aleatório)", () => {
    vi.stubEnv("DATA_ENCRYPTION_KEY", KEY);
    expect(encryptField("x")).not.toBe(encryptField("x"));
  });

  it("sem chave: devolve null (nunca grava em claro)", () => {
    vi.stubEnv("DATA_ENCRYPTION_KEY", "");
    expect(encryptField("42999998888")).toBeNull();
  });

  it("chave com tamanho errado: devolve null", () => {
    vi.stubEnv("DATA_ENCRYPTION_KEY", Buffer.from("curta").toString("base64"));
    expect(encryptField("x")).toBeNull();
  });

  it("dado adulterado não decifra", () => {
    vi.stubEnv("DATA_ENCRYPTION_KEY", KEY);
    const enc = encryptField("segredo")!;
    const tampered = enc.slice(0, -2) + (enc.endsWith("AA") ? "BB" : "AA");
    expect(() => decryptField(tampered)).toThrow();
  });
});
