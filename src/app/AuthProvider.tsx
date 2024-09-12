'use client';

import {createContext, useCallback, useContext, useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import keycloakConfig from '@/lib/keycloak';
import {removeSessionStorageItem, setSessionStorageItem} from '@/utils/storageUtil';
// import {cookies} from 'next/headers';

interface User {
  groups?: string[];
  name?: string;
  accessToken?: string;
  expires?: Date;
  refreshToken?: string;
  refreshExpires?: Date;
}

interface IAuthContext {
  authenticated: boolean;
  user?: User;
  logout?: () => void;
}

const AuthContext = createContext<IAuthContext>({
  authenticated: false,
  logout: () => {}
});

export const AuthProvider = ({children}: { children: React.ReactNode }) => {
  const router = useRouter();

  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User>();
  const [intervalId, setIntervalId] = useState<number>();

  useEffect(() => {
    const codeInParams = new URLSearchParams(window.location.search).get('code');
    if (codeInParams) {
      const redirectUrl = new URLSearchParams({redirectUrl: trimRedirectUrl(window.location.href)}).toString();
      const fetchToken = async (): Promise<User> => {
        const data = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/ext/auth/login?${redirectUrl}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: codeInParams

        });
        return await data.json() as User;
      };

      void fetchToken().then((token: User) => {
        handleIsAuthenticated(token);
        router.push('/');
      });
    } else if (user) {
      if (user.expires && new Date(user.expires) > new Date()) {
        handleIsAuthenticated(user);
      }
    } else {
      handleNotAuthenticated();
      const currentUrl = window.location.href;
      router.push(
        `${keycloakConfig.url}/realms/${keycloakConfig.realm}/protocol/openid-connect/auth` +
          `?client_id=${keycloakConfig.clientId}&redirect_uri=${currentUrl}&response_type=code&scope=openid`);
    }
  }, []);

  const handleIsAuthenticated = (token: User) => {
    if (token) {
      setUser(token);
      setAuthenticated(true);
      setSessionStorageItem('accessToken', token?.accessToken ?? '');
    }
  };

  const handleNotAuthenticated = useCallback(() => {
    setAuthenticated(false);
    setUser(undefined);
    if (intervalId) {
      clearInterval(intervalId);
    }
    removeSessionStorageItem('accessToken');
  }, [intervalId]);

  const refreshToken = useCallback(async () => {
    const data = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/ext/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: user?.refreshToken
    });
    return await data.json() as User;
  }, []);

  const setIntervalToRefreshAccessToken = useCallback(async () => {
    if (user?.expires && !intervalId) {
      const expiryTime = new Date(user?.expires).getTime() - Date.now();
      if (expiryTime < 1000 * 60 * 4) {
        await refreshToken();
      }
      setIntervalId(window.setInterval(() => {
        void refreshToken().then((newUser: User) => {
          handleIsAuthenticated(newUser);
        })
          .catch((e: Error) => {
            console.error('Failed to refresh token: ', e.message);
            handleNotAuthenticated();
          });
      }, (1000 * 60 * 4.75))); // Refresh every 4.75 minutes (fifteen seconds before expiry)
    }
  }, [handleNotAuthenticated, intervalId, refreshToken, user?.expires]);

  useEffect(() => {
    void setIntervalToRefreshAccessToken();
  }, [setIntervalToRefreshAccessToken]);

  const trimRedirectUrl= (returnUrl: string): string => {
    returnUrl = returnUrl.split('?')[0];
    if (returnUrl.at(-1) === '/') {
      returnUrl = returnUrl.slice(0, -1);
    }
    return returnUrl;
  };

  const logout = async () => {
    await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/ext/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: user?.refreshToken
    }).then(() => {
      handleNotAuthenticated();
      window.location.reload();
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