"use client";

import { buildWhatsAppUrl } from "@/lib/whatsapp";

export function WhatsAppButton() {
  return (
    <a
      href={buildWhatsAppUrl("Olá! Estou visitando a Barb’s Closet e gostaria de ajuda.")}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-5 right-5 z-30 grid size-14 place-items-center rounded-full bg-[#25D366] shadow-soft transition duration-200 hover:scale-105 hover:shadow-glow active:scale-95"
      aria-label="Falar com a Barb's Closet no WhatsApp"
    >
      <span
        aria-hidden="true"
        className="block size-8 bg-white"
        style={{
          WebkitMask: "url('/brand/whatsapp-official.svg') center / contain no-repeat",
          mask: "url('/brand/whatsapp-official.svg') center / contain no-repeat"
        }}
      />
    </a>
  );
}
