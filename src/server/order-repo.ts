import crypto from "node:crypto";
import type { PrismaClient } from "@prisma/client";

/** Só o que o repositório usa do Prisma (facilita testar com um banco falso). */
export type OrderRepoDb = Pick<PrismaClient, "order" | "payment" | "webhookEvent" | "$transaction">;

const cents = (value: number) => Math.round(value * 100);

export type SaveOrderInput = {
  orderNumber: string;
  userId: string | null;
  guestTokenHash: string | null;
  customerName: string;
  customerEmail: string;
  customerPhoneEncrypted: string | null;
  shippingAddress: Record<string, unknown>;
  shippingMethod: string;
  paymentMethod: "PIX" | "CREDIT_CARD" | "DEBIT_CARD";
  provider: string;
  providerRef?: string;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  items: { slug: string; name: string; sku: string; size?: string; color?: string; quantity: number; unitPrice: number; subtotal: number }[];
};

/** Grava o pedido com itens e um pagamento PENDENTE. CPF nunca entra aqui. */
export async function saveOrder(db: OrderRepoDb, input: SaveOrderInput) {
  if (!input.userId && !input.guestTokenHash) throw new Error("Pedido precisa de dono (usuário) ou de token de convidado.");
  return db.order.create({
    data: {
      orderNumber: input.orderNumber,
      userId: input.userId,
      guestTokenHash: input.guestTokenHash,
      customerName: input.customerName,
      customerEmail: input.customerEmail,
      customerPhoneEncrypted: input.customerPhoneEncrypted,
      shippingAddress: input.shippingAddress as object,
      shippingMethod: input.shippingMethod,
      status: "PENDING_PAYMENT",
      subtotalCents: cents(input.subtotal),
      discountCents: cents(input.discount),
      shippingCents: cents(input.shipping),
      totalCents: cents(input.total),
      items: {
        create: input.items.map((line) => ({
          productSlug: line.slug,
          productName: line.name,
          sku: line.sku,
          size: line.size,
          color: line.color,
          quantity: line.quantity,
          unitPriceCents: cents(line.unitPrice),
          totalCents: cents(line.subtotal)
        }))
      },
      payments: {
        create: { method: input.paymentMethod, status: "PENDING", provider: input.provider, providerRef: input.providerRef, amountCents: cents(input.total) }
      }
    }
  });
}

/** Pedidos do usuário logado. O ID TEM que vir da sessão, nunca de um formulário. */
export async function listOrdersForUser(db: OrderRepoDb, userId: string) {
  if (!userId) throw new Error("userId obrigatório");
  return db.order.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, include: { items: true } });
}

export function newGuestToken() {
  return crypto.randomBytes(32).toString("base64url");
}

export function hashGuestToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/** Consulta de pedido por convidado: precisa do número E do token recebido na compra. */
export async function findOrderForGuest(db: OrderRepoDb, orderNumber: string, token: string) {
  if (!token || token.length > 200) return null;
  return db.order.findFirst({ where: { orderNumber, guestTokenHash: hashGuestToken(token) }, include: { items: true } });
}

/**
 * Webhook de pagamento confirmado. Idempotente: o evento é registrado com chave única
 * (provider + eventId); repetição devolve "duplicate". Só avança PENDING_PAYMENT → PAID.
 */
export async function confirmPayment(db: OrderRepoDb, event: { provider: string; eventId: string; orderNumber: string }): Promise<"applied" | "duplicate" | "not_found"> {
  return db.$transaction(async (tx) => {
    try {
      await tx.webhookEvent.create({ data: { provider: event.provider, eventId: event.eventId } });
    } catch (error) {
      if ((error as { code?: string }).code === "P2002") return "duplicate" as const;
      throw error;
    }
    const paidAt = new Date();
    const updated = await tx.order.updateMany({ where: { orderNumber: event.orderNumber, status: "PENDING_PAYMENT" }, data: { status: "PAID", paidAt } });
    if (updated.count === 0) return "not_found" as const;
    await tx.payment.updateMany({ where: { order: { orderNumber: event.orderNumber } }, data: { status: "PAID", paidAt } });
    return "applied" as const;
  });
}
