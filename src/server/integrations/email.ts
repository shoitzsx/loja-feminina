export type AdminSaleNotification = {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  address: string;
  items: string[];
  total: string;
  shipping: string;
  paymentMethod: string;
  purchasedAt: string;
};

export async function sendAdminSaleEmail(payload: AdminSaleNotification) {
  if (!process.env.EMAIL_API_KEY) {
    console.info("[email:mock] New paid order", payload);
    return { provider: "mock", id: `email_${payload.orderNumber}` };
  }

  throw new Error("EMAIL_API_KEY is configured, but the email provider adapter still needs the selected vendor endpoint.");
}
