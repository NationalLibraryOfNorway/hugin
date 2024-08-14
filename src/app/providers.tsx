'use client';

import { SessionProvider } from 'next-auth/react';
import {NextUIProvider} from '@nextui-org/react';

export function Providers({children}: { children: React.ReactNode }) {
  return (
  /* Refetch interval set to fetch 15 seconds before the token expires */
    <SessionProvider basePath="/hugin/api/auth" refetchInterval={4.75 * 60}>
      <NextUIProvider>
        {children}
      </NextUIProvider>
    </SessionProvider>
  );
}