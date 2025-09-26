import { NextRequest, NextResponse } from 'next/server'
import { applySecurityHeaders } from '@/lib/security-headers'
import { withAuthorization } from '@/lib/middleware'
import { createCSRFProtectedResponse } from '@/lib/security'

/**
 * GET /api/auth/me - Get current user information
 * Requires authentication with enhanced security validation
 */
export const GET = withAuthorization(
  async (request: NextRequest, session) => {
    try {
      return createCSRFProtectedResponse(
        {
          id: session.userId,
          email: session.email,
          name: session.name,
          role: session.role,
          roleId: session.roleId,
          permissions: session.permissions,
          sessionInfo: {
            createdAt: session.createdAt,
            lastActivity: session.lastActivity,
            loginMethod: session.loginMethod,
          },
        },
        { status: 200 },
        session.csrfToken
      )
    } catch (error) {
      console.error('Session check error:', error)
      return applySecurityHeaders(NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      ))
    }
  },
  {
    requireCSRF: false, // GET requests don't need CSRF
  }
)
