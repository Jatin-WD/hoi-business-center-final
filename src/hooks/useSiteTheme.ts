import { useEffect } from "react";

const THEME = {
  primary: "#f97316",
  primaryDark: "#111111",
  accent: "#f59e0b",
  accentText: "#111111",
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
