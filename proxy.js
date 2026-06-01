export default async function proxy(request) {
  const url = new URL(request.url);

  // Only apply on staging domain
  if (url.hostname === 'staging.180youthdartsacademy.co.uk') {
    const hasAccess = request.cookies.get('staging_access');

    if (!hasAccess) {
      // Rewrite to the staging access page
      return new Response(null, {
        status: 307,
        headers: { Location: '/staging-access' },
      });
    }
  }

  // Allow normal requests
  return new Response(null, { status: 200 });
}
