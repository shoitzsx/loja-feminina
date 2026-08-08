import type { MetadataRoute } from "next";
import { categories, products } from "@/lib/data";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const staticRoutes = [
    "",
    "/produtos",
    "/promocoes",
    "/novidades",
    "/mais-vendidos",
    "/busca",
    "/carrinho",
    "/checkout",
    "/login",
    "/cadastro",
    "/minha-conta",
    "/meus-pedidos",
    "/favoritos",
    "/guia-de-tamanhos",
    "/sobre",
    "/contato",
    "/politica-de-privacidade",
    "/politica-de-entrega",
    "/trocas-e-devolucoes",
    "/cookies"
  ];

  return [
    ...staticRoutes.map((route) => ({ url: `${baseUrl}${route}`, lastModified: new Date() })),
    ...categories.map((category) => ({ url: `${baseUrl}/categoria/${category.slug}`, lastModified: new Date() })),
    ...products.map((product) => ({ url: `${baseUrl}/produto/${product.slug}`, lastModified: new Date(product.createdAt) }))
  ];
}
