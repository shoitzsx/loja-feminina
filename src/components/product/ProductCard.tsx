"use client";

import { Heart, ShoppingBag, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { discountPercent, formatMoney } from "@/lib/format";
import type { Product } from "@/lib/types";

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [favorite, setFavorite] = useState(false);
  const firstVariant = product.variants.find((variant) => variant.stock > 0) ?? product.variants[0];
  const salePercent = discountPercent(product.price, product.salePrice);
  const price = product.salePrice ?? product.price;

  return (
    <article className="group glam-hover animate-rise-in overflow-hidden rounded-lg border border-rosebrand-200 bg-rosebrand-50/95 shadow-card">
      <Link href={`/produto/${product.slug}`} className="relative block overflow-hidden bg-rosebrand-100">
        <Image
          src={product.images[0]}
          alt={product.alt}
          width={560}
          height={560}
          className="aspect-square w-full object-cover transition duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          {salePercent > 0 && <Badge>PROMOÇÃO</Badge>}
          {product.salesLast7Days >= 40 && <Badge tone="gold">MAIS VENDIDO</Badge>}
          {new Date(product.createdAt) >= new Date("2026-08-01") && <Badge tone="dark">NOVO</Badge>}
        </div>
      </Link>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Link href={`/produto/${product.slug}`} className="line-clamp-2 text-sm font-black text-ink hover:text-rosebrand-600">
              {product.name}
            </Link>
            <p className="mt-1 text-xs text-neutral-500">{product.categoryName} · {product.collection}</p>
          </div>
          <button
            onClick={() => setFavorite((current) => !current)}
            className="grid size-9 shrink-0 place-items-center rounded-lg border border-rosebrand-200 bg-white/60 text-rosebrand-700 transition hover:bg-rosebrand-100"
            aria-label={favorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          >
            <Heart className={favorite ? "size-4 fill-rosebrand-500" : "size-4"} />
          </button>
        </div>
        <div className="mt-3 flex items-center gap-1 text-xs font-bold text-neutral-600">
          <Star className="size-4 fill-champagne text-champagne" />
          {product.rating.toFixed(1)} · {product.reviews} avaliações
        </div>
        <div className="mt-3 flex flex-wrap items-end gap-2">
          {product.salePrice && <span className="text-xs text-neutral-400 line-through">{formatMoney(product.price)}</span>}
          <span className="text-lg font-black text-rosebrand-700">{formatMoney(price)}</span>
          {salePercent > 0 && <span className="text-xs font-black text-rosebrand-600">-{salePercent}%</span>}
        </div>
        <Button
          type="button"
          className="mt-4 w-full"
          disabled={!firstVariant || firstVariant.stock <= 0}
          onClick={() => addItem({ productId: product.id, variantId: firstVariant.id, quantity: 1 })}
        >
          <ShoppingBag className="size-4" />
          Adicionar
        </Button>
      </div>
    </article>
  );
}
