import { type NextRequest } from 'next/server';

import { checkLanguage } from '@/app/i18n/consts';
import { getSearchIndex } from '@/app/lib/article';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('query');
  const lang = searchParams.get('lang');

  if (!query) {
    return new Response('Query is required', { status: 400 });
  }

  if (lang === null || !checkLanguage(lang)) {
    return new Response('Invalid language', { status: 400 });
  }

  const searchIndex = await getSearchIndex(lang);

  const results = Object.values(searchIndex)
    .filter(
      (entry) =>
        entry.title.toLowerCase().includes(query.toLowerCase()) ||
        entry.content.toLowerCase().includes(query.toLowerCase()),
    )
    .map((entry) => ({
      ...entry,
      content: entry.content.slice(0, 100),
    }));

  return Response.json(results);
}
