import type { Metadata } from "next";
import { PolicyPage } from "@/components/layout/PolicyPage";

export const metadata: Metadata = {
  title: "Trocas e Devoluções",
  description: "Política de trocas e devoluções da Barb's Closet."
};

export default function ExchangesPage() {
  return (
    <PolicyPage
      title="Trocas e Devoluções"
      sections={[
        ["Prazo", "Solicitações seguem os prazos legais aplicáveis e devem informar número do pedido e motivo."],
        ["Condição do produto", "Produtos devem retornar sem uso, com embalagem e acessórios, salvo vício ou defeito constatado."],
        ["Atendimento", "A solicitação pode ser iniciada pelo WhatsApp ou e-mail, com acompanhamento pelo painel do cliente."],
        ["Reembolso", "O reembolso é processado pelo mesmo meio de pagamento quando aplicável, após análise do recebimento."]
      ]}
    />
  );
}
