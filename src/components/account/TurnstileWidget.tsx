"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, options: Record<string, unknown>) => string;
      remove: (id: string) => void;
    };
  }
}

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

/** Caixa de verificação anti-robô. Troque `resetKey` para pedir uma nova verificação (ex.: após enviar). */
export function TurnstileWidget({ onToken, resetKey = 0 }: { onToken: (token: string) => void; resetKey?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [stalled, setStalled] = useState(false);

  useEffect(() => {
    if (!siteKey || !ref.current) return;
    const container = ref.current;
    let widgetId: string | undefined;
    let cancelled = false;
    setStalled(false);
    // Se em 20 s nenhum token chegou, avisa em vez de deixar o botão travado sem explicação.
    const timer = window.setTimeout(() => setStalled(true), 20000);

    function mount() {
      if (cancelled || !window.turnstile) return;
      widgetId = window.turnstile.render(container, {
        sitekey: siteKey,
        callback: (token: string) => {
          window.clearTimeout(timer);
          setStalled(false);
          onToken(token);
        },
        "expired-callback": () => onToken(""),
        "error-callback": () => {
          setStalled(true);
          onToken("");
        }
      });
    }

    if (window.turnstile) {
      mount();
    } else {
      let script = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`);
      if (!script) {
        script = document.createElement("script");
        script.src = SCRIPT_SRC;
        script.async = true;
        document.head.appendChild(script);
      }
      script.addEventListener("load", mount);
    }

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      if (widgetId && window.turnstile) window.turnstile.remove(widgetId);
    };
  }, [onToken, resetKey]);

  if (!siteKey) return null;
  return (
    <div>
      <div ref={ref} className="min-h-[65px]" />
      {stalled && (
        <p role="alert" className="mt-2 text-xs font-bold text-rosebrand-800">
          A verificação de segurança não carregou. Recarregue a página, desative bloqueadores de anúncio para este site ou tente outro navegador.
        </p>
      )}
    </div>
  );
}
