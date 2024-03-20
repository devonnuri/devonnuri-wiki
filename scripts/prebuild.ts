import { exec } from 'child_process';
import { copyFile, mkdir, writeFile } from 'fs/promises';
import { glob } from 'glob';
import * as matter from 'gray-matter';
import * as path from 'path';
import { rimraf } from 'rimraf';

import { Article, Entry, Frontmatter, Language } from '@/types/article';

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

async function main() {
  await rimraf('./public/mdx/');

  await mkdir('./public/mdx/', { recursive: true });

  // Fetch all mdx files from /data/wiki
  const folders = await glob('./data/wiki/**/');
  let entries: Record<string, Entry> = {};

  for (const folder of folders) {
    const parents = folder.split('/').slice(2);

    const mdxFiles = await glob(`${folder}/*.mdx`);

    let folderEntries: Record<string, Entry> = {};

    for (const mdxFile of mdxFiles) {
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

      const language = mdxFile.split('.').at(-2) as Language;

      const frontmatter = matter.read(mdxFile).data as Frontmatter;

      const createdAt = await execAsync(
        `git log --diff-filter=A --format=%cI -- ${mdxFile}`,
      );

      const updatedAt = await execAsync(
        `git log --diff-filter=M --format=%cI -- ${mdxFile}`,
      );

      const article: Article = {
        title: frontmatter.title,
        language,
        default: frontmatter.default,
        createdAt: createdAt.trim() || null,
        updatedAt: updatedAt.trim() || createdAt.trim() || null,
      };

      const existingEntry = folderEntries[entryId];
      if (existingEntry) {
        existingEntry.articles[language] = article;
        if (article.default) {
          existingEntry.defaultLanguage = language;
        }
      } else {
        folderEntries[entryId] = {
          id: entryId,
          parents: isIndex ? parents.slice(0, -1) : parents,
          defaultLanguage: language,
          articles: {
            [language]: article,
          },
        };
      }

      if (entries[entryId]) {
        throw new Error(`Duplicate entry id: ${entryId}`);
      }

      // copy mdx file to public/mdx
      await copyFile(mdxFile, `./public/mdx/${entryId}.${language}.mdx`);
    }

    entries = { ...entries, ...folderEntries };
  }

  console.log(JSON.stringify(entries, null, 2));

  await writeFile(
    './public/mdx/entries.json',
    JSON.stringify(entries),
    'utf-8',
  );
}

main().catch(console.error);
