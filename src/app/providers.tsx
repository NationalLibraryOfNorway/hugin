'use client';

import { SessionProvider } from 'next-auth/react';
import {NextUIProvider} from '@nextui-org/react';

export function Providers({children}: { children: React.ReactNode }) {
  return (
    <SessionProvider basePath="/hugin/api/auth" refetchInterval={4.75 * 60}>
      <NextUIProvider>
        {children}
      </NextUIProvider>
    </SessionProvider>
  );
}