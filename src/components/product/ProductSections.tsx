import { Button } from "@/components/ui/Button";
import { products } from "@/lib/data";
import { ProductGrid } from "./ProductGrid";

export function ProductSections() {
  const promotions = products.filter((product) => product.salePrice).slice(0, 4);
  const bestSellers = [...products].sort((a, b) => b.salesLast7Days - a.salesLast7Days).slice(0, 4);
  const newest = [...products].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)).slice(0, 4);
  const recommended = products.filter((product) => product.isRecommended).slice(0, 4);

  return (
    <>
      <ProductSection title="Promoções" eyebrow="Garanta antes que acabe" href="/promocoes" products={promotions} />
      <ProductSection title="Mais vendidos da semana" eyebrow="Favoritos das clientes" href="/mais-vendidos" products={bestSellers} />
      <ProductSection title="Novidades" eyebrow="Chegaram agora" href="/novidades" products={newest} />
      <ProductSection title="Produtos recomendados" eyebrow="Combina com seu closet" href="/produtos" products={recommended} />
    </>
  );
}

function ProductSection({ title, eyebrow, href, products }: { title: string; eyebrow: string; href: string; products: typeof import("@/lib/data").products }) {
  return (
    <section className="container-shell animate-rise-in py-8">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase text-rosebrand-600">{eyebrow}</p>
          <h2 className="mt-1 text-2xl font-black text-ink">{title}</h2>
        </div>
        <Button href={href} variant="secondary" className="hidden sm:inline-flex">
          Ver tudo
        </Button>
      </div>
      <ProductGrid products={products} />
    </section>
  );
}
