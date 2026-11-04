"use client";

import { THEME_IDS, THEME_LABELS } from "@/lib/theme";
import { useTheme } from "./ThemeProvider";

/** Seletor temporário para comparar os temas. Só aparece com NEXT_PUBLIC_THEME_SWITCHER=1. */
export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  if (process.env.NEXT_PUBLIC_THEME_SWITCHER !== "1") return null;

  return (
    <div
      role="group"
      aria-label="Escolher tema visual"
      className="fixed bottom-5 left-5 z-40 flex flex-col gap-1 rounded-xl border border-rosebrand-200 bg-surface/95 p-2 text-xs font-bold shadow-card backdrop-blur"
    >
      <span className="px-2 pt-1 text-[10px] uppercase tracking-wide text-muted">Tema</span>
      {THEME_IDS.map((id) => (
        <button
          key={id}
          type="button"
          aria-pressed={theme === id}
          onClick={() => setTheme(id)}
          className={
            theme === id
              ? "rounded-lg bg-brand-gradient px-3 py-1.5 text-left text-on-accent"
              : "rounded-lg px-3 py-1.5 text-left text-ink hover:bg-rosebrand-100"
          }
        >
          {THEME_LABELS[id]}
        </button>
      ))}
    </div>
  );
}
