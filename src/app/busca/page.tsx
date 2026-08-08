import type { Metadata } from "next";
import { ProductListing } from "@/components/product/ProductListing";
import { products } from "@/lib/data";

export const metadata: Metadata = {
  title: "Busca",
  description: "Resultados de busca da Barb's Closet."
};

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const params = await searchParams;
  return <ProductListing products={products} title="Busca" subtitle="Pesquise por nome, categoria, cor, material, coleção ou SKU." initialQuery={params.q ?? ""} />;
}
