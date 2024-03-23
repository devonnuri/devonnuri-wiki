import { createInstance } from 'i18next';
import resourcesToBackend from 'i18next-resources-to-backend';
import { initReactI18next } from 'react-i18next/initReactI18next';

import { DEFAULT_NAMESPACE, FALLBACK_LANGUAGE, Language } from './consts';

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

export async function useTranslation(
  lang: Language,
  namespaces: string[] = [DEFAULT_NAMESPACE],
) {
  const i18nextInstance = await initI18next(lang, namespaces);
  return {
    t: i18nextInstance.getFixedT(lang, namespaces[0]),
    i18n: i18nextInstance,
  };
}
