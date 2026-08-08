import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductListing } from "@/components/product/ProductListing";
import { categories, getCategoryBySlug, productsByCategory } from "@/lib/data";
import type { CategorySlug } from "@/lib/types";

export function generateStaticParams() {
  return [
    ...categories.map((category) => ({ slug: category.slug })),
    { slug: "acessorios" },
    { slug: "prata" },
    { slug: "ouro" }
  ];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  const title = category?.name ?? titleFromSlug(slug);
  return {
    title,
    description: `Compre ${title.toLowerCase()} na Barb's Closet.`
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const known = ["roupas", "acessorios", "colares", "brincos", "pulseiras", "prata", "ouro"].includes(slug);
  if (!known) notFound();

  const category = getCategoryBySlug(slug);
  const title = category?.name ?? titleFromSlug(slug);
  const items = productsByCategory(slug as CategorySlug);

  return <ProductListing products={items} title={title} subtitle={category?.description ?? `Curadoria Barb’s Closet para ${title.toLowerCase()}.`} />;
}

function titleFromSlug(slug: string) {
  const labels: Record<string, string> = {
    acessorios: "Acessórios",
    prata: "Produtos em prata",
    ouro: "Produtos em ouro"
  };
  return labels[slug] ?? "Categoria";
}
