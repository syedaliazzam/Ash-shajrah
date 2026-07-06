"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { translations } from "@/data/translations";

export type Language = "en" | "ur";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations.en;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    const savedLang = localStorage.getItem("ashshajrah_language") as Language | null;
    if (savedLang && (savedLang === "en" || savedLang === "ur")) {
      setLanguageState(savedLang);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("ashshajrah_language", lang);
  };

  const contextValue: LanguageContextType = {
    language,
    setLanguage,
    t: translations[language],
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {/* We apply dir and lang directly to a wrapper div here to ensure the whole app reacts to the change without full reload */}
      <div dir={language === "ur" ? "rtl" : "ltr"} lang={language === "ur" ? "ur" : "en"} className="min-h-screen">
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
