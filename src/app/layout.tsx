import type {Metadata} from 'next';
import './globals.css';
import {Providers} from '@/app/providers';
import AppShell from '@/components/AppShell';
import {Comic_Neue} from 'next/font/google';
import {getSession} from 'next-auth/react';

const customFont = Comic_Neue({ weight: ['400'], subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Hugin'
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();
  return (
    <html lang="en" className={customFont.className}>
      <body>
        <Providers session={session}>
          <main>
            <AppShell>
              {children}
            </AppShell>
          </main>
        </Providers>
      </body>
    </html>
  );
}
