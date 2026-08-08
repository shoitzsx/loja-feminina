export function buildWhatsAppUrl(message: string, phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER) {
  const digits = (phone ?? "").replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
