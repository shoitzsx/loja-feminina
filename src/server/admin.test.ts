import { readFileSync } from "node:fs";
import { beforeEach, describe, expect, it, vi } from "vitest";

const getUser = vi.fn();
const maybeSingle = vi.fn();
const client = { auth: { getUser }, from: () => ({ select: () => ({ eq: () => ({ maybeSingle }) }) }) };

vi.mock("@/server/supabase", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/server/supabase")>()),
  createSupabaseServer: vi.fn(async () => client)
}));

import { createSupabaseServer } from "@/server/supabase";
import { hasAdminAccess, requireAdmin } from "./admin";

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(createSupabaseServer).mockResolvedValue(client as never);
});

describe("hasAdminAccess (decidido no servidor)", () => {
  it("sem sessão: não", async () => {
    getUser.mockResolvedValue({ data: { user: null }, error: { message: "no session" } });
    expect(await hasAdminAccess()).toBe(false);
  });

  it("cliente comum: não", async () => {
    getUser.mockResolvedValue({ data: { user: { id: "u1" } }, error: null });
    maybeSingle.mockResolvedValue({ data: { role: "CUSTOMER" }, error: null });
    expect(await hasAdminAccess()).toBe(false);
  });

  it("staff: não entra no painel de admin", async () => {
    getUser.mockResolvedValue({ data: { user: { id: "u1" } }, error: null });
    maybeSingle.mockResolvedValue({ data: { role: "STAFF" }, error: null });
    expect(await hasAdminAccess()).toBe(false);
  });

  it("admin: sim", async () => {
    getUser.mockResolvedValue({ data: { user: { id: "u1" } }, error: null });
    maybeSingle.mockResolvedValue({ data: { role: "ADMIN" }, error: null });
    expect(await hasAdminAccess()).toBe(true);
  });

  it("erro ao ler o perfil ou perfil ausente: não (falha fechada)", async () => {
    getUser.mockResolvedValue({ data: { user: { id: "u1" } }, error: null });
    maybeSingle.mockResolvedValue({ data: null, error: { message: "boom" } });
    expect(await hasAdminAccess()).toBe(false);
    maybeSingle.mockResolvedValue({ data: null, error: null });
    expect(await hasAdminAccess()).toBe(false);
  });

  it("Supabase não configurado: não", async () => {
    vi.mocked(createSupabaseServer).mockResolvedValue(null);
    expect(await hasAdminAccess()).toBe(false);
  });
});

describe("página /admin", () => {
  it("quem não é admin recebe 404 (a página nem revela que existe)", async () => {
    getUser.mockResolvedValue({ data: { user: null }, error: { message: "x" } });
    await expect(requireAdmin()).rejects.toThrow(/NEXT_HTTP_ERROR_FALLBACK;404|NEXT_NOT_FOUND/);
  });

  it("administrador passa sem erro", async () => {
    getUser.mockResolvedValue({ data: { user: { id: "u1" } }, error: null });
    maybeSingle.mockResolvedValue({ data: { role: "ADMIN" }, error: null });
    await expect(requireAdmin()).resolves.toBeUndefined();
  });

  it("o código fixo e a lógica de acesso no navegador não existem mais", () => {
    const src = readFileSync("src/components/admin/AdminDashboard.tsx", "utf8");
    expect(src).not.toContain("BARBS-ADMIN");
    expect(src).not.toMatch(/authorized|setAuthorized/);
  });
});
