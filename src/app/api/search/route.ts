import Fuse from 'fuse.js';
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
  const articles = Object.values(searchIndex);

  const fuse = new Fuse(articles, {
    keys: ['title', 'content'],
    threshold: 0.3,
    includeScore: true,
  });

  const fuseResults = fuse.search(query).slice(0, 10);

  const results = fuseResults.map((result) => ({
    ...result.item,
    score: result.score,
    content: result.item.content.slice(0, 100),
  }));

  return Response.json(results);
}
