import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/components/cart/CartProvider";
import { CookieBanner } from "@/components/layout/CookieBanner";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "Barb's Closet | Moda feminina, acessórios e semijoias",
    template: "%s | Barb's Closet"
  },
  description:
    "Loja virtual feminina com roupas, brincos, colares, pulseiras, acessórios, prata, ouro e semijoias selecionadas.",
  openGraph: {
    title: "Barb's Closet",
    description: "Moda feminina e semijoias com estética glam, elegante e fácil de comprar.",
    siteName: "Barb's Closet",
    images: ["/images/hero/barbs-closet-hero.png"],
    locale: "pt_BR",
    type: "website"
  },
  icons: {
    icon: "/brand/favicon.svg"
  },
  alternates: {
    canonical: "/"
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>
        <CartProvider>
          <Header />
          <main>{children}</main>
          <Footer />
          <WhatsAppButton />
          <CookieBanner />
        </CartProvider>
      </body>
    </html>
  );
}
