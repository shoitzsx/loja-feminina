import type { Metadata } from "next";
import { AccountDashboard } from "@/components/account/AccountDashboard";

export const metadata: Metadata = {
  title: "Minha Conta",
  description: "Área do cliente Barb's Closet."
};

export default function AccountPage() {
  return <AccountDashboard />;
}
