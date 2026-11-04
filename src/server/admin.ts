import { notFound } from "next/navigation";
import { createSupabaseServer } from "@/server/supabase";

/**
 * Decide, no servidor, se a sessão atual é de um administrador.
 * O papel vem do banco (tabela profiles, lida com a sessão do próprio usuário), nunca do navegador.
 * Qualquer dúvida (sem sessão, erro, perfil ausente, Supabase não configurado) = não.
 */
export async function hasAdminAccess(): Promise<boolean> {
  const supabase = await createSupabaseServer();
  if (!supabase) return false;

  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return false;

  const { data: profile, error: profileError } = await supabase.from("profiles").select("role").eq("id", data.user.id).maybeSingle();
  if (profileError || !profile) return false;
  return profile.role === "ADMIN";
}

/** Para páginas de admin: quem não é administrador recebe 404 (a página nem revela que existe). */
export async function requireAdmin(): Promise<void> {
  if (!(await hasAdminAccess())) notFound();
}
