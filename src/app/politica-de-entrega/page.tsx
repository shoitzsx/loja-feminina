import type { Metadata } from "next";
import { PolicyPage } from "@/components/layout/PolicyPage";

export const metadata: Metadata = {
  title: "Política de Entrega",
  description: "Política de entrega da Barb's Closet."
};

export default function DeliveryPolicyPage() {
  return (
    <PolicyPage
      title="Política de Entrega"
      sections={[
        ["Modalidades", "O checkout apresenta modalidades de entrega, preço e prazo estimado conforme o CEP informado e integrações disponíveis."],
        ["Prazos", "O prazo começa após confirmação de pagamento pelo gateway e preparação do pedido."],
        ["Endereço", "O cliente é responsável por conferir CEP, rua, número, complemento, bairro, cidade e estado antes da finalização."],
        ["Acompanhamento", "O status pode evoluir entre pagamento pendente, aprovado, preparando, enviado, entregue ou cancelado."]
      ]}
    />
  );
}
