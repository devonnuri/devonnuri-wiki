import { NextRequest, NextResponse } from 'next/server';

import { LANGUAGES, checkLanguage } from '@/app/i18n/consts';

export const config = {
  // matcher: '/:lng*'
  matcher: ['/((?!api|_next/static|_next/image|assets|favicon.ico|sw.js).*)'],
};

export function middleware(req: NextRequest) {
  const lang = LANGUAGES.find((l) => req.nextUrl.pathname.startsWith(`/${l}`));
  if (!lang) {
    const acceptLanguage = req.headers.get('accept-language');
    const response = NextResponse.next();
    if (acceptLanguage) {
      const lang = acceptLanguage.split(',')[0].split('-')[0];
      if (checkLanguage(lang)) {
        response.headers.set('x-page-language', lang);
      }
    }
    return response;
  }

  const response = NextResponse.next();
  if (lang) response.headers.set('x-page-language', lang);
  return response;
}
