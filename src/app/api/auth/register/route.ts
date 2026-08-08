import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isStrongPassword } from "@/lib/password";
import { hashPassword, rateLimit } from "@/server/security";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(8),
  password: z.string().min(10)
});

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "local";
  const limited = rateLimit(`register:${ip}`, 5, 60_000);
  if (!limited.allowed) return NextResponse.json({ error: "Muitas tentativas de cadastro." }, { status: 429 });

  const parsed = registerSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  if (!isStrongPassword(parsed.data.password)) return NextResponse.json({ error: "Senha não atende aos requisitos." }, { status: 400 });

  const passwordHash = await hashPassword(parsed.data.password);
  console.info("[auth:mock] user registration ready for Prisma", {
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone,
    passwordHashPreview: passwordHash.slice(0, 18)
  });

  return NextResponse.json({
    message: "Cadastro validado. Conecte o Prisma para persistir usuário, enviar validação de e-mail e iniciar sessão segura."
  });
}
