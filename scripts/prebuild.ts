import { Command, Option } from '@commander-js/extra-typings';
import { exec } from 'child_process';
import { copyFile, cp, mkdir, readFile, writeFile } from 'fs/promises';
import { glob } from 'glob';
import * as matter from 'gray-matter';
import * as path from 'path';
import { rimraf } from 'rimraf';

import { checkLanguage } from '@/app/i18n/consts';
import { Article, Entry, checkFrontmatter } from '@/app/lib/article';

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

async function updateArticle(entries: Record<string, Entry>, mdxFile: string) {
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

  const createdAt = await execAsync(
    `git log --diff-filter=A --format=%cI -- ${mdxFile}`,
  );

  const updatedAt = await execAsync(
    `git log --diff-filter=M --format=%cI -- ${mdxFile}`,
  );

  const article: Article = {
    title: frontmatter.title,
    subtitle: frontmatter.subtitle,
    language,
    default: frontmatter.default || false,
    createdAt: createdAt.trim() || null,
    updatedAt: updatedAt.trim()?.split('\n')?.[0] || createdAt.trim() || null,
    originalPath: mdxFile,
  };

  let newEntry = entries[entryId];
  if (newEntry) {
    newEntry.articles[language] = article;
    if (article.default) {
      newEntry.defaultLanguage = language;
    }
  } else {
    newEntry = {
      id: entryId,
      parents: isIndex ? parents.slice(0, -1) : parents,
      defaultLanguage: language,
      articles: {
        [language]: article,
      },
    };
  }

  await copyFile(mdxFile, `${process.cwd()}/mdx/${entryId}.${language}.mdx`);

  console.log('[*] Updated article:', mdxFile);

  return newEntry;
}

async function fullUpdate() {
  await rimraf('./mdx/');

  await mkdir('./mdx/', { recursive: true });

  // Fetch all mdx files from /data/wiki
  const folders = await glob('./data/wiki/**/');
  let entries: Record<string, Entry> = {};

  let prevEntryIds: Set<string> = new Set();

  for (const folder of folders) {
    const mdxFiles = await glob(`${folder}/*.mdx`);

    for (const mdxFile of mdxFiles) {
      const newEntry = await updateArticle(entries, mdxFile);

      if (prevEntryIds.has(newEntry.id)) {
        throw new Error(`Duplicated entry id: ${newEntry.id}`);
      }

      entries = { ...entries, [newEntry.id]: newEntry };
    }

    prevEntryIds = new Set(Object.keys(entries));
  }

  await writeFile(
    `${process.cwd()}/mdx/entries.json`,
    JSON.stringify(entries),
    'utf-8',
  );

  await rimraf('./public/assets/');

  // Copy assets
  await cp('./data/assets/', './public/assets/', { recursive: true });

  console.log(`[*] Updated all ${Object.keys(entries).length} entries`);
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
    const entries = await readFile(
      path.join(process.cwd(), 'mdx', 'entries.json'),
      'utf-8',
    ).then((res) => JSON.parse(res.toString()));
    await updateArticle(entries, options.file);
  } else {
    await fullUpdate();
  }
})();
