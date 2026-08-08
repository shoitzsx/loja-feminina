import type { AdminSaleNotification } from "./email";

export async function sendAdminWhatsApp(payload: AdminSaleNotification) {
  if (!process.env.WHATSAPP_ACCESS_TOKEN || !process.env.WHATSAPP_PHONE_NUMBER_ID) {
    console.info("[whatsapp:mock] New paid order", payload);
    return { provider: "mock", id: `whatsapp_${payload.orderNumber}` };
  }

  throw new Error("WhatsApp Business credentials are configured, but template IDs and sender approval must be configured.");
}
