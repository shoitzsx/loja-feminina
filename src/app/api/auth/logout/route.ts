import { NextRequest, NextResponse } from "next/server";
import { guardAuth } from "@/server/auth-guard";
import { UNAVAILABLE_MESSAGE, createSupabaseServer } from "@/server/supabase";

export async function POST(request: NextRequest) {
  // Só confere a origem (proteção contra CSRF); sem Turnstile nem limite por conta.
  const blocked = await guardAuth(request, { action: "login", token: "logout" });
  if (blocked && blocked.status === 403) return blocked;

  const supabase = await createSupabaseServer();
  if (!supabase) return NextResponse.json({ error: UNAVAILABLE_MESSAGE }, { status: 503 });
  await supabase.auth.signOut();
  return NextResponse.json({ message: "Sessão encerrada." });
}
