import {NextRequest, NextResponse} from 'next/server';
import {UserToken} from '@/models/UserToken';
import {ProblemDetail} from '@/models/ProblemDetail';
import {setUserCookie} from '@/utils/cookieUtils';

interface LoginRequest {
  code: string;
  redirectUrl: string;
}

// POST api/auth/signin
export async function POST(req: NextRequest): Promise<NextResponse> {
  const {code, redirectUrl} = await req.json() as LoginRequest;
  const data = await fetch(`${process.env.AUTH_API_PATH}/login?${redirectUrl}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: code
  })
    .then(async response => {
      if (!response.ok) {
        const problemDetail = await response.json() as ProblemDetail;
        return NextResponse.json({error: problemDetail.detail}, {status: problemDetail.status});
      }
      return response;
    });

  if (data instanceof NextResponse) {
    return data;
  }

  const userToken = await data.json() as UserToken;

  if (!userToken || !userToken.name || !userToken.expires) {
    return NextResponse.json({error: 'Failed to authenticate'}, {status: 500});
  }

  // Set the user cookie and then have a small timeout to allow the cookie to be set before returning the response
  setUserCookie(userToken);
  return new Promise<NextResponse>(resolve => {
    setTimeout(() => {
      resolve(NextResponse.json({name: userToken.name, expires: userToken.expires}, {status: 200}));
    }, 1000);
  });
}
