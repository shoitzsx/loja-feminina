"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(localStorage.getItem("barbs_cookie_consent") !== "accepted");
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-5 left-5 z-30 max-w-sm animate-soft-pop rounded-lg border border-rosebrand-200 bg-rosebrand-50/95 p-4 shadow-soft">
      <p className="text-sm leading-6 text-neutral-700">
        Usamos cookies necessários e métricas para melhorar sua experiência, respeitando a LGPD.
      </p>
      <div className="mt-3 flex gap-2">
        <Button
          type="button"
          onClick={() => {
            localStorage.setItem("barbs_cookie_consent", "accepted");
            setVisible(false);
          }}
        >
          Aceitar
        </Button>
        <Button href="/politica-de-privacidade" variant="secondary">
          Detalhes
        </Button>
      </div>
    </div>
  );
}
