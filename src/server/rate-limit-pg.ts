import { PrismaClient } from "@prisma/client";
import type { RateLimitStore } from "./rate-limit";

const globalForPrisma = globalThis as unknown as { rateLimitPrisma?: PrismaClient };

/** Contador atômico em public.rate_limits (uma única instrução, sem corrida entre instâncias). */
export class PostgresRateLimitStore implements RateLimitStore {
  private prisma = (globalForPrisma.rateLimitPrisma ??= new PrismaClient());

  async hit(key: string, windowMs: number) {
    const seconds = windowMs / 1000;
    const rows = await this.prisma.$queryRaw<{ count: number; reset_at: Date }[]>`
      insert into public.rate_limits as r (key, count, window_start)
      values (${key}, 1, now())
      on conflict (key) do update set
        count = case when r.window_start < now() - make_interval(secs => ${seconds}::double precision) then 1 else r.count + 1 end,
        window_start = case when r.window_start < now() - make_interval(secs => ${seconds}::double precision) then now() else r.window_start end
      returning r.count, r.window_start + make_interval(secs => ${seconds}::double precision) as reset_at`;
    const row = rows[0];
    return { count: Number(row.count), resetAt: new Date(row.reset_at).getTime() };
  }
}
