'use client';

import {NextUIProvider} from '@nextui-org/react';
import {AuthProvider} from '@/app/AuthProvider';
import React from 'react';

export function Providers({children}: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <React.StrictMode>
        <NextUIProvider locale='nb-NO'>
          {children}
        </NextUIProvider>
      </React.StrictMode>
    </AuthProvider>
  );
}
