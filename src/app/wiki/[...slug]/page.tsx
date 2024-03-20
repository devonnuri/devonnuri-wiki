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

  if (!entries[entryId]) {
    return <div>Entry not found</div>;
  }

  const { defaultLanguage } = entries[entryId];

  if (!entries[entryId].articles[language]) {
    if (defaultLanguage !== language) {
      redirect(
        `/wiki/${[entries[entryId].defaultLanguage, entryId, ...rest].join('/')}`,
      );
    } else {
      // Should be unreachable
      return <div>Article not found</div>;
    }
  }

  const markdown = await readFile(
    `mdx/${entryId}.${language}.mdx`,
    'utf-8',
  ).then((res) => res.toString());

  return (
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
  );
}
