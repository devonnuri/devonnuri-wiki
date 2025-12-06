import { getLanguage, getTranslation } from '@/app/i18n';
import { getSubpages } from '@/app/lib/article';

interface SubpagesProps {
  entryId: string;
}

export default async function Subpages({ entryId }: SubpagesProps) {
  const lang = await getLanguage();
  const { t } = await getTranslation(lang);

  const subpages = await getSubpages(entryId, lang);

  subpages.sort((a, b) => {
    const entryIdA = a.entryId.toLowerCase();
    const entryIdB = b.entryId.toLowerCase();

    if (entryIdA < entryIdB) return -1;
    if (entryIdA > entryIdB) return 1;
    return 0;
  });

  return (
    <div>
      <h1>{t('subpages')}</h1>
      <ul>
        {subpages.map((subpage) => (
          <li key={subpage.entryId}>
            <a href={`/${lang}/${subpage.entryId}`} className="internal">
              {subpage.title}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
