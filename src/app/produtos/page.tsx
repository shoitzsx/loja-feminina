import type { Metadata } from "next";
import { ProductListing } from "@/components/product/ProductListing";
import { products } from "@/lib/data";

export const metadata: Metadata = {
  title: "Produtos",
  description: "Compre roupas femininas, colares, brincos, pulseiras e semijoias na Barb's Closet."
};

export default function ProductsPage() {
  return (
    <ProductListing
      products={products}
      title="Produtos"
      subtitle="Explore roupas, acessórios, prata, ouro e semijoias com filtros por preço, tamanho, material, promoção e avaliação."
    />
  );
}
