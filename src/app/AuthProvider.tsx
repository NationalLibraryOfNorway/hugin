'use client';

import {createContext, useCallback, useContext, useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import keycloakConfig from '@/lib/keycloak';
import {User} from '@/models/UserToken';
import {refresh, signIn, signOut} from '@/services/auth.data';
import usePersistState from '@/hooks/usePersistState';

interface IAuthContext {
  authenticated: boolean;
  user?: User | null;
  logout?: () => void;
}

const AuthContext = createContext<IAuthContext>({
  authenticated: false,
  logout: () => {}
});

export const AuthProvider = ({children}: { children: React.ReactNode }) => {
  const router = useRouter();

  const [authenticated, setAuthenticated] = usePersistState(`${AuthProvider.name.toLowerCase()}_authenticated`, false);
  const [user, setUser] = usePersistState<User|null>(`${AuthProvider.name.toLowerCase()}_user`, null);
  const [intervalId, setIntervalId] = useState<number>();

  const handleNotAuthenticated = useCallback(() => {
    setAuthenticated(false);
    setUser(null);
    if (intervalId) {
      clearInterval(intervalId);
    }
    const currentUrl = encodeAndTrimUrl(window.location.href);
    window.location.assign(`${keycloakConfig.url}/realms/${keycloakConfig.realm}/protocol/openid-connect/auth` +
        `?client_id=${keycloakConfig.clientId}&redirect_uri=${currentUrl}&response_type=code&scope=openid`);
  }, [intervalId, setAuthenticated, setUser]);

  useEffect(() => {
    const codeInParams = new URLSearchParams(window.location.search).get('code');
    if (codeInParams) {
      const redirectUrl = new URLSearchParams({redirectUrl: encodeAndTrimUrl(window.location.href)}).toString();
      void signIn(codeInParams, redirectUrl).then((token: User) => {
        handleIsAuthenticated(token);
        router.push('/');
      }).catch((e: Error) => {
        console.error('Failed to sign in: ', e.message);
        handleNotAuthenticated();
      });
    } else if (user) {
      if (user.expires && new Date(user.expires) > new Date()) {
        handleIsAuthenticated(user);
      }
    } else {
      handleNotAuthenticated();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleIsAuthenticated = useCallback((newUser: User) => {
    if (newUser) {
      setUser(newUser);
      setAuthenticated(true);
    }
  }, [setAuthenticated, setUser]);

  const refreshToken = useCallback(async () => {
    return refresh();
  }, []);

  const setIntervalToRefreshAccessToken = useCallback(() => {
    if (user?.expires && !intervalId) {
      const expiryTime = new Date(user?.expires).getTime() - Date.now();
      setIntervalId(window.setInterval(() => {
        void refreshToken().then((newUser: User) => {
          handleIsAuthenticated(newUser);
        })
          .catch((e: Error) => {
            console.error('Failed to refresh token: ', e.message);
            handleNotAuthenticated();
          });
      }, (expiryTime - 1000 * 15))); // Refresh token 15 seconds before expiry
    }
  }, [handleIsAuthenticated, handleNotAuthenticated, intervalId, refreshToken, user?.expires]);

  useEffect(() => {
    void setIntervalToRefreshAccessToken();
  }, [setIntervalToRefreshAccessToken]);

  const encodeAndTrimUrl= (returnUrl: string): string => {
    returnUrl = returnUrl.split('?')[0];
    if (returnUrl.at(-1) === '/') {
      returnUrl = returnUrl.slice(0, -1);
    }
    return encodeURIComponent(returnUrl);
  };

  const logout = async () => {
    await signOut()
      .then(() => {
        handleNotAuthenticated();
      });
  };

  return (
    <AuthContext.Provider
      value={{
        authenticated,
        user,
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext<IAuthContext>(AuthContext);