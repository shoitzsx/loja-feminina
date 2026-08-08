import { formatMoney } from "@/lib/format";
import { calculateCartPricing } from "@/lib/pricing";
import type { CheckoutPayload } from "@/lib/types";
import { sendAdminSaleEmail } from "./integrations/email";
import { requestInvoiceIssue } from "./integrations/fiscal";
import { createPaymentIntent } from "./integrations/payment";
import { sendAdminWhatsApp } from "./integrations/whatsapp";

export async function createCheckoutOrder(payload: CheckoutPayload) {
  const pricing = calculateCartPricing(payload.items, payload.couponCode, payload.shippingOptionId);

  if (!pricing.lines.length) {
    throw new Error("Carrinho vazio ou itens indisponíveis.");
  }

  const orderNumber = `BC${Date.now().toString().slice(-8)}`;
  const customerName = `${payload.customer.firstName} ${payload.customer.lastName}`.trim();
  const paymentIntent = await createPaymentIntent({
    orderNumber,
    amount: pricing.total,
    customerEmail: payload.customer.email,
    method: payload.paymentMethod
  });

  return {
    orderNumber,
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
