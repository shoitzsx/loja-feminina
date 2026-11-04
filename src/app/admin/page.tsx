import type { Metadata } from "next";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { requireAdmin } from "@/server/admin";

export const metadata: Metadata = {
  title: "Admin",
  description: "Painel administrativo da Barb's Closet.",
  robots: { index: false, follow: false }
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await requireAdmin();
  return <AdminDashboard />;
}
