'use client';

import {SessionProvider} from 'next-auth/react';
import {NextUIProvider} from '@nextui-org/react';
import {Session} from 'next-auth';

export function Providers({children, session}: { children: React.ReactNode; session?: Session | null }) {
  return (
  /* Refetch interval set to fetch 15 seconds before the token expires */
    <SessionProvider session={session} basePath="/hugin/api/auth" refetchInterval={4.75 * 60}>
      <NextUIProvider>
        {children}
      </NextUIProvider>
    </SessionProvider>
  );
}