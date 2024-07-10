import dayjs from 'dayjs';
import { useEffect, useState } from 'react';

import { Entry, getEntries } from '@/app/lib/article';

export default async function RecentChange() {
  const entries = await getEntries();

  const language = 'ko'; // FIXME: Hardcoded

  return (
    <div>
      <h2>Recent changes</h2>
      <div className="flex flex-col">
        {Object.values(entries)
          .filter((entry) => entry.articles[language])
          .toSorted((a, b) =>
            dayjs(b.articles[language].updatedAt).diff(
              dayjs(a.articles[language].updatedAt),
            ),
          )
          .map((entry) => (
            <div key={entry.id} className="flex">
              <div>
                <a
                  href={`/${language}/${entry.id}`}
                  className="no-underline hover:underline"
                >
                  {entry.articles[language].title}
                </a>
              </div>
              <div className="ml-auto">
                {dayjs(entry.articles[language].updatedAt).fromNow()}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
