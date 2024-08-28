import type {Metadata} from 'next';
import './globals.css';
import {Providers} from '@/app/providers';
import AppShell from '@/components/AppShell';
import {Comic_Neue} from 'next/font/google';
import {NextUIProvider} from '@nextui-org/react';

const customFont = Comic_Neue({ weight: ['400'], subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Hugin'
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={customFont.className}>
      <body>
        <Providers>
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
