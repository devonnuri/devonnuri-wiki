import dayjs from 'dayjs';

import { getLanguage, useTranslation } from '@/app/i18n';
import { Language } from '@/app/i18n/consts';
import { getEntries } from '@/app/lib/article';

export default async function RecentChanges() {
  const entries = await getEntries();

  const lang = getLanguage();

  const { t } = await useTranslation(lang);

  return (
    <div>
      <h1>{t('recent_changes')}</h1>
      <div className="flex flex-col">
        {Object.values(entries)
          .filter((entry) => entry.articles[lang])
          .toSorted((a, b) =>
            dayjs(b.articles[lang].updatedAt).diff(
              dayjs(a.articles[lang].updatedAt),
            ),
          )
          .slice(0, 20) // FIXME: memoize
          .map((entry) => (
            <div key={entry.id} className="flex">
              <div>
                <a
                  href={`/${lang}/${entry.id}`}
                  className="no-underline hover:underline"
                >
                  {entry.articles[lang].title}
                </a>
              </div>
              <div className="ml-auto">
                {dayjs(entry.articles[lang].updatedAt).fromNow()}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
