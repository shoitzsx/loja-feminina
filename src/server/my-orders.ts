import { getDb } from "./db";
import { listOrdersForUser } from "./order-repo";
import { getSessionUser } from "./supabase";

export type OrderSummary = { number: string; date: string; status: string; totalCents: number; items: string };

export type MyOrders = { status: "unavailable" } | { status: "anonymous" } | { status: "ok"; orders: OrderSummary[] };

/** Pedidos do usuário da sessão. O ID nunca vem de parâmetro de URL ou formulário. */
export async function getMyOrders(): Promise<MyOrders> {
  const db = getDb();
  if (!db) return { status: "unavailable" };
  const user = await getSessionUser().catch(() => null);
  if (!user) return { status: "anonymous" };
  try {
    const orders = await listOrdersForUser(db, user.id);
    return {
      status: "ok",
      orders: orders.map((order) => ({
        number: order.orderNumber,
        date: order.createdAt.toISOString(),
        status: order.status,
        totalCents: order.totalCents,
        items: order.items.map((item) => `${item.quantity}x ${item.productName}${item.size ? ` (${item.size})` : ""}`).join(", ")
      }))
    };
  } catch (error) {
    console.error("[meus-pedidos] falha ao consultar", error instanceof Error ? error.name : "desconhecido");
    return { status: "unavailable" };
  }
}
