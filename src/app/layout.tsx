import type {Metadata} from 'next';
import './globals.css';
import {Providers} from '@/app/providers';
import AppShell from '@/components/AppShell';
import {Quicksand} from 'next/font/google';

const customFont = Quicksand({ weight: ['400'], subsets: ['latin'] });

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
