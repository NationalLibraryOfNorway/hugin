/* eslint-disable @typescript-eslint/naming-convention,@typescript-eslint/no-unsafe-assignment */
import {AuthOptions, TokenSet} from 'next-auth';
import KeycloakProvider from 'next-auth/providers/keycloak';
import {JWT} from 'next-auth/jwt';

export const authOptions: AuthOptions = {
  providers: [
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_CLIENT_ID ?? '',
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET ?? '',
      issuer: process.env.KEYCLOAK_ISSUER
    })
  ],
  session: {
    maxAge: 5 * 60
  },
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.idToken = account.id_token!;
        token.accessToken = account.access_token!;
        token.refreshToken = account.refresh_token!;
        token.expiresAt = account.expires_at!;
        return token;
      }
      if (Date.now() < token.expiresAt * 1000 - 10 * 1000) {
        return token;
      }
      try {
        const response = await requestRefreshOfAccessToken(token);
        const tokens: TokenSet = await response.json();

        if (!response.ok) throw tokens;

        return {
          ...token,
          accessToken: tokens.access_token!,
          expiresAt: Math.floor(Date.now() / 1000 + (tokens.expires_in as number)),
          refreshToken: tokens.refresh_token ?? token.refreshToken,
        };
      } catch (error) {
        console.error('Error refreshing access token', error);
        return {...token, error: 'RefreshAccessTokenError' as const};
      }
    },
    // eslint-disable-next-line @typescript-eslint/require-await
    async session({ session, token }) {
      if (token.accessToken) {
        session.idToken = token.idToken;
        session.accessToken = token.accessToken;
      }
      session.error = token.error;
      return session;
    }
  }
};

async function requestRefreshOfAccessToken(token: JWT) {
  return await fetch(`${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/token`, {
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    body: new URLSearchParams({
      client_id: process.env.KEYCLOAK_CLIENT_ID,
      client_secret: process.env.KEYCLOAK_CLIENT_SECRET,
      grant_type: 'refresh_token',
      refresh_token: token.refreshToken,
    }),
    method: 'POST'
  });
}