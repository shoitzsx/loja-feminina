import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/** Cookies de sessão só do servidor: o JavaScript do navegador não consegue ler. */
export function authCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/"
  };
}

/**
 * Cliente Supabase do servidor (chave pública + cookies da sessão). Devolve null se o projeto
 * ainda não está configurado neste ambiente — as rotas respondem 503 em vez de fingir sucesso.
 */
export async function createSupabaseServer() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  const cookieStore = await cookies();
  return createServerClient(url, key, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (list) => {
        for (const { name, value, options } of list) {
          cookieStore.set(name, value, { ...options, ...authCookieOptions() });
        }
      }
    }
  });
}

/** Usuário da sessão atual (validado no servidor do Supabase). O ID NUNCA deve vir do formulário. */
export async function getSessionUser() {
  const supabase = await createSupabaseServer();
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getUser();
  return error ? null : data.user;
}

export const UNAVAILABLE_MESSAGE = "Este recurso ficará disponível em breve.";
