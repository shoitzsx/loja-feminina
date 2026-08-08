import type { Metadata } from "next";
import { PolicyPage } from "@/components/layout/PolicyPage";

export const metadata: Metadata = {
  title: "Termos de Uso",
  description: "Termos de uso da Barb's Closet."
};

export default function TermsPage() {
  return (
    <PolicyPage
      title="Termos de Uso"
      sections={[
        ["Uso da loja", "Ao navegar e comprar, o cliente concorda com os fluxos de cadastro, pagamento, entrega e atendimento apresentados."],
        ["Preços e estoque", "Preços, descontos, frete e estoque são sempre recalculados pelo backend no fechamento do pedido."],
        ["Pagamentos", "A confirmação de pagamento depende do gateway e dos webhooks verificados no servidor."],
        ["Responsabilidades", "A loja mantém dados protegidos e o cliente deve fornecer informações corretas para entrega e emissão fiscal."]
      ]}
    />
  );
}
