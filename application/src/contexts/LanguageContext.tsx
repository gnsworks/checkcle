import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { translations, Language, TranslationModule, TranslationKey } from "@/translations";

type LanguageContextType = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: <M extends TranslationModule>(key: string, module?: M) => string;
};

// ❗ Create the context with `undefined` to enforce provider usage
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// ✅ Stable custom hook
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>("en");
  const fallbackLanguage: Language = "en";

  const t = useCallback(<M extends TranslationModule>(key: string, module?: M): string => {
    const langPack = translations[language];
    const fallbackPack = translations[fallbackLanguage];
    if (module) {
      const valCur = langPack?.[module]?.[key as TranslationKey<M>];
      if (typeof valCur === "string") return valCur;

      const valEn = fallbackPack?.[module]?.[key as TranslationKey<M>];
      if (typeof valEn === "string") return valEn;

      return key;
    }

    for (const mod in langPack) {
      const m = mod as TranslationModule;
      const val = langPack[m]?.[key as any];
      if (typeof val === "string") return val;
    }

    for (const mod in fallbackPack) {
      const m = mod as TranslationModule;
      const val = fallbackPack[m]?.[key as any];
      if (typeof val === "string") return val;
    }

    return key;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};