export const LANGUAGES = ['en', 'ko'] as const;
export type Language = (typeof LANGUAGES)[number];

export interface Frontmatter {
  title: string;
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
  language: Language;
  default: boolean;
  createdAt: string | null; // ISO 8601
  updatedAt: string | null; // ISO 8601
}
