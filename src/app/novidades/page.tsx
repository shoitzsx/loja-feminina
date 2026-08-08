import type { Metadata } from "next";
import { ProductListing } from "@/components/product/ProductListing";
import { products } from "@/lib/data";

export const metadata: Metadata = {
  title: "Novidades",
  description: "Produtos adicionados recentemente na Barb's Closet."
};

export default function NewProductsPage() {
  const newest = [...products].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  return <ProductListing products={newest} title="Novidades" subtitle="Chegadas recentes para renovar seu closet com moda, feminilidade e brilho." />;
}
