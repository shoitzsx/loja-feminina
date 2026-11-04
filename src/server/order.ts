import { formatMoney } from "@/lib/format";
import { calculateCartPricing } from "@/lib/pricing";
import type { CheckoutPayload } from "@/lib/types";
import { sendAdminSaleEmail } from "./integrations/email";
import { requestInvoiceIssue } from "./integrations/fiscal";
import { createPaymentIntent } from "./integrations/payment";
import { sendAdminWhatsApp } from "./integrations/whatsapp";
import { encryptField } from "./crypto";
import { getDb } from "./db";
import { generateOrderNumber } from "./order-number";
import { hashGuestToken, newGuestToken, saveOrder } from "./order-repo";

/** Erro com mensagem segura para mostrar ao cliente. */
export class CheckoutError extends Error {}

export async function createCheckoutOrder(payload: CheckoutPayload, options: { userId?: string } = {}) {
  const pricing = calculateCartPricing(payload.items, payload.couponCode, payload.shippingOptionId);

  if (!pricing.lines.length) {
    throw new CheckoutError("Carrinho vazio ou itens indisponíveis.");
  }

  const orderNumber = generateOrderNumber();
  const customerName = `${payload.customer.firstName} ${payload.customer.lastName}`.trim();
  const paymentIntent = await createPaymentIntent({
    orderNumber,
    amount: pricing.total,
    customerEmail: payload.customer.email,
    method: payload.paymentMethod
  });

  // Com banco configurado, o pedido é gravado ANTES de responder (falha = erro, nunca "pedido fantasma").
  // O dono é o usuário da sessão; sem sessão, o convidado recebe um token (só o hash fica no banco).
  let guestToken: string | undefined;
  const db = getDb();
  if (db) {
    guestToken = options.userId ? undefined : newGuestToken();
    await saveOrder(db, {
      orderNumber,
      userId: options.userId ?? null,
      guestTokenHash: guestToken ? hashGuestToken(guestToken) : null,
      customerName,
      customerEmail: payload.customer.email,
      customerPhoneEncrypted: encryptField(payload.customer.phone),
      shippingAddress: { ...payload.address },
      shippingMethod: payload.shippingOptionId,
      paymentMethod: payload.paymentMethod,
      provider: paymentIntent.provider,
      providerRef: paymentIntent.providerRef,
      subtotal: pricing.subtotal,
      discount: pricing.couponDiscount,
      shipping: pricing.shipping,
      total: pricing.total,
      items: pricing.lines.map((line) => ({ slug: line.slug, name: line.name, sku: line.sku, size: line.size, color: line.color, quantity: line.quantity, unitPrice: line.unitPrice, subtotal: line.subtotal }))
    });
  }

  return {
    orderNumber,
    guestToken,
    status: "PENDING_PAYMENT",
    customerName,
    pricing,
    paymentIntent,
    confirmation:
      "Pedido criado. O status pago só deve ser aplicado pelo webhook confirmado do gateway, nunca pelo retorno do navegador."
  };
}

export async function handlePaidOrderNotification(orderNumber: string, payload: CheckoutPayload) {
  const pricing = calculateCartPricing(payload.items, payload.couponCode, payload.shippingOptionId);
  const customerName = `${payload.customer.firstName} ${payload.customer.lastName}`.trim();
  const address = `${payload.address.street}, ${payload.address.number}${payload.address.complement ? ` - ${payload.address.complement}` : ""}, ${payload.address.district}, ${payload.address.city}/${payload.address.state}, CEP ${payload.address.zipCode}`;
  const notification = {
    orderNumber,
    customerName,
    customerPhone: payload.customer.phone,
    customerEmail: payload.customer.email,
    address,
    items: pricing.lines.map((line) => `${line.quantity}x ${line.name} ${line.size ?? ""} (${line.sku})`),
    total: formatMoney(pricing.total),
    shipping: formatMoney(pricing.shipping),
    paymentMethod: payload.paymentMethod,
    purchasedAt: new Date().toISOString()
  };

  await Promise.all([sendAdminSaleEmail(notification), sendAdminWhatsApp(notification)]);

  return requestInvoiceIssue({
    orderNumber,
    customerName,
    customerCpf: payload.customer.cpf,
    items: pricing.lines.map((line) => ({
      sku: line.sku,
      name: line.name,
      quantity: line.quantity,
      total: line.subtotal
    })),
    total: pricing.total
  });
}
