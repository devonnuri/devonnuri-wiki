import acceptLanguage from 'accept-language';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { FALLBACK_LANGUAGE, LANGUAGES, LANG_COOKIE_NAME } from './i18n/consts';

// @ts-expect-error - no types available
acceptLanguage.languages(LANGUAGES as string[]);

export default async function Home() {
  const headersList = headers();
  const cookieStore = cookies();

  const lang = cookieStore.get(LANG_COOKIE_NAME)?.value
    ? acceptLanguage.get(cookieStore.get(LANG_COOKIE_NAME)?.value)
    : acceptLanguage.get(headersList.get('accept-language')) ||
      FALLBACK_LANGUAGE;

  redirect(`/${lang}/main_page`);
}
