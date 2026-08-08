import type { Product } from "@/lib/types";
import { ProductCard } from "./ProductCard";

export function ProductGrid({ products }: { products: Product[] }) {
  if (!products.length) {
    return (
      <div className="glam-panel rounded-lg p-8 text-center">
        <p className="font-bold text-ink">Nenhum produto encontrado.</p>
        <p className="mt-2 text-sm text-neutral-600">Tente ajustar os filtros ou buscar outro termo.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
