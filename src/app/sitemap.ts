import type { MetadataRoute } from "next";
import { categories, products } from "@/lib/data";
import { absoluteUrl } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
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
    ...staticRoutes.map((route) => ({ url: absoluteUrl(route), lastModified: new Date() })),
    ...categories.map((category) => ({ url: absoluteUrl(`/categoria/${category.slug}`), lastModified: new Date() })),
    ...products.map((product) => ({ url: absoluteUrl(`/produto/${product.slug}`), lastModified: new Date(product.createdAt) }))
  ];
}
