'use client';

import {NextUIProvider} from '@nextui-org/react';
import {AuthProvider} from '@/app/AuthProvider';

export function Providers({children}: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <NextUIProvider locale='nb-NO'>
        {children}
      </NextUIProvider>
    </AuthProvider>
  );
}
