import type { Metadata } from "next";
import { FavoritesView } from "@/components/account/FavoritesView";

export const metadata: Metadata = {
  title: "Favoritos",
  description: "Produtos favoritos da sua conta Barb's Closet."
};

export default function FavoritesPage() {
  return <FavoritesView />;
}
