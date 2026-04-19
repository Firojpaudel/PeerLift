import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for auth-related routes and static files
  if (
    pathname.startsWith('/api/auth') || 
    pathname.startsWith('/_next') || 
    pathname.includes('/favicon.ico')
  ) {
    return NextResponse.next();
  }

  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET 
  });

  const protectedRoutes = [
    '/dashboard',
    '/requests',
    '/sessions',
    '/profile/edit',
  ];

  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );

  if (isProtected && !token) {
    const url = new URL('/login', request.url);
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith('/api/admin') && !token?.isAdmin) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico).*)'],
};
