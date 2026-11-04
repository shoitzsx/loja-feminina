import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import "./themes.css";
import { CartProvider } from "@/components/cart/CartProvider";
import { CookieBanner } from "@/components/layout/CookieBanner";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { brandFaviconPath } from "@/lib/brand-assets";
import { absoluteUrl, siteUrl } from "@/lib/site-url";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Barb's Closet",
    template: "%s | Barb's Closet"
  },
  description:
    "Loja virtual feminina com roupas, brincos, colares, pulseiras, acessórios, prata, ouro e semijoias selecionadas.",
  openGraph: {
    title: "Barb's Closet",
    description: "Moda feminina e semijoias com estética glam, elegante e fácil de comprar.",
    url: absoluteUrl("/"),
    siteName: "Barb's Closet",
    images: [
      {
        url: absoluteUrl("/images/hero/barbs-closet-hero.png"),
        width: 1600,
        height: 900,
        alt: "Barb's Closet - moda feminina e semijoias"
      }
    ],
    locale: "pt_BR",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Barb's Closet",
    description: "Moda feminina e semijoias com estética glam, elegante e fácil de comprar.",
    images: [absoluteUrl("/images/hero/barbs-closet-hero.png")]
  },
  icons: {
    icon: brandFaviconPath,
    shortcut: brandFaviconPath,
    apple: brandFaviconPath
  },
  alternates: {
    canonical: absoluteUrl("/")
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${playfair.variable}`}>
      <body>
        <CartProvider>
          <Header />
          <main className="site-main">{children}</main>
          <Footer />
          <WhatsAppButton />
          <CookieBanner />
        </CartProvider>
      </body>
    </html>
  );
}
