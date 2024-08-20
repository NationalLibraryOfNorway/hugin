/* eslint-disable @typescript-eslint/no-unused-vars */
import {NextAuth} from 'next-auth';
// JWT import is used although your IDE may complain that it is not.
// Please do not remove it.
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