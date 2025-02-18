import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import relativeTime from 'dayjs/plugin/relativeTime';
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import Image from 'next/image';
import Link from 'next/link';

import './globals.css';
import { getLanguage, useTranslation } from './i18n';

dayjs.extend(relativeTime);

export const metadata: Metadata = {
  title: 'devonnuri.wiki',
  description: 'Generated by create next app',
};

const texGyreTermes = localFont({
  src: [
    {
      path: './fonts/texgyretermes-regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: './fonts/texgyretermes-bold.woff2',
      weight: '700',
      style: 'normal',
    },
    {
      path: './fonts/texgyretermes-italic.woff2',
      weight: '400',
      style: 'italic',
    },
    {
      path: './fonts/texgyretermes-bolditalic.woff2',
      weight: '700',
      style: 'italic',
    },
  ],
  variable: '--font-texgyretermes',
  display: 'swap',
});

const koPubBatang = localFont({
  src: [
    {
      path: './fonts/KoPubBatang-Light.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: './fonts/KoPubBatang-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
    {
      path: './fonts/KoPubDotum-Light.woff2',
      weight: '400',
      style: 'italic',
    },
    {
      path: './fonts/KoPubDotum-Bold.woff2',
      weight: '700',
      style: 'italic',
    },
  ],
  variable: '--font-kopubbatang',
  display: 'swap',
});

const jetBrainsMono = localFont({
  src: [
    {
      path: './fonts/JetbrainsMono-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
  ],
  variable: '--font-jetbrainsmono',
  display: 'swap',
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const lang = getLanguage();
  const { t } = await useTranslation(lang);

  dayjs.locale(lang);

  return (
    <html>
      <body
        className={`md:px-3 ${texGyreTermes.variable} ${koPubBatang.variable}`}
      >
        <div className="w-full max-w-[48rem] mx-auto my-0 px-4 md:px-8 pb-8 border border-black min-h-screen">
          <div className="flex items-center justify-center my-10">
            <Link href="./main_page">
              <Image
                src="/devonnuri-wiki.svg"
                alt="devonnuri.wiki"
                width="284"
                height="75"
              />
            </Link>
          </div>
          <div>
            <input
              className="w-full text-[1.375em] italic border rounded-sm mx-0 my-2 px-2 py-[0.2rem] border-black"
              type="text"
              placeholder={t('search')}
            />
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
