'use client';

import { signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function Logout() {
  const router = useRouter();

  useEffect(() => {
    void signOut({ redirect: false }).then(() => {
      void router.push('/');
    });
  }, [router]);

  return <p>Logging out...</p>;
}