"use client";

import { MessageCircle } from "lucide-react";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export function WhatsAppButton() {
  return (
    <a
      href={buildWhatsAppUrl("Olá! Estou visitando a Barb’s Closet e gostaria de ajuda.")}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-5 right-5 z-30 grid size-14 place-items-center rounded-full bg-[#25D366] text-white shadow-soft transition hover:scale-105"
      aria-label="Falar com a Barb's Closet no WhatsApp"
    >
      <MessageCircle className="size-6" />
    </a>
  );
}
