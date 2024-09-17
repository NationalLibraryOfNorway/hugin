import {NextResponse} from 'next/server';
import {User, UserToken} from '@/models/UserToken';
import {getRefreshToken, setUserCookie} from '@/utils/cookieUtils';

// POST api/auth/refresh
export async function POST(): Promise<NextResponse> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    return NextResponse.json({error: 'No user token found'}, {status: 401});
  }

  const data = await fetch(`${process.env.AUTH_API_PATH}/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: refreshToken
  });

  const newToken = await data.json() as UserToken;

  if (!newToken || !newToken.name || !newToken.expires) {
    return NextResponse.json({error: 'Failed to refresh token'}, {status: 500});
  }

  setUserCookie(newToken);

  const user: User = {name: newToken.name, expires: newToken.expires};
  return NextResponse.json(user, {status: 200});
}