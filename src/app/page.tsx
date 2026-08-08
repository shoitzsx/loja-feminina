import { ArrowRight, ShieldCheck, Sparkles, Truck } from "lucide-react";
import Image from "next/image";
import { CategoryCarousel } from "@/components/product/CategoryCarousel";
import { ProductSections } from "@/components/product/ProductSections";
import { Button } from "@/components/ui/Button";
import { brandLogoPath } from "@/lib/brand-assets";
import { absoluteUrl } from "@/lib/site-url";

const structuredData = {
  "@context": "https://schema.org",
  "@type": "Store",
  name: "Barb's Closet",
  url: absoluteUrl("/"),
  image: absoluteUrl("/images/hero/barbs-closet-hero.png"),
  logo: absoluteUrl(brandLogoPath),
  description: "Loja virtual feminina de roupas, acessórios e semijoias.",
  paymentAccepted: ["PIX", "Cartão de crédito", "Boleto"],
  currenciesAccepted: "BRL"
};

export default function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <section className="relative isolate min-h-[620px] overflow-hidden bg-rosebrand-100 sm:min-h-[calc(100vh-120px)] sm:max-h-[780px]">
        <Image src="/images/hero/barbs-closet-hero.png" alt="Coleção feminina Barb's Closet com roupas e acessórios em tons de rosa" fill priority className="object-cover object-center" sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-r from-rosebrand-50 via-rosebrand-50/82 to-rosebrand-100/5" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-rosebrand-100/80 to-transparent" />
        <div className="container-shell relative flex min-h-[620px] items-center py-14 sm:min-h-[calc(100vh-120px)] sm:max-h-[780px]">
          <div className="max-w-xl animate-rise-in">
            <p className="text-xs font-black uppercase text-rosebrand-600">Lançamentos Barb’s Closet</p>
            <h1 className="mt-4 text-4xl font-black leading-tight text-ink sm:text-5xl lg:text-6xl">
              Moda feminina e semijoias para brilhar com leveza.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-neutral-700">
              Roupas, colares, brincos e pulseiras em uma curadoria glam, elegante e fácil de comprar.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button href="/produtos">
                Comprar agora
                <ArrowRight className="size-4" />
              </Button>
              <Button href="/novidades" variant="secondary">
                Conhecer coleção
              </Button>
            </div>
            <div className="mt-8 grid gap-3 text-sm font-bold text-neutral-700 sm:grid-cols-3">
              <HeroBenefit icon={<Truck className="size-5" />} label="Frete grátis acima de R$ 299" />
              <HeroBenefit icon={<ShieldCheck className="size-5" />} label="Checkout seguro" />
              <HeroBenefit icon={<Sparkles className="size-5" />} label="Prata, ouro e glam" />
            </div>
          </div>
        </div>
      </section>
      <CategoryCarousel />
      <ProductSections />
    </>
  );
}

function HeroBenefit({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-lg border border-rosebrand-200 bg-rosebrand-50/95 px-3 py-2 shadow-card transition hover:-translate-y-0.5 hover:bg-rosebrand-100">
      <span className="text-rosebrand-600">{icon}</span>
      <span>{label}</span>
    </div>
  );
}
