import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

/** Convite para o cliente pedir o que não encontrou. Por enquanto abre o WhatsApp da loja. */
export function SuggestionBox({ term }: { term?: string }) {
  const message = term
    ? `Olá! Procurei por "${term}" na Barb’s Closet e não encontrei. Podem me ajudar ou considerar trazer?`
    : "Olá! Não encontrei o que queria na Barb’s Closet. Minha sugestão é:";

  return (
    <aside className="glam-panel mt-8 flex flex-col items-start gap-4 rounded-lg p-6 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-lg font-black text-ink">Não achou o que queria?</h2>
        <p className="mt-1 text-sm leading-6 text-muted">Envie sua sugestão por aqui: conta pra gente o que você procura e a gente tenta trazer.</p>
      </div>
      <Button href={buildWhatsAppUrl(message)} target="_blank" rel="noreferrer">
        <MessageCircle className="size-4" /> Enviar sugestão
      </Button>
    </aside>
  );
}
