export type CategorySlug =
  | "roupas"
  | "acessorios"
  | "colares"
  | "brincos"
  | "pulseiras"
  | "prata"
  | "ouro";

export type ProductBadge = "PROMOCAO" | "MAIS_VENDIDO" | "NOVO";

export type ProductVariant = {
  id: string;
  sku: string;
  size?: string;
  color?: string;
  material: string;
  stock: number;
  lowStockAlert: number;
  weightGrams?: number;
  dimensions?: string;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  category: CategorySlug;
  categoryName: string;
  collection: string;
  description: string;
  details: string[];
  care: string[];
  price: number;
  salePrice?: number;
  images: string[];
  alt: string;
  colors: string[];
  materials: string[];
  sizes: string[];
  rating: number;
  reviews: number;
  salesLast7Days: number;
  createdAt: string;
  isRecommended?: boolean;
  variants: ProductVariant[];
};

export type Category = {
  name: string;
  slug: CategorySlug;
  image: string;
  description: string;
};

export type CartLine = {
  productId: string;
  variantId: string;
  quantity: number;
};

export type ShippingOption = {
  id: string;
  label: string;
  price: number;
  estimate: string;
};

export type CheckoutPayload = {
  customer: {
    firstName: string;
    lastName: string;
    cpf?: string;
    phone: string;
    email: string;
  };
  address: {
    zipCode: string;
    street: string;
    number: string;
    complement?: string;
    district: string;
    city: string;
    state: string;
  };
  items: CartLine[];
  couponCode?: string;
  shippingOptionId: string;
  paymentMethod: "PIX" | "CREDIT_CARD" | "DEBIT_CARD" | "BOLETO";
};
