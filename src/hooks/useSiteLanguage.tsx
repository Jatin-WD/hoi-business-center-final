import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { SUPPORTED_LANGUAGES, type SiteLanguage } from "@/lib/site-translations";

const STORAGE_KEY = "hoi-site-language";

type SiteLanguageContextValue = {
  language: SiteLanguage;
  setLanguage: (language: SiteLanguage) => void;
  languages: typeof SUPPORTED_LANGUAGES;
};

const SiteLanguageContext = createContext<SiteLanguageContextValue | null>(null);

function getStoredLanguage(): SiteLanguage {
  if (typeof window === "undefined") return "en";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "hi" || stored === "ko" || stored === "en") return stored;
  return "en";
}

export function SiteLanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<SiteLanguage>(getStoredLanguage);

  useEffect(() => {
    document.documentElement.lang = language;
    window.localStorage.setItem(STORAGE_KEY, language);
  }, [language]);

  const value = useMemo<SiteLanguageContextValue>(
    () => ({
      language,
      setLanguage: setLanguageState,
      languages: SUPPORTED_LANGUAGES,
    }),
    [language],
  );

  return <SiteLanguageContext.Provider value={value}>{children}</SiteLanguageContext.Provider>;
}

export function useSiteLanguage() {
  const context = useContext(SiteLanguageContext);
  if (!context) {
    throw new Error("useSiteLanguage must be used within a SiteLanguageProvider");
  }
  return context;
}
