import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const auth = {
  signInWithPassword: vi.fn(),
  signUp: vi.fn(),
  resetPasswordForEmail: vi.fn(),
  signOut: vi.fn()
};
vi.mock("@/server/supabase", async (importOriginal) => ({ ...(await importOriginal<typeof import("@/server/supabase")>()), createSupabaseServer: vi.fn(async () => ({ auth })) }));

import { createSupabaseServer } from "@/server/supabase";
import { POST as login } from "./login/route";
import { POST as register } from "./register/route";
import { POST as recover } from "./recover/route";
import { POST as logout } from "./logout/route";

let n = 0;
function post(url: string, body: unknown) {
  return new NextRequest(`http://localhost${url}`, {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json", host: "localhost", "x-forwarded-for": `9.9.${n++}.1` }
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(createSupabaseServer).mockResolvedValue({ auth } as never);
});

describe("login", () => {
  it("credenciais certas: 200", async () => {
    auth.signInWithPassword.mockResolvedValue({ error: null });
    const res = await login(post("/api/auth/login", { email: "a@b.com", password: "x" }));
    expect(res.status).toBe(200);
  });

  it("credenciais erradas: 401 genérico, igual para qualquer causa", async () => {
    auth.signInWithPassword.mockResolvedValue({ error: { message: "Invalid login credentials", status: 400 } });
    const wrong = await login(post("/api/auth/login", { email: "a@b.com", password: "x" }));
    auth.signInWithPassword.mockResolvedValue({ error: { message: "Email not confirmed", status: 400 } });
    const unconfirmed = await login(post("/api/auth/login", { email: "c@d.com", password: "x" }));
    expect(wrong.status).toBe(401);
    expect(unconfirmed.status).toBe(401);
    expect(await wrong.json()).toEqual(await unconfirmed.json());
  });

  it("passa o IP e nunca devolve o e-mail ou a senha na resposta", async () => {
    auth.signInWithPassword.mockResolvedValue({ error: { message: "Invalid", status: 400 } });
    const res = await login(post("/api/auth/login", { email: "segredo@b.com", password: "SenhaSecreta1!" }));
    const text = JSON.stringify(await res.json());
    expect(text).not.toMatch(/segredo@b\.com|SenhaSecreta/);
  });

  it("Supabase não configurado: 503 em vez de fingir que logou", async () => {
    vi.mocked(createSupabaseServer).mockResolvedValue(null);
    const res = await login(post("/api/auth/login", { email: "a@b.com", password: "x" }));
    expect(res.status).toBe(503);
  });

  it("corpo inválido: 400", async () => {
    const res = await login(post("/api/auth/login", { email: "nao-e-email" }));
    expect(res.status).toBe(400);
  });
});

describe("cadastro", () => {
  const valid = { name: "Maria", email: "maria@example.com", phone: "42988887777", password: "Senha#Forte123" };

  it("e-mail novo e e-mail já existente recebem a MESMA resposta (sem revelar quem tem conta)", async () => {
    auth.signUp.mockResolvedValue({ data: { user: { id: "1" } }, error: null });
    const novo = await register(post("/api/auth/register", valid));
    auth.signUp.mockResolvedValue({ data: { user: { id: "2", identities: [] } }, error: null });
    const existente = await register(post("/api/auth/register", valid));
    expect(novo.status).toBe(existente.status);
    expect(await novo.json()).toEqual(await existente.json());
  });

  it("senha fraca: 400 sem chamar o Supabase", async () => {
    const res = await register(post("/api/auth/register", { ...valid, password: "fraca" }));
    expect(res.status).toBe(400);
    expect(auth.signUp).not.toHaveBeenCalled();
  });

  it("o papel nunca é enviado pelo cadastro (mass assignment)", async () => {
    auth.signUp.mockResolvedValue({ data: { user: { id: "1" } }, error: null });
    await register(post("/api/auth/register", { ...valid, role: "ADMIN", user_metadata: { role: "ADMIN" } }));
    expect(JSON.stringify(auth.signUp.mock.calls[0][0])).not.toMatch(/ADMIN|role/i);
  });
});

describe("recuperar senha", () => {
  it("responde igual exista ou não a conta, e mesmo se o Supabase der erro", async () => {
    auth.resetPasswordForEmail.mockResolvedValue({ error: null });
    const ok = await recover(post("/api/auth/recover", { email: "a@b.com" }));
    auth.resetPasswordForEmail.mockResolvedValue({ error: { message: "User not found", status: 400 } });
    const erro = await recover(post("/api/auth/recover", { email: "z@b.com" }));
    expect(ok.status).toBe(200);
    expect(erro.status).toBe(200);
    expect(await ok.json()).toEqual(await erro.json());
  });
});

describe("logout", () => {
  it("encerra a sessão", async () => {
    auth.signOut.mockResolvedValue({ error: null });
    const res = await logout(post("/api/auth/logout", {}));
    expect(res.status).toBe(200);
    expect(auth.signOut).toHaveBeenCalled();
  });
});
