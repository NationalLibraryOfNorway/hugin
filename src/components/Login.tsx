'use client';

import { signIn } from 'next-auth/react';

export default function Login() {
  return (
    <button onClick={() => void signIn('keycloak')}>
      Logg inn
    </button>
  );
}