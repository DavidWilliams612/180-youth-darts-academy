import { NextResponse } from 'next/server';

export function proxy(req) {
  const url = req.nextUrl;
  const hasAccess = req.cookies.get('staging_access');

  const isStaging = process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview';

  if (!isStaging) return NextResponse.next();

  if (hasAccess?.value === 'true') {
    return NextResponse.next();
  }

  if (!url.pathname.startsWith('/staging-access')) {
    url.pathname = '/staging-access';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|favicon.ico).*)'],
};
