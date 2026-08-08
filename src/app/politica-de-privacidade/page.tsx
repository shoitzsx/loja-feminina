import type { Metadata } from "next";
import { PolicyPage } from "@/components/layout/PolicyPage";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description: "Política de privacidade e LGPD da Barb's Closet."
};

export default function PrivacyPage() {
  return <PolicyPage title="Política de Privacidade" sections={privacySections} />;
}

const privacySections: Array<[string, string]> = [
  ["Dados coletados", "Coletamos apenas dados necessários para cadastro, entrega, pagamento, atendimento e prevenção a fraude."],
  ["Finalidades", "Os dados são usados para processar pedidos, calcular frete, emitir documentos fiscais quando aplicável e melhorar a experiência."],
  ["Segurança", "Aplicamos controle de acesso, logs, criptografia em trânsito, cookies seguros e armazenamento mínimo de dados pessoais."],
  ["Direitos do titular", "O cliente pode solicitar acesso, correção, portabilidade, anonimização ou exclusão conforme a LGPD."],
  ["Cookies", "Cookies necessários mantêm carrinho e sessão. Métricas e marketing dependem de configuração e consentimento quando exigido."]
];
