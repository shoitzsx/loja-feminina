import { NextRequest, NextResponse } from "next/server";
import { products } from "@/lib/data";
import { normalizeSearch } from "@/lib/format";
import { rateLimit } from "@/server/security";

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "local";
  const limited = rateLimit(`search:${ip}`, 60, 60_000);
  if (!limited.allowed) return NextResponse.json({ error: "Muitas buscas. Tente novamente em instantes." }, { status: 429 });

  const query = normalizeSearch(request.nextUrl.searchParams.get("q") ?? "");
  if (!query) return NextResponse.json({ products: [] });

  const result = products
    .filter((product) => {
      const haystack = normalizeSearch(
        [product.name, product.categoryName, product.sku, product.collection, product.colors.join(" "), product.materials.join(" "), product.description].join(" ")
      );
      return haystack.includes(query);
    })
    .slice(0, 20)
    .map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      image: product.images[0],
      category: product.categoryName,
      price: product.salePrice ?? product.price
    }));

  return NextResponse.json({ products: result });
}
