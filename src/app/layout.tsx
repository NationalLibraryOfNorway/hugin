import type {Metadata} from 'next';
import './globals.css';
import {Providers} from '@/app/providers';
import AppShell from '@/components/AppShell';

export const metadata: Metadata = {
  title: 'Hugin'
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
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
