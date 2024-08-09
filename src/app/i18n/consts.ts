export const LANGUAGES = ['en', 'ko'] as const;
export type Language = (typeof LANGUAGES)[number];

export const checkLanguage = (lang: string): lang is Language =>
  LANGUAGES.includes(lang as Language);

export const FALLBACK_LANGUAGE: Language = 'en';
export const DEFAULT_NAMESPACE = 'common';

export const LANG_COOKIE_NAME = 'lang';
