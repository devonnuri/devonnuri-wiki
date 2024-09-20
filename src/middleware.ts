import { NextRequest, NextResponse } from 'next/server';

import { LANGUAGES } from '@/app/i18n/consts';

export const config = {
  // matcher: '/:lng*'
  matcher: ['/((?!api|_next/static|_next/image|assets|favicon.ico|sw.js).*)'],
};

export function middleware(req: NextRequest) {
  const lang = LANGUAGES.find((l) => req.nextUrl.pathname.startsWith(`/${l}`));
  if (!lang) {
    return NextResponse.next();
  }

  const response = NextResponse.next();
  if (lang) response.headers.set('x-page-language', lang);
  return response;
}
