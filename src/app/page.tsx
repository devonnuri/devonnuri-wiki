import acceptLanguage from 'accept-language';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { FALLBACK_LANGUAGE, LANGUAGES, checkLanguage } from './i18n/consts';

// @ts-expect-error - no types available
acceptLanguage.languages(LANGUAGES as string[]);

export default async function Home() {
  const headersList = headers();

  const headerLang = headersList.get('x-page-language');
  const lang =
    headerLang && checkLanguage(headerLang) ? headerLang : FALLBACK_LANGUAGE;

  redirect(`/${lang}/main_page`);
}
