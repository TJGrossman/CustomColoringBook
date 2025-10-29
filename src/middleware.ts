import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Check if password is already set in cookies
  const passwordCookie = request.cookies.get('site-password')
  
  // If password is correct, allow access
  if (passwordCookie?.value === 'pioneer') {
    return NextResponse.next()
  }
  
  // If it's the password page itself, allow it
  if (request.nextUrl.pathname === '/password') {
    return NextResponse.next()
  }
  
  // If it's a static asset, allow it
  if (request.nextUrl.pathname.startsWith('/_next') || 
      request.nextUrl.pathname.startsWith('/favicon') ||
      request.nextUrl.pathname.startsWith('/examples')) {
    return NextResponse.next()
  }
  
  // Redirect to password page
  return NextResponse.redirect(new URL('/password', request.url))
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
