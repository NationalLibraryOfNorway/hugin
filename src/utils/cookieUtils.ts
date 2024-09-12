import {cookies} from 'next/headers';
import {UserToken} from '@/models/UserToken';

export function getRefreshToken(): string | undefined {
  const userCookieValue = cookies().get('user')?.value;
  if (!userCookieValue) {
    return undefined;
  }
  const userToken = JSON.parse(userCookieValue) as UserToken;
  return userToken.refreshToken;
}

export function setUserCookie(user: UserToken) {
  cookies().set('user', JSON.stringify(user), {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/'
  });
}