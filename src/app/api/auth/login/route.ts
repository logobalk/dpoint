import { NextRequest, NextResponse } from 'next/server'
import { authenticate, createSecureSessionWithCookie } from '@/lib/auth'
import { withRateLimit } from '@/lib/rate-limit'
import { applySecurityHeaders, InputValidator } from '@/lib/security-headers'
import { getRolePermissions } from '@/lib/permissions'

async function loginHandler(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()

    // Validate and sanitize input
    const validation = InputValidator.validateRequestBody(body, ['email', 'password'])
    if (!validation.valid) {
      return applySecurityHeaders(NextResponse.json(
        { error: 'Invalid input', details: validation.errors },
        { status: 400 }
      ))
    }

    const { email, password } = validation.sanitized

    // Additional email validation
    if (!InputValidator.isValidEmail(email as string)) {
      return applySecurityHeaders(NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      ))
    }

    const user = await authenticate(email as string, password as string)

    if (!user) {
      return applySecurityHeaders(NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      ))
    }

    // Create secure session with enhanced security features
    const { csrfToken } = await createSecureSessionWithCookie(user, request)

    // Get user permissions for the response
    const permissions = getRolePermissions(user.roleId)

    return applySecurityHeaders(NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        roleId: user.roleId,
        permissions: permissions.map(p => p.toString()),
      },
      csrfToken, // Include CSRF token for client-side requests
    }))
  } catch (error) {
    console.error('Login error:', error)
    return applySecurityHeaders(NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    ))
  }
}

// Apply rate limiting to the login endpoint
export const POST = withRateLimit(loginHandler)
