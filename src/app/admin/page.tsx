import type { Metadata } from "next";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

export const metadata: Metadata = {
  title: "Admin",
  description: "Painel administrativo protegido da Barb's Closet."
};

export default function AdminPage() {
  return <AdminDashboard />;
}
