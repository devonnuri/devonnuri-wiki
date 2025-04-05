import { RunOptions, compile, run } from '@mdx-js/mdx';
import dayjs from 'dayjs';
import { readFile } from 'fs/promises';
import 'highlight.js/styles/github.css';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import path from 'path';
import { Fragment } from 'react';
import * as runtime from 'react/jsx-runtime';
import rehypeHighlight from 'rehype-highlight';
import rehypeMathjax from 'rehype-mathjax/svg';
import rehypeSlug from 'rehype-slug';
import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkSectionize from 'remark-sectionize';
import remarkSmartquote from 'remark-smartquote';
import remarkToc from 'remark-toc';

import { getTranslation } from '@/app/i18n';
import { FALLBACK_LANGUAGE, checkLanguage } from '@/app/i18n/consts';
import { getEntries } from '@/app/lib/article';
import customMDXComponents from '@/components/mdx/custom-mdx-components';

interface Props {
  params: Promise<{
    slug: string[];
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const {
    slug: [language, entryId],
  } = await params;

  const entries = await getEntries();
  const entry = entries[entryId];

  let title = 'devonnuri.wiki';
  if (language && checkLanguage(language)) {
    const { t } = await getTranslation(language);

    if (!entry) {
      title = t('entry_not_found') + ' - ' + title;
    } else {
      const article = entry.articles[language];

      if (article) {
        title = article.title + ' - ' + title;
      }
    }
  }

  return {
    title,
  };
}

export default async function WikiPage({ params }: Props) {
  const {
    slug: [language, entryId],
  } = await params;

  if (!language || !checkLanguage(language)) {
    redirect(`/${FALLBACK_LANGUAGE}/${entryId}`);
  }

  if (!entryId) {
    redirect(`/${language}/main_page`);
  }

  const { t } = await getTranslation(language);

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

  const code = String(
    await compile(markdown, {
      outputFormat: 'function-body',
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
        remarkSmartquote,
        remarkFrontmatter,
      ],
      remarkRehypeOptions: {
        footnoteLabel: t('footnotes'),
      },
    }),
  );

  const { default: MDXContent } = await run(code, {
    ...(runtime as unknown as RunOptions),
    baseUrl: import.meta.url,
  });

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
              <Fragment key={parent}>
                {index > 0 && ' > '}
                <a
                  href={`/${language}/${parent}`}
                  className="no-underline hover:underline"
                >
                  {entries[parent].articles[language].title}
                </a>
              </Fragment>
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
        <MDXContent components={customMDXComponents} />
      </div>
    </>
  );
}
