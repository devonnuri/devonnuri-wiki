import dayjs from 'dayjs';

import { getLanguage, useTranslation } from '@/app/i18n';
import { Language } from '@/app/i18n/consts';
import { getEntries, getRecentChanges } from '@/app/lib/article';

export default async function RecentChanges() {
  const [entries, recents] = await Promise.all([
    getEntries(),
    getRecentChanges(),
  ]);

  const lang = await getLanguage();

  const { t } = await useTranslation(lang);

  return (
    <div>
      <h1>{t('recent_changes')}</h1>
      <div className="flex flex-col">
        {recents[lang].map((article) => (
          <div key={article.entryId} className="flex">
            <div>
              <a
                href={`/${lang}/${article.entryId}`}
                className="no-underline hover:underline"
              >
                {article.title}
              </a>
            </div>
            <div className="ml-auto">{dayjs(article.updatedAt).fromNow()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
