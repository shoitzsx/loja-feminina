"use client";

import { Heart, MessageCircle, ShoppingBag, Star, Zap } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/cart/CartProvider";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { products } from "@/lib/data";
import { discountPercent, formatMoney, installmentText } from "@/lib/format";
import type { Product } from "@/lib/types";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { ProductGrid } from "./ProductGrid";
import { SizeGuideWidget } from "./SizeGuideWidget";

export function ProductDetail({ product }: { product: Product }) {
  const router = useRouter();
  const { addItem } = useCart();
  const [image, setImage] = useState(product.images[0]);
  const [variantId, setVariantId] = useState(product.variants[0]?.id);
  const [quantity, setQuantity] = useState(1);
  const variant = product.variants.find((item) => item.id === variantId) ?? product.variants[0];
  const price = product.salePrice ?? product.price;
  const percent = discountPercent(product.price, product.salePrice);
  const related = useMemo(() => products.filter((candidate) => candidate.category === product.category && candidate.id !== product.id).slice(0, 4), [product.category, product.id]);

  function addToCart(goToCheckout = false) {
    if (!variant) return;
    addItem({ productId: product.id, variantId: variant.id, quantity });
    if (goToCheckout) router.push("/checkout");
  }

  return (
    <section className="container-shell animate-rise-in py-8">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)]">
        <div>
          <div className="group relative overflow-hidden rounded-lg border border-rosebrand-200 bg-rosebrand-100 shadow-soft">
            <Image src={image} alt={product.alt} width={900} height={900} priority className="aspect-square w-full object-cover transition duration-500 group-hover:scale-110" />
            {percent > 0 && <Badge className="absolute left-4 top-4">-{percent}%</Badge>}
          </div>
          <div className="mt-3 flex gap-3 overflow-x-auto pb-2">
            {product.images.map((src) => (
              <button key={src} onClick={() => setImage(src)} className="shrink-0 rounded-lg border border-rosebrand-200 bg-rosebrand-50 p-1 transition hover:-translate-y-0.5 hover:border-rosebrand-500" aria-label="Alterar imagem do produto">
                <Image src={src} alt="" width={84} height={84} className="aspect-square rounded object-cover" />
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-black uppercase text-rosebrand-600">{product.categoryName} · {product.collection}</p>
          <h1 className="mt-2 text-3xl font-black leading-tight text-ink">{product.name}</h1>
          <p className="mt-2 text-sm text-neutral-500">SKU {product.sku}</p>
          <div className="mt-3 flex items-center gap-2 text-sm font-bold text-neutral-700">
            <Star className="size-5 fill-champagne text-champagne" />
            {product.rating.toFixed(1)} · {product.reviews} avaliações
          </div>
          <div className="mt-5 flex flex-wrap items-end gap-3">
            {product.salePrice && <span className="text-base text-neutral-400 line-through">{formatMoney(product.price)}</span>}
            <span className="text-4xl font-black text-rosebrand-700">{formatMoney(price)}</span>
            {percent > 0 && <Badge>Promoção</Badge>}
          </div>
          <p className="mt-2 text-sm font-bold text-neutral-600">{installmentText(price)}</p>
          <p className="mt-5 leading-7 text-neutral-700">{product.description}</p>

          <div className="mt-6 grid gap-4">
            <label className="block">
              <span className="text-sm font-black text-ink">Variação</span>
              <select value={variantId} onChange={(event) => setVariantId(event.target.value)} className="mt-2 h-12 w-full rounded-lg border border-rosebrand-200 bg-white/80 px-3 font-bold shadow-card">
                {product.variants.map((item) => (
                  <option key={item.id} value={item.id} disabled={item.stock <= 0}>
                    {item.size ?? "Único"} · {item.color ?? product.colors[0]} · {item.material} · {item.stock} em estoque
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-black text-ink">Quantidade</span>
              <input type="number" min={1} max={variant?.stock ?? 1} value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} className="mt-2 h-12 w-28 rounded-lg border border-rosebrand-200 bg-white/80 px-3 font-bold shadow-card" />
            </label>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Button type="button" disabled={!variant || variant.stock <= 0} onClick={() => addToCart(false)}>
              <ShoppingBag className="size-4" />
              Adicionar ao carrinho
            </Button>
            <Button type="button" variant="dark" disabled={!variant || variant.stock <= 0} onClick={() => addToCart(true)}>
              <Zap className="size-4" />
              Comprar agora
            </Button>
            <Button type="button" variant="secondary">
              <Heart className="size-4" />
              Favoritar
            </Button>
            <Button href={buildWhatsAppUrl(`Olá! Gostaria de saber mais sobre o produto ${product.name}.`)} variant="secondary" target="_blank" rel="noreferrer">
              <MessageCircle className="size-4" />
              WhatsApp
            </Button>
          </div>

          <div className="mt-6">
            <SizeGuideWidget />
          </div>

          <div className="glam-panel mt-8 grid gap-4 rounded-lg p-5">
            <Spec title="Características" items={product.details} />
            <Spec title="Materiais" items={product.materials} />
            <Spec title="Cuidados" items={product.care} />
            {variant?.dimensions && <Spec title="Dimensão" items={[variant.dimensions]} />}
            {variant?.weightGrams && <Spec title="Peso" items={[`${variant.weightGrams} g`]} />}
          </div>
        </div>
      </div>

      <section className="mt-12">
        <div className="mb-5">
          <p className="text-xs font-black uppercase text-rosebrand-600">Complete o look</p>
          <h2 className="mt-1 text-2xl font-black text-ink">Produtos relacionados</h2>
        </div>
        <ProductGrid products={related.length ? related : products.filter((candidate) => candidate.id !== product.id).slice(0, 4)} />
      </section>
    </section>
  );
}

function Spec({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h2 className="text-sm font-black uppercase text-ink">{title}</h2>
      <ul className="mt-2 grid gap-1 text-sm text-neutral-600">
        {items.map((item) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>
    </div>
  );
}
