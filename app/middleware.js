import { NextResponse } from 'next/server';

export function middleware(req) {
  const url = req.nextUrl;

  // Only apply this logic on the staging domain
  if (url.hostname === 'staging.180youthdartsacademy.co.uk') {
    const hasAccess = req.cookies.get('staging_access');

    // If no cookie, send user to the staging access page
    if (!hasAccess) {
      const gateUrl = new URL('/staging-access', req.url);
      return NextResponse.rewrite(gateUrl);
    }
  }

  return NextResponse.next();
}

// Apply middleware to all routes
export const config = {
  matcher: '/:path*',
};
