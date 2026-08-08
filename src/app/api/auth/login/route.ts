import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit } from "@/server/security";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "local";
  const limited = rateLimit(`login:${ip}`, 8, 60_000);
  if (!limited.allowed) return NextResponse.json({ error: "Muitas tentativas de login. Aguarde antes de tentar novamente." }, { status: 429 });

  const parsed = loginSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "E-mail ou senha inválidos." }, { status: 400 });

  return NextResponse.json({
    message: "Login recebido. Em produção, verificar hash no banco, aplicar bloqueio progressivo, CAPTCHA e sessão HttpOnly/SameSite."
  });
}
