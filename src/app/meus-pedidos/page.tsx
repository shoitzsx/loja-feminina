import type { Metadata } from "next";
import { OrdersView } from "@/components/account/OrdersView";

export const metadata: Metadata = {
  title: "Meus pedidos",
  description: "Acompanhe seus pedidos na Barb's Closet."
};

export default function OrdersPage() {
  return <OrdersView />;
}
