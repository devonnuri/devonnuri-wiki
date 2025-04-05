'use client';

import { useEffect, useState } from 'react';

import { Language } from '@/app/i18n/consts';
import { SearchEntry } from '@/app/lib/article';

interface SearchInputProps {
  language: Language;
  placeholder: string;
}

type SearchResult = SearchEntry & {
  score: number;
};

const SearchInput = ({ language, placeholder }: SearchInputProps) => {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  useEffect(() => {
    if (!query) {
      setSearchResults([]);
      return;
    }
    fetch(`/api/search?lang=${language}&query=${query}`)
      .then((res) => res.json())
      .then((data) => setSearchResults(data));
  }, [language, query]);

  return (
    <div className="relative w-full">
      <input
        className="w-full text-[1.375em] italic border rounded-sm mx-0 my-2 px-2 py-[0.2rem] border-black"
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {query && (
        <div className="absolute w-full bg-white border border-black rounded-sm mt-0.5 z-10">
          {searchResults.map((result) => (
            <a key={result.id} href={`/${language}/${result.id}`}>
              <div className="p-2 border-b last:border-b-0">
                <div className="flex flex-col">
                  <p className="font-bold">{result.title}</p>
                </div>
                <div>
                  <p>{result.content}</p>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchInput;
