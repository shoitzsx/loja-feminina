import type { Metadata } from "next";
import { ProductListing } from "@/components/product/ProductListing";
import { products } from "@/lib/data";

export const metadata: Metadata = {
  title: "Mais vendidos",
  description: "Produtos mais vendidos da semana na Barb's Closet."
};

export default function BestSellersPage() {
  const bestSellers = [...products].sort((a, b) => b.salesLast7Days - a.salesLast7Days);
  return <ProductListing products={bestSellers} title="Mais vendidos da semana" subtitle="Seleção automática baseada no volume de vendas dos últimos 7 dias." />;
}
