/* eslint-disable @typescript-eslint/no-unused-vars */
import {NextAuth} from 'next-auth';
import { JWT  } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      name: string;
      email: string;
    };
    idToken: string;
    accessToken: string;
    error?: 'RefreshAccessTokenError';
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    idToken: string;
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
    error?: 'RefreshAccessTokenError';
  }
}