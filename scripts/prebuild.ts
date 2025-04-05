import { Command, Option } from '@commander-js/extra-typings';
import { exec } from 'child_process';
import dayjs from 'dayjs';
import { copyFile, cp, mkdir, readFile, writeFile } from 'fs/promises';
import { glob } from 'glob';
import matter from 'gray-matter';
import * as path from 'path';
import { rimraf } from 'rimraf';

import { LANGUAGES, Language, checkLanguage } from '@/app/i18n/consts';
import {
  Article,
  Entry,
  SearchEntry,
  checkFrontmatter,
} from '@/app/lib/article';

import { sanitizeMdx } from './sanitizeMdx';

const groupBy = <T, Y extends string | number | symbol>(
  arr: T[],
  callback: (v: T, i: number, a: T[]) => Y,
) => {
  return arr.reduce(
    (acc, ...args) => {
      const key = callback(...args);
      acc[key] ??= [];
      acc[key].push(args[0]);
      return acc;
    },
    {} as Record<Y, T[]>,
  );
};

const RECENT_ARTICLE_COUNT = 20;

const execAsync = (command: string) =>
  new Promise<string>((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(stderr);
      } else {
        resolve(stdout);
      }
    });
  });

const getParentsAndEntryId = (mdxFile: string) => {
  const parents = mdxFile.split('/').slice(2, -1);

  let entryId = path
    .basename(mdxFile, '.mdx')
    .split('.')
    .slice(0, -1)
    .join('.');

  const nearestParent = parents.at(-1);
  const isIndex = entryId === 'index' && nearestParent !== undefined;
  if (isIndex) {
    entryId = nearestParent;
  }

  return {
    parents: isIndex ? parents.slice(0, -1) : parents,
    entryId,
  };
};

async function parseArticle(mdxFile: string): Promise<Article> {
  const { entryId } = getParentsAndEntryId(mdxFile);

  const language = mdxFile.split('.').at(-2);

  if (!language || !checkLanguage(language)) {
    throw new Error(`Invalid language: ${language} on ${mdxFile}`);
  }

  const frontmatter = matter.read(mdxFile).data;

  if (!checkFrontmatter(frontmatter)) {
    throw new Error(
      `Invalid frontmatter: ${JSON.stringify(frontmatter)} on ${mdxFile}`,
    );
  }

  const [createdAtRaw, updatedAtRaw] = await Promise.all([
    execAsync(`git log --format=%cI --diff-filter=A -- ${mdxFile}`),
    execAsync(`git log --format=%cI --diff-filter=M -- ${mdxFile}`),
  ]);

  const createdAt = createdAtRaw.trim()?.split('\n')?.[0] || null;
  const updatedAt = updatedAtRaw.trim()?.split('\n')?.[0] || createdAt;

  return {
    entryId,
    title: frontmatter.title,
    subtitle: frontmatter.subtitle,
    language,
    default: frontmatter.default || false,
    createdAt,
    updatedAt,
    originalPath: mdxFile,
  };
}

async function updateAll() {
  await rimraf('./mdx/');

  await mkdir('./mdx/', { recursive: true });

  const folders = await glob('./data/wiki/**/');
  const entries: Record<string, Entry> = {};
  const searchIndices: Record<
    Language,
    Record<string, SearchEntry>
  > = LANGUAGES.reduce(
    (acc, lang) => ({ ...acc, [lang]: {} }),
    {} as Record<Language, Record<string, SearchEntry>>,
  );

  const recentArticles: Record<Language, Article[]> = LANGUAGES.reduce(
    (acc, lang) => ({ ...acc, [lang]: [] }),
    {} as Record<Language, Article[]>,
  );

  for (const folder of folders) {
    const mdxFiles = await glob(`${folder}/*.mdx`);

    const articlePromises = mdxFiles.map(async (mdxFile) => {
      const article = await parseArticle(mdxFile);

      if (recentArticles[article.language].length < RECENT_ARTICLE_COUNT) {
        recentArticles[article.language].push(article);
      } else {
        const oldestArticle = recentArticles[article.language].at(-1);

        if (
          oldestArticle &&
          (article.updatedAt === null || dayjs(article.updatedAt).isAfter(dayjs(oldestArticle.updatedAt)))
        ) {
          recentArticles[article.language].pop();
          recentArticles[article.language].push(article);
        }
      }

      recentArticles[article.language].sort((a, b) =>
        a === null || dayjs(a.updatedAt).isBefore(dayjs(b.updatedAt)) ? 1 : -1,
      );

      const content = await readFile(mdxFile, 'utf-8');
      searchIndices[article.language][article.entryId] = {
        id: article.entryId,
        title: article.title,
        content: await sanitizeMdx(content),
      };

      return article;
    });

    const articles = await Promise.all(articlePromises);

    const entryPromises = Object.entries(
      groupBy(articles, (article) => article.entryId),
    ).map(async (group) => {
      const [entryId, articles] = group;

      if (entries[entryId]) {
        throw new Error(`Duplicate entry id: ${entryId}`);
      }

      if (!articles) return;

      const { parents } = getParentsAndEntryId(articles[0].originalPath);

      const entry: Entry = {
        id: entryId,
        parents,
        defaultLanguage: articles.find((a) => a.default)?.language || 'en',
        articles: articles.reduce(
          (acc, article) => ({ ...acc, [article.language]: article }),
          {} as Record<Language, Article>,
        ),
      };

      entries[entryId] = entry;

      await Promise.all(
        articles.map(async (article) => {
          await copyFile(
            article.originalPath,
            `./mdx/${article.entryId}.${article.language}.mdx`,
          );
        }),
      );

      console.log(`[+] Updated ${entryId}`);
    });

    await Promise.all(entryPromises);
  }

  await writeFile(
    `${process.cwd()}/mdx/entries.json`,
    JSON.stringify(entries),
    'utf-8',
  );

  await writeFile(
    `${process.cwd()}/mdx/recents.json`,
    JSON.stringify(recentArticles),
    'utf-8',
  );

  for (const lang of LANGUAGES) {
    await writeFile(
      `${process.cwd()}/mdx/searchIndex.${lang}.json`,
      JSON.stringify(searchIndices[lang]),
      'utf-8',
    );
  }

  await rimraf('./public/assets/');

  // Copy assets
  await cp('./data/assets/', './public/assets/', { recursive: true });

  console.log(`[*] Updated all ${Object.keys(entries).length} entries`);
}

async function updateSingle(mdxFile: string) {
  const article = await parseArticle(mdxFile);

  const entries = await readFile(
    path.join(process.cwd(), 'mdx', 'entries.json'),
    'utf-8',
  ).then((res) => JSON.parse(res.toString()));

  const entry = entries[article.entryId];

  if (!entry) {
    entries[article.entryId] = {
      id: article.entryId,
      parents: [],
      defaultLanguage: article.language,
      articles: {
        [article.language]: article,
      },
    };
  } else {
    entry.articles[article.language] = article;
  }

  await writeFile(
    `${process.cwd()}/mdx/entries.json`,
    JSON.stringify(entries),
    'utf-8',
  );

  await copyFile(
    article.originalPath,
    `./mdx/${article.entryId}.${article.language}.mdx`,
  );

  const searchIndex = await readFile(
    path.join(process.cwd(), 'mdx', `searchIndex.${article.language}.json`),
    'utf-8',
  ).then((res) => JSON.parse(res.toString()));

  const content = await readFile(mdxFile, 'utf-8');
  searchIndex[article.entryId] = {
    id: article.entryId,
    title: article.title,
    content,
  };

  await writeFile(
    path.join(process.cwd(), 'mdx', `searchIndex.${article.language}.json`),
    JSON.stringify(searchIndex),
    'utf-8',
  );

  console.log(`[*] Updated ${article.entryId}`);
}

const program = new Command()
  .addOption(new Option('-f, --file <file>', 'File to update'))
  .addOption(
    new Option('-e, --event <event>', 'File event').choices([
      'add',
      'addDir',
      'change',
      'unlink',
      'unlinkDir',
    ] as const),
  )
  .parse();
const options = program.opts();

(async () => {
  if (
    options.file &&
    options.file.endsWith('.mdx') &&
    (options.event === 'add' || options.event === 'change')
  ) {
    updateSingle(options.file);
  } else {
    await updateAll();
  }
})();
