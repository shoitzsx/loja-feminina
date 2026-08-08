import type { Metadata } from "next";
import { CheckoutFlow } from "@/components/checkout/CheckoutFlow";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Checkout seguro da Barb's Closet com identificação, endereço, entrega, pagamento e confirmação."
};

export default function CheckoutPage() {
  return <CheckoutFlow />;
}
