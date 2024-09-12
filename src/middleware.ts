import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {getSessionStorageItem} from '@/utils/storageUtil';


export default function middleware(req: NextRequest) {
  if (req.method === 'GET') {
    return NextResponse.next();
  }

  console.log(`Middleware 1: ${req.method}: ${req.url}`);

  const requestHeaders = new Headers(req.headers);
  const bearerToken = getSessionStorageItem('accessToken');
  if (bearerToken) {
    requestHeaders.set('Authorization', `Bearer ${bearerToken}`);
  }
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: 'shamalamadingdong/api/:path*',
};