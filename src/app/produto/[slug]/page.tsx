import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/product/ProductDetail";
import { getProductBySlug, products } from "@/lib/data";
import { formatMoney } from "@/lib/format";
import { absoluteUrl } from "@/lib/site-url";

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return {};
  const productUrl = absoluteUrl(`/produto/${product.slug}`);
  const productImages = product.images.map((image) => absoluteUrl(image));

  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      url: productUrl,
      images: productImages,
      siteName: "Barb's Closet",
      locale: "pt_BR",
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: product.description,
      images: productImages
    },
    alternates: {
      canonical: productUrl
    }
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();
  const productUrl = absoluteUrl(`/produto/${product.slug}`);
  const productImages = product.images.map((image) => absoluteUrl(image));

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.sku,
    image: productImages,
    description: product.description,
    brand: { "@type": "Brand", name: "Barb's Closet" },
    offers: {
      "@type": "Offer",
      priceCurrency: "BRL",
      price: (product.salePrice ?? product.price).toFixed(2),
      availability: product.variants.some((variant) => variant.stock > 0) ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: productUrl
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
