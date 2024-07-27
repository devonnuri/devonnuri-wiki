import dayjs from 'dayjs';

import { useTranslation } from '@/app/i18n';
import { Language } from '@/app/i18n/consts';
import { getEntries } from '@/app/lib/article';

export default async function RecentChanges() {
  const entries = await getEntries();

  const language = 'ko'; // FIXME: Hardcoded

  const { t } = await useTranslation(language as Language);

  return (
    <div>
      <h1>{t('recent_changes')}</h1>
      <div className="flex flex-col">
        {Object.values(entries)
          .filter((entry) => entry.articles[language])
          .toSorted((a, b) =>
            dayjs(b.articles[language].updatedAt).diff(
              dayjs(a.articles[language].updatedAt),
            ),
          )
          .slice(0, 20) // FIXME: memoize
          .map((entry) => (
            <div key={entry.id} className="flex">
              <div>
                <a
                  href={`/${language}/${entry.id}`}
                  className="no-underline hover:underline"
                >
                  {entry.articles[language].title}
                </a>
              </div>
              <div className="ml-auto">
                {dayjs(entry.articles[language].updatedAt).fromNow()}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
