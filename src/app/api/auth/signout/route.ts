import {NextResponse} from 'next/server';
import {deleteUserToken, getRefreshToken} from '@/utils/cookieUtils';

// POST api/auth/signout
export async function POST(): Promise<NextResponse> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    return NextResponse.json({error: 'No user token found'}, {status: 401});
  }

  return await fetch(`${process.env.AUTH_API_PATH}/logout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: refreshToken
  }).then(res => {
    if (!res.ok) {
      return NextResponse.json({error: 'Failed to logout'}, {status: res.status});
    }
    deleteUserToken();
    return NextResponse.json({message: 'Logged out successfully'}, {status: 200});
  }).catch((error: Error) => {
    return NextResponse.json({error: `Failed to logout: ${error.message}`}, {status: 500});
  });
}
