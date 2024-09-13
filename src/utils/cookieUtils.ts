import {cookies} from 'next/headers';
import {UserToken, userTokenBuilder} from '@/models/UserToken';

export function getUserToken(): UserToken | undefined {
  const userCookieValue = cookies().get('user')?.value;
  if (!userCookieValue) {
    return undefined;
  }
  return userTokenBuilder(JSON.parse(userCookieValue) as UserToken);
}

export function getRefreshToken(): string | undefined {
  return getUserToken()?.refreshToken;
}

export function deleteUserToken() {
  cookies().delete('user');
}

export function setUserCookie(user: UserToken) {
  cookies().set('user', JSON.stringify(user), {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/'
  });
}