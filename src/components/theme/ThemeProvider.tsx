"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { DEFAULT_THEME, THEME_STORAGE_KEY, isThemeId, type ThemeId } from "@/lib/theme";

type ThemeContextValue = {
  theme: ThemeId;
  setTheme: (id: ThemeId) => void;
};

const ThemeContext = createContext<ThemeContextValue>({ theme: DEFAULT_THEME, setTheme: () => undefined });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // O script do <head> já aplicou data-theme antes da pintura; o estado só o espelha após a hidratação.
  const [theme, setThemeState] = useState<ThemeId>(DEFAULT_THEME);

  useEffect(() => {
    const applied = document.documentElement.dataset.theme;
    if (isThemeId(applied)) setThemeState(applied);
  }, []);

  const setTheme = useCallback((id: ThemeId) => {
    document.documentElement.dataset.theme = id;
    setThemeState(id);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, id);
    } catch {
      // armazenamento bloqueado: o tema vale só nesta visita
    }
    const url = new URL(window.location.href);
    url.searchParams.set("tema", id);
    window.history.replaceState(window.history.state, "", url);
  }, []);

  const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
