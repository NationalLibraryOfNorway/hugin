import {NextRequest, NextResponse} from 'next/server';
import {getUserToken} from '@/utils/cookieUtils';
import {UserToken} from '@/models/UserToken';

const protectedPaths = ['/api/title', '/api/box', '/api/newspaper'];
const requiredRoles = ['T_relation_avis']; // TODO: Fiks rolle når den er opprettet

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

function isAuthorized(token?: UserToken) {
  if (token) {
    if (token.refreshExpires.getTime() > Date.now()) {
      return requiredRoles.some(role => token.groups.includes(role));
    }
  }
  return false;
}


export const config = {
  // Run on all routes except these
  matcher: ['/((?!_next/static|_next/image|.*\\.png$|.*\\.ico$|.*\\.svg$|api/auth).*)']
};