import { useEffect } from "react";
import { apiClient } from "@/lib/api-client";

const THEME = {
  primary: "#f97316",
  primaryDark: "#111111",
  accent: "#f59e0b",
  accentText: "#111111",
};

export function useSiteTheme() {
  useEffect(() => {
    let mounted = true;
    const root = document.documentElement;
    const applyTheme = (theme: Partial<typeof THEME>) => {
      root.style.setProperty("--hoi-primary", theme.primary || THEME.primary);
      root.style.setProperty("--hoi-primary-dark", theme.primaryDark || THEME.primaryDark);
      root.style.setProperty("--hoi-accent", theme.accent || THEME.accent);
      root.style.setProperty("--hoi-accent-text", theme.accentText || THEME.accentText);
    };

    applyTheme(THEME);
    apiClient
      .getCmsContent()
      .then((response) => {
        if (!mounted) return;
        applyTheme({
          primary: response.data.map["theme.primary"],
          primaryDark: response.data.map["theme.primaryDark"],
          accent: response.data.map["theme.accent"],
          accentText: response.data.map["theme.accentText"],
        });
      })
      .catch(() => {
        if (!mounted) return;
        applyTheme(THEME);
      });

    return () => {
      mounted = false;
    };
  }, []);
}
