import { readFile } from 'fs/promises';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { redirect } from 'next/navigation';
import rehypeMathjax from 'rehype-mathjax/svg';
import remarkMath from 'remark-math';

import customMDXComponents from '@/components/custom-mdx-components';
import { Entry } from '@/types/article';

export default async function WikiPage({
  params,
}: {
  params: { slug: string[] };
}) {
  const [language, entryId, ...rest] = params.slug;

  const entries: Record<string, Entry> = await readFile(
    `mdx/entries.json`,
    'utf-8',
  ).then((res) => JSON.parse(res.toString()));

  const entry = entries[entryId];

  if (!entries[entryId]) {
    return <div>Entry not found</div>;
  }

  const { defaultLanguage } = entry;

  const article = entry.articles[language];

  if (!article) {
    if (defaultLanguage !== language) {
      redirect(`/wiki/${[entry.defaultLanguage, entryId, ...rest].join('/')}`);
    } else {
      // Should be unreachable
      return <div>Article not found</div>;
    }
  }

  const otherLanguages = Object.keys(entry.articles).filter(
    (lang) => lang !== language,
  );

  const markdown = await readFile(
    `mdx/${entryId}.${language}.mdx`,
    'utf-8',
  ).then((res) => res.toString());

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
        <p>입력 : {article.createdAt}</p>
        <p>수정 : {article.updatedAt}</p>
        {otherLanguages.length > 0 && (
          <div className="flex justify-end gap-1">
            <span>다른 언어 : </span>
            <ul className="flex gap-1">
              {otherLanguages.map((lang) => (
                <li key={lang}>
                  <a href={`/${[lang, entryId, ...rest].join('/')}`}>{lang}</a>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="flex justify-end gap-1">
          <a
            href={`https://github.com/devonnuri/devonnuri-wiki/edit/main/${article.originalPath}`}
            target="_blank"
            className="underline"
          >
            수정
          </a>
          <a
            href={`https://github.com/devonnuri/devonnuri-wiki/commits/main/${article.originalPath}`}
            target="_blank"
            className="underline"
          >
            역사
          </a>
        </div>
      </div>
      <div className="content">
        <MDXRemote
          source={markdown}
          options={{
            parseFrontmatter: true,
            mdxOptions: {
              rehypePlugins: [[rehypeMathjax, { svg: { scale: 0.85 } }]],
              remarkPlugins: [remarkMath],
            },
          }}
          components={customMDXComponents}
        />
      </div>
    </>
  );
}
