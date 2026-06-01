import { NextResponse } from 'next/server';

export function middleware(req) {
  const url = req.nextUrl;

  // Only apply on staging domain
  if (url.hostname === 'staging.180youthdartsacademy.co.uk') {
    const hasAccess = req.cookies.get('staging_access');

    if (!hasAccess) {
      url.pathname = '/staging-access';
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/:path*',
};
