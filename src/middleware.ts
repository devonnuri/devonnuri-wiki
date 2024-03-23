import { NextRequest, NextResponse } from 'next/server';

import { LANGUAGES, LANG_COOKIE_NAME } from '@/app/i18n/consts';

export const config = {
  // matcher: '/:lng*'
  matcher: ['/((?!api|_next/static|_next/image|assets|favicon.ico|sw.js).*)'],
};

export function middleware(req: NextRequest) {
  const lang = LANGUAGES.find((loc) =>
    req.nextUrl.pathname.startsWith(`/${loc}`),
  );
  if (!lang) {
    return NextResponse.next();
  }

  const referer = req.headers.get('referer');
  if (!referer) {
    return NextResponse.next();
  }

  const response = NextResponse.next();
  if (lang) response.cookies.set(LANG_COOKIE_NAME, lang);
  return response;
}
