import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/product/ProductDetail";
import { getProductBySlug, products } from "@/lib/data";
import { formatMoney } from "@/lib/format";

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return {};

  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: product.images
    },
    alternates: {
      canonical: `/produto/${product.slug}`
    }
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.sku,
    image: product.images,
    description: product.description,
    brand: { "@type": "Brand", name: "Barb's Closet" },
    offers: {
      "@type": "Offer",
      priceCurrency: "BRL",
      price: (product.salePrice ?? product.price).toFixed(2),
      availability: product.variants.some((variant) => variant.stock > 0) ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `/produto/${product.slug}`
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: product.reviews
    }
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <ProductDetail product={product} />
      <p className="sr-only">Preço atual: {formatMoney(product.salePrice ?? product.price)}</p>
    </>
  );
}
