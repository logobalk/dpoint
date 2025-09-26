import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { env } from './env'
import { getAuthService } from './data/data-source'
import { toPublicUser } from './data/interfaces'
import { getRolePermissions } from './permissions'
import { createSecureSession, invalidateSession, verifySecureToken } from './security'

export interface User {
  id: string
  email: string
  name: string
  role: string // Changed to string to support flexible roles
  roleId: string // Add roleId for RBAC
}

// Enhanced session creation with security features
export async function createSecureSessionWithCookie(
  user: User,
  request: NextRequest
): Promise<{ token: string; csrfToken: string }> {
  // Get user permissions based on role
  const permissions = getRolePermissions(user.roleId)

  // Create secure session with all security features
  const { session, token } = await createSecureSession(
    {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      roleId: user.roleId,
      permissions: permissions.map(p => p.toString()),
    },
    request,
    'password'
  )

  // Set secure cookie
  const cookieStore = await cookies()
  cookieStore.set('session', token, {
    expires: session.expiresAt,
    httpOnly: true,
    secure: true, // Always require HTTPS
    sameSite: 'strict', // Prevent CSRF attacks
    path: '/',
  })

  return {
    token,
    csrfToken: session.csrfToken,
  }
}

// Enhanced session deletion with security logging
export async function deleteSecureSession(request: NextRequest): Promise<void> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('session')?.value

    if (token) {
      // Try to get session info for logging
      const validation = await verifySecureToken(token, request)
      if (validation.valid && validation.session) {
        // Invalidate the specific session
        await invalidateSession(validation.session.sessionId, 'User logout')

        // Optional: Invalidate all sessions for this user for better security
        // Uncomment the line below if you want to log out from all devices
        // await invalidateAllUserSessions(validation.session.userId, 'User logout from one device')
      }
    }

    // Delete the cookie with the same options used when setting it
    cookieStore.set('session', '', {
      expires: new Date(0), // Set expiry to past date
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/',
    })
  } catch (error) {
    console.error('Error during secure session deletion:', error)
    // Still delete the cookie even if logging fails
    const cookieStore = await cookies()
    cookieStore.set('session', '', {
      expires: new Date(0),
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/',
    })
  }
}

// Secure authentication function with proper user lookup and password verification
export async function authenticate(email: string, password: string): Promise<User | null> {
  try {
    // Input validation
    if (!email || !password) {
      return null
    }

    // Get authentication service
    const authService = getAuthService()

    // Authenticate user
    const dataUser = await authService.authenticate(email, password)

    if (!dataUser) {
      return null
    }

    // Convert to public user format
    const publicUser = toPublicUser(dataUser)

    // Map legacy role to roleId
    const roleId = publicUser.role === 'admin' ? 'role_admin' : 'role_user'

    return {
      id: publicUser.id,
      email: publicUser.email,
      name: publicUser.name,
      role: publicUser.role,
      roleId: roleId,
    }
  } catch (error) {
    console.error('Authentication error:', error)
    return null
  }
}

// Redirect to login helper
export function redirectToLogin(request: NextRequest) {
  const loginUrl = new URL('/login', request.url)
  const fromUrl = request.nextUrl.pathname + request.nextUrl.search
  loginUrl.searchParams.set('from', fromUrl)
  return NextResponse.redirect(loginUrl)
}

// Redirect to dashboard helper
export function redirectToDashboard() {
  return NextResponse.redirect(new URL('/dashboard', env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'))
}
