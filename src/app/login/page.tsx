import type { Metadata } from "next";
import { LoginForm } from "@/components/account/AuthForms";

export const metadata: Metadata = {
  title: "Login",
  description: "Acesse sua conta Barb's Closet."
};

export default function LoginPage() {
  return <LoginForm />;
}
