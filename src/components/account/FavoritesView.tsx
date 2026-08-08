"use client";

import { ProductGrid } from "@/components/product/ProductGrid";
import { products } from "@/lib/data";

export function FavoritesView() {
  const favorites = products.filter((product) => product.isRecommended).slice(0, 4);
  return (
    <section className="container-shell py-8">
      <h1 className="text-3xl font-black text-ink">Favoritos</h1>
      <p className="mt-2 text-sm text-neutral-600">MVP exibindo favoritos recomendados. Em produção, esta lista é persistida por usuário.</p>
      <div className="mt-6">
        <ProductGrid products={favorites} />
      </div>
    </section>
  );
}
