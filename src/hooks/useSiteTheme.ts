import { useEffect } from "react";

const THEME = {
  primary: "#1a3a8f",
  primaryDark: "#0f2460",
  accent: "#facc15",
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
