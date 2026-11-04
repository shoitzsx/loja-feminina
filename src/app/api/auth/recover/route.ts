import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { guardAuth } from "@/server/auth-guard";
import { UNAVAILABLE_MESSAGE, createSupabaseServer } from "@/server/supabase";

const recoverSchema = z.object({
  email: z.string().email().max(254),
  turnstileToken: z.string().max(2048).optional()
});

const NEUTRAL = "Se existir uma conta com esse e-mail, enviamos as instruções para redefinir a senha.";

export async function POST(request: NextRequest) {
  const parsed = recoverSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "E-mail inválido." }, { status: 400 });

  const blocked = await guardAuth(request, { action: "recover", account: parsed.data.email, token: parsed.data.turnstileToken });
  if (blocked) return blocked;

  const supabase = await createSupabaseServer();
  if (!supabase) return NextResponse.json({ error: UNAVAILABLE_MESSAGE }, { status: 503 });

  // O resultado é ignorado de propósito: a resposta não pode revelar se o e-mail existe.
  await supabase.auth.resetPasswordForEmail(parsed.data.email).catch(() => undefined);
  return NextResponse.json({ message: NEUTRAL });
}
