import type { Metadata } from "next";
import { CartView } from "@/components/cart/CartView";

export const metadata: Metadata = {
  title: "Carrinho",
  description: "Revise os produtos, aplique cupom e finalize sua compra na Barb's Closet."
};

export default function CartPage() {
  return <CartView />;
}
