import type { Category, CategorySlug, Product, ShippingOption } from "./types";

const clothingImage = "/images/categories/roupas.png";
const necklaceImage = "/images/categories/colares.png";
const earringsImage = "/images/categories/brincos.png";
const braceletImage = "/images/categories/pulseiras.png";

export const categories: Category[] = [
  {
    name: "Roupas",
    slug: "roupas",
    image: clothingImage,
    description: "Vestidos, blusas e peças femininas com caimento elegante."
  },
  {
    name: "Pulseiras",
    slug: "pulseiras",
    image: braceletImage,
    description: "Pulseiras delicadas em prata, ouro e banhos especiais."
  },
  {
    name: "Colares",
    slug: "colares",
    image: necklaceImage,
    description: "Colares finos, camadas e pontos de luz para todos os dias."
  },
  {
    name: "Brincos",
    slug: "brincos",
    image: earringsImage,
    description: "Argolas, pérolas e cristais com brilho sofisticado."
  }
];

export const products: Product[] = [
  {
    id: "prod_rose-midi",
    name: "Vestido Midi Rosa Glam",
    slug: "vestido-midi-rosa-glam",
    sku: "BC-ROUP-001",
    category: "roupas",
    categoryName: "Roupas",
    collection: "Glam Edition",
    description:
      "Vestido midi em tom rosa vibrante com toque acetinado, cintura marcada e acabamento delicado para eventos e produções femininas.",
    details: ["Tecido com toque acetinado", "Cintura marcada", "Forro leve", "Modelagem elegante"],
    care: ["Lavar à mão", "Não usar alvejante", "Secar à sombra"],
    price: 289.9,
    salePrice: 239.9,
    images: [clothingImage, "/images/hero/barbs-closet-hero.png"],
    alt: "Vestido midi rosa e camisa feminina em foto editorial",
    colors: ["Rosa", "Branco"],
    materials: ["Poliéster premium", "Elastano"],
    sizes: ["P", "M", "G", "GG"],
    rating: 4.9,
    reviews: 38,
    salesLast7Days: 46,
    createdAt: "2026-08-01",
    isRecommended: true,
    variants: [
      { id: "var_rose-p", sku: "BC-ROUP-001-P", size: "P", color: "Rosa", material: "Poliéster premium", stock: 5, lowStockAlert: 3 },
      { id: "var_rose-m", sku: "BC-ROUP-001-M", size: "M", color: "Rosa", material: "Poliéster premium", stock: 10, lowStockAlert: 3 },
      { id: "var_rose-g", sku: "BC-ROUP-001-G", size: "G", color: "Rosa", material: "Poliéster premium", stock: 4, lowStockAlert: 3 },
      { id: "var_rose-gg", sku: "BC-ROUP-001-GG", size: "GG", color: "Rosa", material: "Poliéster premium", stock: 2, lowStockAlert: 3 }
    ]
  },
  {
    id: "prod-white-blouse",
    name: "Camisa Cetim Pérola",
    slug: "camisa-cetim-perola",
    sku: "BC-ROUP-002",
    category: "roupas",
    categoryName: "Roupas",
    collection: "Essentials",
    description:
      "Camisa feminina em cetim branco perolado, perfeita para compor looks sofisticados com acessórios dourados ou prateados.",
    details: ["Gola estruturada", "Punho com detalhe delicado", "Toque macio", "Caimento fluido"],
    care: ["Lavar do avesso", "Passar em baixa temperatura", "Guardar em cabide"],
    price: 219.9,
    images: [clothingImage],
    alt: "Camisa feminina branca em cetim com vestido rosa",
    colors: ["Branco"],
    materials: ["Cetim"],
    sizes: ["P", "M", "G"],
    rating: 4.8,
    reviews: 21,
    salesLast7Days: 28,
    createdAt: "2026-07-26",
    variants: [
      { id: "var_blouse-p", sku: "BC-ROUP-002-P", size: "P", color: "Branco", material: "Cetim", stock: 7, lowStockAlert: 3 },
      { id: "var_blouse-m", sku: "BC-ROUP-002-M", size: "M", color: "Branco", material: "Cetim", stock: 6, lowStockAlert: 3 },
      { id: "var_blouse-g", sku: "BC-ROUP-002-G", size: "G", color: "Branco", material: "Cetim", stock: 3, lowStockAlert: 3 }
    ]
  },
  {
    id: "prod-silver-light",
    name: "Colar Prata Ponto de Luz",
    slug: "colar-prata-ponto-de-luz",
    sku: "BC-COL-001",
    category: "colares",
    categoryName: "Colares",
    collection: "Luz",
    description:
      "Colar delicado em prata com ponto de luz, ideal para usar sozinho ou em composição com outras correntes.",
    details: ["Prata 925", "Pingente ponto de luz", "Corrente fina", "Fecho lagosta"],
    care: ["Evitar contato com perfume", "Guardar separado", "Limpar com flanela seca"],
    price: 159.9,
    salePrice: 129.9,
    images: [necklaceImage],
    alt: "Colares delicados em prata e ouro sobre bandeja de mármore",
    colors: ["Prata"],
    materials: ["Prata 925", "Zircônia"],
    sizes: ["Único"],
    rating: 4.9,
    reviews: 64,
    salesLast7Days: 58,
    createdAt: "2026-08-03",
    isRecommended: true,
    variants: [
      { id: "var_silver-light", sku: "BC-COL-001-U", size: "Único", color: "Prata", material: "Prata 925", stock: 14, lowStockAlert: 4, dimensions: "45 cm" }
    ]
  },
  {
    id: "prod-gold-sun",
    name: "Colar Dourado Sol",
    slug: "colar-dourado-sol",
    sku: "BC-COL-002",
    category: "colares",
    categoryName: "Colares",
    collection: "Solar",
    description:
      "Colar dourado com medalha solar e banho premium, criado para destacar produções minimalistas com brilho elegante.",
    details: ["Banho dourado", "Medalha com zircônia", "Extensor regulável", "Acabamento polido"],
    care: ["Retirar antes do banho", "Evitar cosméticos", "Guardar em saquinho individual"],
    price: 139.9,
    images: [necklaceImage],
    alt: "Colar dourado com pingente em foto de produto",
    colors: ["Dourado"],
    materials: ["Banho de ouro", "Zircônia"],
    sizes: ["Único"],
    rating: 4.7,
    reviews: 19,
    salesLast7Days: 31,
    createdAt: "2026-07-30",
    variants: [
      { id: "var_gold-sun", sku: "BC-COL-002-U", size: "Único", color: "Dourado", material: "Banho de ouro", stock: 12, lowStockAlert: 4, dimensions: "45 cm + extensor" }
    ]
  },
  {
    id: "prod-pearl-hoops",
    name: "Kit Brincos Pérola & Argola",
    slug: "kit-brincos-perola-argola",
    sku: "BC-BRI-001",
    category: "brincos",
    categoryName: "Brincos",
    collection: "Classic Shine",
    description:
      "Kit versátil com argolas e brincos de pérola para alternar entre produções delicadas e composições mais glam.",
    details: ["Kit com pares coordenados", "Acabamentos dourado e prateado", "Pérolas sintéticas", "Leve no uso"],
    care: ["Guardar seco", "Evitar maresia", "Limpar suavemente após o uso"],
    price: 119.9,
    salePrice: 99.9,
    images: [earringsImage],
    alt: "Brincos de argola e pérola em ouro e prata",
    colors: ["Dourado", "Prata", "Pérola"],
    materials: ["Banho de ouro", "Ródio", "Pérola sintética"],
    sizes: ["Único"],
    rating: 4.8,
    reviews: 43,
    salesLast7Days: 52,
    createdAt: "2026-08-02",
    variants: [
      { id: "var_pearl-hoops", sku: "BC-BRI-001-U", size: "Único", color: "Misto", material: "Banho de ouro e ródio", stock: 18, lowStockAlert: 5, weightGrams: 8 }
    ]
  },
  {
    id: "prod-bracelet-charm",
    name: "Pulseira Prata Charms",
    slug: "pulseira-prata-charms",
    sku: "BC-PUL-001",
    category: "pulseiras",
    categoryName: "Pulseiras",
    collection: "Lucky",
    description:
      "Pulseira em prata com charms delicados e fecho ajustável, pensada para uso diário com toque feminino.",
    details: ["Prata 925", "Charms coração e estrela", "Fecho ajustável", "Acabamento brilhante"],
    care: ["Evitar cloro", "Guardar longe de umidade", "Polir com flanela própria"],
    price: 149.9,
    images: [braceletImage],
    alt: "Pulseiras delicadas em prata e ouro sobre mármore",
    colors: ["Prata"],
    materials: ["Prata 925", "Zircônia"],
    sizes: ["Único"],
    rating: 4.9,
    reviews: 27,
    salesLast7Days: 39,
    createdAt: "2026-08-04",
    isRecommended: true,
    variants: [
      { id: "var_bracelet-charm", sku: "BC-PUL-001-U", size: "Único", color: "Prata", material: "Prata 925", stock: 9, lowStockAlert: 4, dimensions: "16 cm a 20 cm" }
    ]
  },
  {
    id: "prod-gold-bangle",
    name: "Bracelete Nó Dourado",
    slug: "bracelete-no-dourado",
    sku: "BC-PUL-002",
    category: "pulseiras",
    categoryName: "Pulseiras",
    collection: "Golden Hour",
    description:
      "Bracelete rígido dourado com design de nó, acabamento polido e presença elegante para looks noturnos.",
    details: ["Banho dourado premium", "Design rígido", "Detalhe de nó", "Ajuste confortável"],
    care: ["Evitar atrito intenso", "Não molhar", "Guardar em embalagem macia"],
    price: 179.9,
    salePrice: 149.9,
    images: [braceletImage],
    alt: "Bracelete dourado e pulseiras em foto de semijoia",
    colors: ["Dourado"],
    materials: ["Banho de ouro"],
    sizes: ["Único"],
    rating: 4.7,
    reviews: 16,
    salesLast7Days: 24,
    createdAt: "2026-07-25",
    variants: [
      { id: "var_gold-bangle", sku: "BC-PUL-002-U", size: "Único", color: "Dourado", material: "Banho de ouro", stock: 5, lowStockAlert: 3, dimensions: "Ajustável" }
    ]
  },
  {
    id: "prod-earring-crystal",
    name: "Brinco Cristal Glam",
    slug: "brinco-cristal-glam",
    sku: "BC-BRI-002",
    category: "brincos",
    categoryName: "Brincos",
    collection: "Night Out",
    description:
      "Brinco pendente com cristal e banho dourado, criado para iluminar eventos com sofisticação.",
    details: ["Cristal lapidado", "Banho dourado", "Pendente leve", "Fecho seguro"],
    care: ["Evitar queda", "Guardar separado", "Não aplicar perfume sobre a peça"],
    price: 129.9,
    images: [earringsImage],
    alt: "Brincos de cristal em ouro e prata sobre tecido rosa",
    colors: ["Dourado", "Cristal"],
    materials: ["Banho de ouro", "Cristal"],
    sizes: ["Único"],
    rating: 4.6,
    reviews: 12,
    salesLast7Days: 18,
    createdAt: "2026-08-05",
    variants: [
      { id: "var_earring-crystal", sku: "BC-BRI-002-U", size: "Único", color: "Dourado", material: "Banho de ouro", stock: 11, lowStockAlert: 4, weightGrams: 6 }
    ]
  }
];

export const shippingOptions: ShippingOption[] = [
  { id: "standard", label: "Entrega padrão", price: 19.9, estimate: "5 a 8 dias úteis" },
  { id: "express", label: "Entrega expressa", price: 34.9, estimate: "2 a 4 dias úteis" },
  { id: "free", label: "Frete grátis acima de R$ 299", price: 0, estimate: "6 a 10 dias úteis" }
];

export const coupons = [
  { code: "BARBS10", percentOff: 10, minSubtotal: 149 },
  { code: "GLAM20", amountOff: 20, minSubtotal: 199 }
];

export function getProductBySlug(slug: string) {
  return products.find((product) => product.slug === slug);
}

export function getCategoryBySlug(slug: string) {
  return categories.find((category) => category.slug === slug);
}

export function productsByCategory(slug: CategorySlug) {
  if (slug === "acessorios") return products.filter((product) => product.category !== "roupas");
  if (slug === "prata") return products.filter((product) => product.materials.some((material) => material.toLowerCase().includes("prata")));
  if (slug === "ouro") return products.filter((product) => product.materials.some((material) => material.toLowerCase().includes("ouro")));
  return products.filter((product) => product.category === slug);
}
