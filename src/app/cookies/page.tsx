import type { Metadata } from "next";
import { PolicyPage } from "@/components/layout/PolicyPage";

export const metadata: Metadata = {
  title: "Política de Cookies",
  description: "Política de cookies da Barb's Closet."
};

export default function CookiesPage() {
  return (
    <PolicyPage
      title="Política de Cookies"
      sections={[
        ["Cookies necessários", "Mantêm funcionalidades como carrinho, sessão, preferências e segurança."],
        ["Métricas", "Ferramentas de analytics devem ser configuradas com consentimento quando necessário."],
        ["Marketing", "Pixels e campanhas devem respeitar preferências do usuário e bases legais aplicáveis."],
        ["Gerenciamento", "O banner de cookies pode ser expandido para permitir categorias e revogação de consentimento."]
      ]}
    />
  );
}
