import {User} from '@/models/UserToken';
import {ProblemDetail} from '@/models/ProblemDetail';
import {NextResponse} from 'next/server';

export async function signIn(code: string, redirectUrl: string): Promise<User> {
  const data = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/auth/signin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({code, redirectUrl})
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to authenticate');
      }
      return response;
    });
  return await data.json() as User;
}

export async function signOut(): Promise<NextResponse> {
  return await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/auth/signout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(async response => {
      if (!response.ok) {
        const problemDetail = await response.json() as ProblemDetail;
        return NextResponse.json({error: problemDetail.detail}, {status: problemDetail.status});
      }
      return NextResponse.json({message: 'Logged out successfully'}, {status: 204});
    })
    .catch((error: Error) => {
      return NextResponse.json({error: `Failed to logout: ${error.message}`}, {status: 500});
    });
}

export async function refresh(): Promise<User> {
  const data = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  });
  return await data.json() as User;
}