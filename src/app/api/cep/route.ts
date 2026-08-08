import { NextRequest, NextResponse } from "next/server";
import { lookupCep } from "@/server/integrations/cep";
import { rateLimit } from "@/server/security";

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "local";
  const limited = rateLimit(`cep:${ip}`, 30, 60_000);
  if (!limited.allowed) return NextResponse.json({ error: "Muitas consultas de CEP." }, { status: 429 });

  const cep = request.nextUrl.searchParams.get("cep") ?? "";
  const address = await lookupCep(cep);

  return NextResponse.json({ address });
}
