import { readFile } from 'fs/promises';
import path from 'path';

import { Language } from '@/app/i18n/consts';

export interface Frontmatter {
  title: string;
  subtitle?: string;
  default: boolean;
}

export interface Entry {
  id: string;
  parents: string[];
  defaultLanguage: Language;
  articles: {
    [x: string]: Article;
  };
}

export interface Article {
  title: string;
  subtitle?: string;
  language: Language;
  default: boolean;
  createdAt: string | null; // ISO 8601
  updatedAt: string | null; // ISO 8601
  originalPath: string;
}

export const getEntries = (): Promise<Record<string, Entry>> =>
  readFile(path.join(process.cwd(), 'mdx', 'entries.json'), 'utf-8').then(
    (res) => JSON.parse(res.toString()),
  );
