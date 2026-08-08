import type { Metadata } from "next";
import { ProductListing } from "@/components/product/ProductListing";
import { products } from "@/lib/data";

export const metadata: Metadata = {
  title: "Promoções",
  description: "Produtos em promoção na Barb's Closet com descontos destacados."
};

export default function PromotionsPage() {
  return <ProductListing products={products.filter((product) => product.salePrice)} title="Promoções" subtitle="Peças selecionadas com preço anterior, novo preço e descontos especiais." />;
}
