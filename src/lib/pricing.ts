import { coupons, products, shippingOptions } from "./data";
import { discountPercent } from "./format";
import type { CartLine } from "./types";

export type PricedLine = {
  productId: string;
  variantId: string;
  name: string;
  slug: string;
  sku: string;
  image: string;
  size: string | undefined;
  color: string | undefined;
  quantity: number;
  unitPrice: number;
  originalPrice: number;
  discountPercent: number;
  subtotal: number;
  stock: number;
};

export type CartPricing = {
  lines: PricedLine[];
  subtotal: number;
  productDiscount: number;
  couponDiscount: number;
  shipping: number;
  total: number;
  couponMessage?: string;
};

export function calculateCartPricing(items: CartLine[], couponCode?: string, shippingOptionId = "standard"): CartPricing {
  const lines = items
    .map((item) => {
      const product = products.find((candidate) => candidate.id === item.productId);
      const variant = product?.variants.find((candidate) => candidate.id === item.variantId);
      if (!product || !variant) return null;

      const availableQuantity = Math.max(0, Math.min(item.quantity, variant.stock));
      const unitPrice = product.salePrice ?? product.price;
      const subtotal = unitPrice * availableQuantity;

      return {
        productId: product.id,
        variantId: variant.id,
        name: product.name,
        slug: product.slug,
        sku: variant.sku,
        image: product.images[0],
        size: variant.size,
        color: variant.color,
        quantity: availableQuantity,
        unitPrice,
        originalPrice: product.price,
        discountPercent: discountPercent(product.price, product.salePrice),
        subtotal,
        stock: variant.stock
      };
    })
    .filter((line): line is PricedLine => Boolean(line && line.quantity > 0));

  const subtotal = roundMoney(lines.reduce((total, line) => total + line.subtotal, 0));
  const productDiscount = roundMoney(
    lines.reduce((total, line) => total + Math.max(0, line.originalPrice - line.unitPrice) * line.quantity, 0)
  );

  const normalizedCoupon = couponCode?.trim().toUpperCase();
  const coupon = normalizedCoupon ? coupons.find((candidate) => candidate.code === normalizedCoupon) : undefined;
  let couponDiscount = 0;
  let couponMessage: string | undefined;

  if (normalizedCoupon && !coupon) {
    couponMessage = "Cupom não encontrado.";
  }

  if (coupon && subtotal < coupon.minSubtotal) {
    couponMessage = `Cupom válido para compras acima de R$ ${coupon.minSubtotal.toFixed(2).replace(".", ",")}.`;
  }

  if (coupon && subtotal >= coupon.minSubtotal) {
    couponDiscount = coupon.percentOff ? subtotal * (coupon.percentOff / 100) : coupon.amountOff ?? 0;
    couponDiscount = Math.min(roundMoney(couponDiscount), subtotal);
    couponMessage = `Cupom ${coupon.code} aplicado.`;
  }

  const requestedShipping = shippingOptions.find((option) => option.id === shippingOptionId) ?? shippingOptions[0];
  const shipping = subtotal >= 299 ? 0 : requestedShipping.price;
  const total = Math.max(0, roundMoney(subtotal - couponDiscount + shipping));

  return {
    lines,
    subtotal,
    productDiscount,
    couponDiscount,
    shipping: roundMoney(shipping),
    total,
    couponMessage
  };
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}
