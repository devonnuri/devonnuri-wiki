import dayjs from 'dayjs';

import { getLanguage, getTranslation } from '@/app/i18n';
import { getRecentChanges } from '@/app/lib/article';

export default async function RecentChanges() {
  const recents = await getRecentChanges();

  const lang = await getLanguage();
  const { t } = await getTranslation(lang);

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
            <div className="ml-auto">
              {article.updatedAt === null
                ? '저장 전'
                : dayjs(article.updatedAt).fromNow()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
