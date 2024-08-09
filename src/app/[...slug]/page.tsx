import dayjs from 'dayjs';
import { readFile } from 'fs/promises';
import 'highlight.js/styles/github.css';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { redirect } from 'next/navigation';
import path from 'path';
import { createContext } from 'react';
import rehypeHighlight from 'rehype-highlight';
import rehypeMathjax from 'rehype-mathjax/svg';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkSectionize from 'remark-sectionize';
import remarkToc from 'remark-toc';

import { useTranslation } from '@/app/i18n';
import { FALLBACK_LANGUAGE, Language, checkLanguage } from '@/app/i18n/consts';
import { getEntries } from '@/app/lib/article';
import customMDXComponents from '@/components/custom-mdx-components';

export const LanguageContext = createContext<Language>(FALLBACK_LANGUAGE);

export default async function WikiPage({
  params,
}: {
  params: { slug: string[] };
}) {
  const [language, entryId] = params.slug;

  if (!language || !checkLanguage(language)) {
    redirect(`/${FALLBACK_LANGUAGE}/${entryId}`);
  }

  if (!entryId) {
    redirect(`/${language}/main_page`);
  }

  const { t } = await useTranslation(language);

  const entries = await getEntries();
  const entry = entries[entryId];

  if (!entries[entryId]) {
    return <div>{t('entry_not_found')}</div>;
  }

  const { defaultLanguage } = entry;

  const article = entry.articles[language];

  if (!article) {
    if (defaultLanguage !== language) {
      redirect(`/${defaultLanguage}/${entryId}`);
    } else {
      // Should be unreachable
      return <div>Article not found</div>;
    }
  }

  const otherLanguages = Object.keys(entry.articles).filter(
    (lang) => lang !== language,
  );

  const markdown = await readFile(
    path.join(process.cwd(), 'mdx', `${entryId}.${language}.mdx`),
    'utf-8',
  ).then((res) => res.toString());

  const createdAt = dayjs(article.createdAt);
  const updatedAt = dayjs(article.updatedAt);

  return (
    <>
      <div>
        <h1 className="text-3xl font-bold mt-4">{article.title}</h1>
        {article.subtitle && (
          <h2 className="text-2xl text-gray-500 font-normal mb-4">
            {article.subtitle}
          </h2>
        )}
      </div>
      <div className="text-gray-500 text-right">
        {createdAt.isValid() && (
          <p>
            {t('created_at')} {createdAt.format('YYYY-MM-DD HH:mm:ss')}
          </p>
        )}
        {updatedAt.isValid() && (
          <p>
            {t('updated_at')} {updatedAt.format('YYYY-MM-DD HH:mm:ss')}
          </p>
        )}
        {otherLanguages.length > 0 && (
          <div className="flex justify-end gap-1">
            <span>{t('other_languages')} : </span>
            <ul className="flex gap-1">
              {otherLanguages.map((lang) => (
                <li key={lang}>
                  <a
                    href={`/${lang}/${entryId}`}
                    className="no-underline hover:underline"
                  >
                    {lang}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
        {entry.parents.length > 0 && (
          <div className="flex justify-end gap-1">
            <span>{t('parent')} : </span>
            {entry.parents.map((parent, index) => (
              <>
                {index > 0 && ' > '}
                <a
                  href={`/${language}/${parent}`}
                  className="no-underline hover:underline"
                  key={parent}
                >
                  {entries[parent].articles[language].title}
                </a>
              </>
            ))}
          </div>
        )}
        <div className="flex justify-end gap-1">
          <a
            href={`https://github.com/devonnuri/devonnuri-wiki/edit/main/${article.originalPath}`}
            target="_blank"
            className="no-underline hover:underline"
          >
            {t('edit')}
          </a>
          <a
            href={`https://github.com/devonnuri/devonnuri-wiki/commits/main/${article.originalPath}`}
            target="_blank"
            className="no-underline hover:underline"
          >
            {t('history')}
          </a>
        </div>
      </div>
      <div className="content">
        <MDXRemote
          source={markdown}
          options={{
            parseFrontmatter: true,
            mdxOptions: {
              rehypePlugins: [
                rehypeSlug,
                [
                  rehypeMathjax,
                  {
                    svg: { scale: 1 },
                  },
                ],
                rehypeHighlight,
              ],
              remarkPlugins: [
                [remarkToc, { ordered: true }],
                remarkSectionize,
                remarkGfm,
                remarkMath,
              ],
              remarkRehypeOptions: {
                footnoteLabel: t('footnotes'),
              },
            },
          }}
          components={customMDXComponents}
        />
      </div>
    </>
  );
}
