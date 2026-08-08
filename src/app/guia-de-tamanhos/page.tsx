import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { SizeGuideWidget } from "@/components/product/SizeGuideWidget";

export const metadata: Metadata = {
  title: "Guia de tamanhos",
  description: "Encontre uma recomendação de tamanho para roupas femininas da Barb's Closet."
};

export default function SizeGuidePage() {
  return (
    <>
      <PageHeader title="Guia de tamanhos" subtitle="Informe suas medidas para receber uma sugestão de P, M, G ou GG. A recomendação não substitui a tabela específica de cada produto." />
      <section className="container-shell glam-panel rounded-lg p-5">
        <SizeGuideWidget inline />
      </section>
    </>
  );
}
