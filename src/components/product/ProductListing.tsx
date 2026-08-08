"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ProductGrid } from "@/components/product/ProductGrid";
import { normalizeSearch } from "@/lib/format";
import type { Product } from "@/lib/types";

type SortKey = "relevance" | "price-asc" | "price-desc" | "best" | "new" | "discount" | "rating";

export function ProductListing({ products, title, subtitle, initialQuery = "" }: { products: Product[]; title: string; subtitle?: string; initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery);
  const [maxPrice, setMaxPrice] = useState(400);
  const [size, setSize] = useState("");
  const [material, setMaterial] = useState("");
  const [onlyPromo, setOnlyPromo] = useState(false);
  const [onlyAvailable, setOnlyAvailable] = useState(true);
  const [sort, setSort] = useState<SortKey>("relevance");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filtered = useMemo(() => {
    const normalizedQuery = normalizeSearch(query);
    const result = products.filter((product) => {
      const price = product.salePrice ?? product.price;
      const searchable = normalizeSearch(
        [product.name, product.sku, product.categoryName, product.collection, product.colors.join(" "), product.materials.join(" "), product.description].join(" ")
      );
      const matchesQuery = !normalizedQuery || searchable.includes(normalizedQuery);
      const matchesPrice = price <= maxPrice;
      const matchesSize = !size || product.sizes.includes(size);
      const matchesMaterial = !material || product.materials.some((candidate) => normalizeSearch(candidate).includes(normalizeSearch(material)));
      const matchesPromo = !onlyPromo || Boolean(product.salePrice);
      const matchesAvailability = !onlyAvailable || product.variants.some((variant) => variant.stock > 0);
      return matchesQuery && matchesPrice && matchesSize && matchesMaterial && matchesPromo && matchesAvailability;
    });

    return result.sort((a, b) => {
      if (sort === "price-asc") return (a.salePrice ?? a.price) - (b.salePrice ?? b.price);
      if (sort === "price-desc") return (b.salePrice ?? b.price) - (a.salePrice ?? a.price);
      if (sort === "best") return b.salesLast7Days - a.salesLast7Days;
      if (sort === "new") return Date.parse(b.createdAt) - Date.parse(a.createdAt);
      if (sort === "discount") return (b.price - (b.salePrice ?? b.price)) - (a.price - (a.salePrice ?? a.price));
      if (sort === "rating") return b.rating - a.rating;
      return 0;
    });
  }, [maxPrice, material, onlyAvailable, onlyPromo, products, query, size, sort]);

  const filters = (
    <div className="grid gap-5">
      <FilterText label="Busca" value={query} onChange={setQuery} placeholder="colar prata, rosa, SKU..." />
      <label className="block">
        <span className="text-sm font-bold text-ink">Preço até {maxPrice.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
        <input type="range" min={80} max={400} step={10} value={maxPrice} onChange={(event) => setMaxPrice(Number(event.target.value))} className="mt-3 w-full accent-rosebrand-500" />
      </label>
      <label className="block">
        <span className="text-sm font-bold text-ink">Tamanho</span>
        <select value={size} onChange={(event) => setSize(event.target.value)} className="mt-2 h-11 w-full rounded-lg border border-rosebrand-200 bg-white/80 px-3 text-sm">
          <option value="">Todos</option>
          {["P", "M", "G", "GG", "Único"].map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="text-sm font-bold text-ink">Material</span>
        <select value={material} onChange={(event) => setMaterial(event.target.value)} className="mt-2 h-11 w-full rounded-lg border border-rosebrand-200 bg-white/80 px-3 text-sm">
          <option value="">Todos</option>
          <option value="prata">Prata</option>
          <option value="ouro">Ouro</option>
          <option value="banho">Banho</option>
          <option value="cetim">Cetim</option>
        </select>
      </label>
      <Toggle label="Disponível" checked={onlyAvailable} onChange={setOnlyAvailable} />
      <Toggle label="Promoção" checked={onlyPromo} onChange={setOnlyPromo} />
    </div>
  );

  return (
    <section className="container-shell py-8">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-black uppercase text-rosebrand-600">Barb’s Closet</p>
          <h1 className="mt-1 text-3xl font-black text-ink">{title}</h1>
          {subtitle && <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-600">{subtitle}</p>}
        </div>
        <div className="flex gap-2">
          <button className="inline-flex h-11 items-center gap-2 rounded-lg border border-rosebrand-200 bg-rosebrand-50/90 px-4 text-sm font-bold shadow-card transition hover:bg-rosebrand-100 lg:hidden" onClick={() => setDrawerOpen(true)}>
            <SlidersHorizontal className="size-4" />
            Filtros
          </button>
          <select value={sort} onChange={(event) => setSort(event.target.value as SortKey)} className="h-11 rounded-lg border border-rosebrand-200 bg-rosebrand-50/90 px-3 text-sm font-bold shadow-card">
            <option value="relevance">Relevância</option>
            <option value="price-asc">Menor preço</option>
            <option value="price-desc">Maior preço</option>
            <option value="best">Mais vendidos</option>
            <option value="new">Novidades</option>
            <option value="discount">Maiores descontos</option>
            <option value="rating">Melhor avaliados</option>
          </select>
        </div>
      </div>
      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="glam-panel hidden h-fit rounded-lg p-5 lg:block">{filters}</aside>
        <div>
          <p className="mb-4 text-sm font-bold text-neutral-600">{filtered.length} produto(s) encontrado(s)</p>
          <ProductGrid products={filtered} />
        </div>
      </div>
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <button className="absolute inset-0 bg-ink/40" onClick={() => setDrawerOpen(false)} aria-label="Fechar filtros" />
          <div className="absolute bottom-0 left-0 right-0 max-h-[88vh] overflow-y-auto rounded-t-lg bg-rosebrand-50/95 p-5 shadow-soft backdrop-blur">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-black">Filtros</h2>
              <button onClick={() => setDrawerOpen(false)} className="rounded-lg p-2 hover:bg-rosebrand-100" aria-label="Fechar filtros">
                <X className="size-5" />
              </button>
            </div>
            {filters}
            <Button type="button" className="mt-5 w-full" onClick={() => setDrawerOpen(false)}>
              Aplicar filtros
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}

function FilterText({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-ink">{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="mt-2 h-11 w-full rounded-lg border border-rosebrand-200 bg-white/80 px-3 text-sm" />
    </label>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-lg border border-rosebrand-200 bg-white/45 px-3 py-3 text-sm font-bold text-ink">
      {label}
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="size-5 accent-rosebrand-500" />
    </label>
  );
}
