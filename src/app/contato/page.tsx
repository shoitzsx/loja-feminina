import type { Metadata } from "next";
import { Mail, MessageCircle, Phone } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Contato",
  description: "Fale com a Barb's Closet."
};

export default function ContactPage() {
  return (
    <>
      <PageHeader title="Contato" subtitle="Precisa de ajuda com produto, tamanho, pedido ou troca? Nossa estrutura está pronta para atendimento multicanal." />
      <section className="container-shell grid gap-4 py-8 md:grid-cols-3">
        <ContactCard icon={<MessageCircle className="size-6" />} title="WhatsApp" text="Atendimento rápido para dúvidas de compra." action={<Button href={buildWhatsAppUrl("Olá! Estou visitando a Barb’s Closet e gostaria de ajuda.")} target="_blank" rel="noreferrer">Chamar no WhatsApp</Button>} />
        <ContactCard icon={<Mail className="size-6" />} title="E-mail" text="admin@barbscloset.com.br" />
        <ContactCard icon={<Phone className="size-6" />} title="Horários" text="Segunda a sexta, 9h às 18h." />
      </section>
    </>
  );
}

function ContactCard({ icon, title, text, action }: { icon: React.ReactNode; title: string; text: string; action?: React.ReactNode }) {
  return (
    <article className="glam-panel glam-hover rounded-lg p-5">
      <div className="text-rosebrand-600">{icon}</div>
      <h2 className="mt-4 text-lg font-black text-ink">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-neutral-600">{text}</p>
      {action && <div className="mt-4">{action}</div>}
    </article>
  );
}
