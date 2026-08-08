import type { Metadata } from "next";
import { RegisterForm } from "@/components/account/AuthForms";

export const metadata: Metadata = {
  title: "Cadastro",
  description: "Crie sua conta Barb's Closet com senha segura."
};

export default function RegisterPage() {
  return <RegisterForm />;
}
