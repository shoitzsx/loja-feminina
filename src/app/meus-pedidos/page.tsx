import type { Metadata } from "next";
import { OrdersView } from "@/components/account/OrdersView";
import { getMyOrders } from "@/server/my-orders";

export const metadata: Metadata = {
  title: "Meus pedidos",
  description: "Acompanhe seus pedidos na Barb's Closet.",
  robots: { index: false, follow: false }
};

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const result = await getMyOrders();
  if (result.status === "anonymous") return <OrdersView mode="anonymous" />;
  if (result.status === "ok") return <OrdersView mode="real" orders={result.orders} />;
  return <OrdersView mode="sample" />;
}
