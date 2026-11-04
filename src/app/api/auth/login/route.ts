import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { guardAuth } from "@/server/auth-guard";
import { UNAVAILABLE_MESSAGE, createSupabaseServer } from "@/server/supabase";

const loginSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(1).max(200),
  turnstileToken: z.string().max(2048).optional()
});

export async function POST(request: NextRequest) {
  const parsed = loginSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "E-mail ou senha inválidos." }, { status: 400 });

  const blocked = await guardAuth(request, { action: "login", account: parsed.data.email, token: parsed.data.turnstileToken });
  if (blocked) return blocked;

  const supabase = await createSupabaseServer();
  if (!supabase) return NextResponse.json({ error: UNAVAILABLE_MESSAGE }, { status: 503 });

  const { error } = await supabase.auth.signInWithPassword({ email: parsed.data.email, password: parsed.data.password });
  // Mesma resposta para senha errada, e-mail inexistente ou e-mail não confirmado.
  if (error) return NextResponse.json({ error: "E-mail ou senha incorretos." }, { status: 401 });
  return NextResponse.json({ message: "Login realizado." });
}
