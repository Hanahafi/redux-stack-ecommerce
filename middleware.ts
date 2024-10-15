import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import * as jose from 'jose';

export async function middleware(request: NextRequest) {
  console.log('Middleware - Current path:', request.nextUrl.pathname);
  
  const publicRoutes = ['/login', '/register', '/', '/api/login', '/api/register'];
  if (publicRoutes.includes(request.nextUrl.pathname)) {
    console.log('Middleware - Allowing public route');
    return NextResponse.next();
  }

  // Allow access to dashboard routes without token verification
  if (request.nextUrl.pathname.startsWith('/admin/dashboard') ||
      request.nextUrl.pathname.startsWith('/seller/dashboard') ||
      request.nextUrl.pathname.startsWith('/buyer/dashboard')) {
    console.log('Middleware - Allowing dashboard access without verification');
    return NextResponse.next();
  }

  const authHeader = request.headers.get('Authorization');
  const cookieToken = request.cookies.get('token')?.value;
  const token = authHeader?.split(' ')[1] || cookieToken;

  console.log('Middleware - Auth Header:', authHeader);
  console.log('Middleware - Cookie Token:', cookieToken);
  console.log('Middleware - Token:', token ? 'Present' : 'Not present');

  if (!token) {
    if (request.nextUrl.pathname.startsWith('/api/')) {
      console.log('Middleware - Unauthorized API request');
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    console.log('Middleware - Redirecting to login');
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not set in the environment variables');
    }

    const secretKey = new TextEncoder().encode(jwtSecret);
    const { payload } = await jose.jwtVerify(token, secretKey);

    console.log('Middleware - Token verified successfully');
    console.log('Middleware - User role:', payload.role);

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('X-User-Role', payload.role as string);
    requestHeaders.set('X-User-Id', payload.userId as string);

    // Allow access to all seller routes
    if (payload.role === 'seller' && request.nextUrl.pathname.startsWith('/seller')) {
      console.log('Middleware - Allowing seller access');
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }

    // Check role-based access for other routes
    if (
      (payload.role === 'admin' && request.nextUrl.pathname.startsWith('/admin')) ||
      (payload.role === 'buyer' && request.nextUrl.pathname.startsWith('/buyer')) ||
      request.nextUrl.pathname.startsWith('/api/')
    ) {
      console.log('Middleware - Allowing role-based access');
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }

    console.log('Middleware - Unauthorized access, redirecting to login');
    return NextResponse.redirect(new URL('/login', request.url));
  } catch (error) {
    console.error('Middleware - Token verification failed:', error);
    if (request.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: ['/((?!_next/static|favicon.ico).*)'],
};
