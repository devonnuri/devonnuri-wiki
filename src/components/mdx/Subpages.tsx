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
    const titleA = a.title.toLowerCase();
    const titleB = b.title.toLowerCase();

    if (titleA < titleB) return -1;
    if (titleA > titleB) return 1;
    return 0;
  });

  return (
    <div>
      <h1>{t('subpages')}</h1>
      <ul>
        {subpages.map((subpage) => (
          <li key={subpage.entryId}>
            <a href={`/${lang}/${subpage.entryId}`}>{subpage.title}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
