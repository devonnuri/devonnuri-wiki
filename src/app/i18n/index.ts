import { createInstance } from 'i18next';
import resourcesToBackend from 'i18next-resources-to-backend';
import { headers } from 'next/headers';
import { initReactI18next } from 'react-i18next/initReactI18next';

import {
  DEFAULT_NAMESPACE,
  FALLBACK_LANGUAGE,
  Language,
  checkLanguage,
} from './consts';

const initI18next = async (lang: Language, namespaces: string[]) => {
  const i18nInstance = createInstance();
  await i18nInstance
    .use(initReactI18next)
    .use(
      resourcesToBackend(
        (lang: string, namespace: string) =>
          import(`./locales/${lang}/${namespace}.json`),
      ),
    )
    .init({
      lng: lang,
      fallbackLng: FALLBACK_LANGUAGE,
      ns: namespaces,
      defaultNS: DEFAULT_NAMESPACE,
      interpolation: {
        escapeValue: false,
      },
    });
  return i18nInstance;
};

export async function getLanguage(): Promise<Language> {
  const headerList = await headers();
  const lang = headerList.get('x-page-language');

  if (lang && checkLanguage(lang)) {
    return lang;
  }

  return FALLBACK_LANGUAGE;
}

export async function useTranslation(
  lang?: Language,
  namespaces: string[] = [DEFAULT_NAMESPACE],
) {
  if (!lang) {
    lang = await getLanguage();
  }

  const i18nextInstance = await initI18next(lang, namespaces);
  return {
    t: i18nextInstance.getFixedT(lang, namespaces[0]),
    i18n: i18nextInstance,
  };
}
