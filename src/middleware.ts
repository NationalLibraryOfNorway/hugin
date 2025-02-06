import {NextRequest, NextResponse} from 'next/server';
import {getUserToken} from '@/utils/cookieUtils';
import {isAuthorized} from '@/utils/authUtils';

const protectedPaths = ['/api/title', '/api/box', '/api/newspaper'];

export default function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isProtected = protectedPaths.some(protectedPath => path.includes(protectedPath));
  const userToken = getUserToken();
  const authorized = isAuthorized(userToken);

  if (!isProtected) {
    return NextResponse.next();
  }

  if (isProtected && authorized) {
    return NextResponse.next();
  }

  return NextResponse.json({error: 'Unauthorized'}, {status: 401});
}


export const config = {
  // Run on all routes except these
  matcher: ['/((?!_next/static|_next/image|.*\\.png$|.*\\.ico$|.*\\.svg$|api/auth).*)']
};