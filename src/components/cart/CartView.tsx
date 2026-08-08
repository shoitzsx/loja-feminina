"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { formatMoney } from "@/lib/format";
import { calculateCartPricing } from "@/lib/pricing";
import { useCart } from "./CartProvider";

export function CartView() {
  const { items, updateQuantity, removeItem } = useCart();
  const [coupon, setCoupon] = useState("");
  const pricing = useMemo(() => calculateCartPricing(items, coupon), [coupon, items]);

  if (!items.length) {
    return (
      <section className="container-shell py-12">
        <div className="glam-panel rounded-lg p-8 text-center">
          <h1 className="text-2xl font-black text-ink">Seu carrinho está vazio</h1>
          <p className="mt-3 text-neutral-600">Escolha uma peça especial e volte para finalizar sua compra.</p>
          <Button href="/produtos" className="mt-5">
            Continuar comprando
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="container-shell grid gap-8 py-8 lg:grid-cols-[1fr_360px]">
      <div>
        <h1 className="text-3xl font-black text-ink">Carrinho</h1>
        <div className="mt-6 grid gap-4">
          {pricing.lines.map((line) => (
            <article key={line.variantId} className="glam-panel glam-hover grid gap-4 rounded-lg p-4 sm:grid-cols-[104px_1fr_auto]">
              <Image src={line.image} alt="" width={104} height={104} className="aspect-square rounded-lg object-cover" />
              <div>
                <Link href={`/produto/${line.slug}`} className="font-black text-ink hover:text-rosebrand-600">
                  {line.name}
                </Link>
                <p className="mt-1 text-sm text-neutral-500">
                  SKU {line.sku} · {line.size ?? "Único"} · {line.color ?? "Cor padrão"}
                </p>
                <p className="mt-2 text-sm font-bold text-rosebrand-700">{formatMoney(line.unitPrice)}</p>
                {line.stock <= 3 && <p className="mt-1 text-xs font-bold text-rosebrand-600">Últimas unidades em estoque</p>}
              </div>
              <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                <div className="flex h-10 items-center rounded-lg border border-rosebrand-200 bg-white/70">
                  <button onClick={() => updateQuantity(line.variantId, line.quantity - 1)} className="grid size-10 place-items-center hover:bg-rosebrand-100" aria-label="Diminuir quantidade">
                    <Minus className="size-4" />
                  </button>
                  <span className="w-9 text-center text-sm font-bold">{line.quantity}</span>
                  <button onClick={() => updateQuantity(line.variantId, line.quantity + 1)} className="grid size-10 place-items-center hover:bg-rosebrand-100" aria-label="Aumentar quantidade">
                    <Plus className="size-4" />
                  </button>
                </div>
                <button onClick={() => removeItem(line.variantId)} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold text-neutral-500 hover:bg-rosebrand-100 hover:text-rosebrand-700">
                  <Trash2 className="size-4" />
                  Excluir
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
      <aside className="glam-panel h-fit rounded-lg p-5">
        <h2 className="text-lg font-black text-ink">Resumo</h2>
        <label className="mt-4 block text-sm font-bold text-neutral-700" htmlFor="coupon">
          Cupom
        </label>
        <div className="mt-2 flex gap-2">
          <input id="coupon" value={coupon} onChange={(event) => setCoupon(event.target.value.toUpperCase())} placeholder="BARBS10" className="h-11 min-w-0 flex-1 rounded-lg border border-rosebrand-200 bg-white/80 px-3 text-sm" />
        </div>
        {pricing.couponMessage && <p className="mt-2 text-xs font-bold text-rosebrand-700">{pricing.couponMessage}</p>}
        <dl className="mt-5 grid gap-3 text-sm">
          <SummaryLine label="Subtotal" value={formatMoney(pricing.subtotal)} />
          <SummaryLine label="Desconto de produtos" value={`-${formatMoney(pricing.productDiscount)}`} />
          <SummaryLine label="Cupom" value={`-${formatMoney(pricing.couponDiscount)}`} />
          <SummaryLine label="Frete estimado" value={pricing.shipping === 0 ? "Grátis" : formatMoney(pricing.shipping)} />
          <div className="mt-2 flex items-center justify-between border-t border-rosebrand-100 pt-4 text-base font-black">
            <dt>Total</dt>
            <dd>{formatMoney(pricing.total)}</dd>
          </div>
        </dl>
        <Button href="/checkout" className="mt-5 w-full">
          Finalizar compra
        </Button>
        <Button href="/produtos" variant="secondary" className="mt-3 w-full">
          Continuar comprando
        </Button>
      </aside>
    </section>
  );
}

function SummaryLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-neutral-600">
      <dt>{label}</dt>
      <dd className="font-bold text-ink">{value}</dd>
    </div>
  );
}
