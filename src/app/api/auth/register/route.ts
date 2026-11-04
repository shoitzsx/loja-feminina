import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isStrongPassword } from "@/lib/password";
import { guardAuth } from "@/server/auth-guard";
import { UNAVAILABLE_MESSAGE, createSupabaseServer } from "@/server/supabase";

// Lista fechada de campos: qualquer outro (role, user_metadata...) é ignorado.
const registerSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email().max(254),
  phone: z.string().min(8).max(20),
  password: z.string().min(10).max(200),
  turnstileToken: z.string().max(2048).optional()
});

const NEUTRAL = "Se o e-mail puder ser cadastrado, enviamos um link de confirmação. Confira sua caixa de entrada.";

export async function POST(request: NextRequest) {
  const parsed = registerSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  if (!isStrongPassword(parsed.data.password)) return NextResponse.json({ error: "Senha não atende aos requisitos." }, { status: 400 });

  const blocked = await guardAuth(request, { action: "register", account: parsed.data.email, token: parsed.data.turnstileToken });
  if (blocked) return blocked;

  const supabase = await createSupabaseServer();
  if (!supabase) return NextResponse.json({ error: UNAVAILABLE_MESSAGE }, { status: 503 });

  // Telefone: só será gravado (criptografado) junto do perfil, nas próximas etapas. O papel nunca é enviado.
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: { data: { full_name: parsed.data.name } }
  });
  if (error) return NextResponse.json({ error: "Não foi possível concluir o cadastro. Confira os dados e tente novamente." }, { status: 400 });

  // Resposta idêntica exista ou não uma conta com esse e-mail.
  return NextResponse.json({ message: NEUTRAL });
}
