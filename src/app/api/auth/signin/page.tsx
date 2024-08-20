'use client';

import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// Function to automatically redirect to the default keycloak login page
// Prevents having to select keycloak from the list of providers before logging in
export default function SignIn() {
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status === 'unauthenticated') {
      void signIn('keycloak');
    }
    else if (status === 'authenticated') {
      router.push('/');
    }
  }, [ router, status ]);

  return (
    <div/>
  );
}