export default function proxy(request) {
  const url = new URL(request.url);

  // Only apply on staging domain
  if (url.hostname === 'staging.180youthdartsacademy.co.uk') {
    const hasAccess = request.cookies.get('staging_access');

    if (!hasAccess) {
      url.pathname = '/staging-access';
      return Response.rewrite(url);
    }
  }

  return Response.next();
}
