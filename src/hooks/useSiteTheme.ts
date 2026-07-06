import { useEffect } from "react";

const THEME = {
  primary: "#f97316",
  primaryDark: "#1f2937",
  accent: "#fb923c",
  accentText: "#111827",
};

export function useSiteTheme() {
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--hoi-primary", THEME.primary);
    root.style.setProperty("--hoi-primary-dark", THEME.primaryDark);
    root.style.setProperty("--hoi-accent", THEME.accent);
    root.style.setProperty("--hoi-accent-text", THEME.accentText);
  }, []);
}
