import enTranslations from './en';
import kmTranslations from './km';
import deTranslations from './de';
import jaTranslations from './ja';

export type Language = "en" | "km" | "de" | "ja";

export const translations = {
  en: enTranslations,
  km: kmTranslations,
  de: deTranslations,
  ja: jaTranslations,
};

// Type for accessing translations by module and key
export type TranslationModule = keyof typeof enTranslations;
export type TranslationKey<M extends TranslationModule> = keyof typeof enTranslations[M];
