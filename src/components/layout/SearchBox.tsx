"use client";

import { Search, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { products } from "@/lib/data";
import { normalizeSearch } from "@/lib/format";

export function SearchBox({ compact = false }: { compact?: boolean }) {
  const [query, setQuery] = useState("");
  const normalized = normalizeSearch(query);

  const suggestions = useMemo(() => {
    if (normalized.length < 2) return [];
    return products
      .filter((product) => {
        const haystack = normalizeSearch(
          [product.name, product.categoryName, product.sku, product.collection, product.colors.join(" "), product.materials.join(" ")].join(" ")
        );
        return haystack.includes(normalized);
      })
      .slice(0, 5);
  }, [normalized]);

  return (
    <div className="relative w-full">
      <form action="/busca" className="relative">
        <Search aria-hidden className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-rosebrand-500" />
        <input
          name="q"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={compact ? "Buscar" : "Buscar colar prata, SKU, coleção..."}
          className="h-11 w-full rounded-lg border border-rosebrand-200 bg-white/80 pl-10 pr-10 text-sm shadow-card transition placeholder:text-neutral-400 hover:border-rosebrand-400 hover:bg-white"
          autoComplete="off"
        />
        {query && (
          <button type="button" onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-neutral-500 hover:bg-rosebrand-100" aria-label="Limpar busca">
            <X className="size-4" />
          </button>
        )}
      </form>
      {suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-lg border border-rosebrand-200 bg-rosebrand-50/95 shadow-soft backdrop-blur">
          {suggestions.map((product) => (
            <Link key={product.id} href={`/produto/${product.slug}`} className="grid grid-cols-[48px_1fr] gap-3 border-b border-rosebrand-100 p-3 transition last:border-0 hover:bg-rosebrand-100">
              <Image src={product.images[0]} alt="" width={48} height={48} className="h-12 w-12 rounded object-cover" />
              <span>
                <span className="block text-sm font-bold text-ink">{product.name}</span>
                <span className="block text-xs text-neutral-500">{product.categoryName} · {product.sku}</span>
              </span>
            </Link>
          ))}
          <Link href={`/busca?q=${encodeURIComponent(query)}`} className="block bg-rosebrand-100 px-3 py-2 text-sm font-bold text-rosebrand-800">
            Ver todos os resultados
          </Link>
        </div>
      )}
    </div>
  );
}
