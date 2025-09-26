import { NextRequest, NextResponse } from 'next/server'
import { redirectToLogin } from '@/lib/auth'
import { isAuthenticated } from '@/lib/middleware/auth-middleware'
import { applySecurityHeaders } from '@/lib/security-headers'

// Define protected routes
const protectedRoutes = ['/dashboard']
const authRoutes = ['/login']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isAuth = await isAuthenticated(request)

  // Redirect authenticated users away from auth pages
  if (isAuth && authRoutes.includes(pathname)) {
    return applySecurityHeaders(NextResponse.redirect(new URL('/dashboard', request.url)))
  }

  // Redirect unauthenticated users from protected routes
  if (!isAuth && protectedRoutes.some(route => pathname.startsWith(route))) {
    return applySecurityHeaders(redirectToLogin(request))
  }

  // Apply security headers to all responses
  const response = NextResponse.next()
  return applySecurityHeaders(response)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
  runtime: 'nodejs',
}
