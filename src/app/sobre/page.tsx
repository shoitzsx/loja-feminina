import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";

export const metadata: Metadata = {
  title: "Sobre nós",
  description: "Conheça a Barb's Closet."
};

export default function AboutPage() {
  return (
    <>
      <PageHeader title="Sobre a Barb’s Closet" subtitle="Uma curadoria feminina de moda, acessórios e semijoias para vestir confiança em cada detalhe." />
      <section className="container-shell grid gap-6 py-8 md:grid-cols-3">
        {[
          ["Curadoria", "Selecionamos peças que combinam feminilidade, brilho e praticidade para o dia a dia."],
          ["Confiança", "Fluxos de compra, pagamento e dados pessoais são pensados com segurança desde a arquitetura."],
          ["Atendimento", "WhatsApp, e-mail e acompanhamento de pedidos ficam preparados para uma experiência próxima."]
        ].map(([title, text]) => (
          <article key={title} className="glam-panel glam-hover rounded-lg p-5">
            <h2 className="text-lg font-black text-ink">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-neutral-600">{text}</p>
          </article>
        ))}
      </section>
    </>
  );
}
