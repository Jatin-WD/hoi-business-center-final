import { useEffect } from "react";
import { apiClient } from "@/lib/api-client";

const DEFAULT_THEME = {
  primary: "#1a3a8f",
  primaryDark: "#0f2460",
  accent: "#facc15",
  accentText: "#111827",
};

export function useSiteTheme() {
  useEffect(() => {
    let mounted = true;
    apiClient
      .getCmsContent()
      .then((response) => {
        if (!mounted) return;
        const map = response.data.map || {};
        const root = document.documentElement;
        root.style.setProperty("--hoi-primary", map["theme.primary"] || DEFAULT_THEME.primary);
        root.style.setProperty("--hoi-primary-dark", map["theme.primaryDark"] || DEFAULT_THEME.primaryDark);
        root.style.setProperty("--hoi-accent", map["theme.accent"] || DEFAULT_THEME.accent);
        root.style.setProperty("--hoi-accent-text", map["theme.accentText"] || DEFAULT_THEME.accentText);
      })
      .catch(() => {
        const root = document.documentElement;
        root.style.setProperty("--hoi-primary", DEFAULT_THEME.primary);
        root.style.setProperty("--hoi-primary-dark", DEFAULT_THEME.primaryDark);
        root.style.setProperty("--hoi-accent", DEFAULT_THEME.accent);
        root.style.setProperty("--hoi-accent-text", DEFAULT_THEME.accentText);
      });

    return () => {
      mounted = false;
    };
  }, []);
}
