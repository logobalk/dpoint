import { NextRequest, NextResponse } from 'next/server'
import { deleteSecureSession } from '@/lib/auth'
import { applySecurityHeaders } from '@/lib/security-headers'
import { withAuthorization } from '@/lib/middleware'

/**
 * POST /api/auth/logout - Secure logout with session invalidation
 * Requires authentication and CSRF protection
 */
export const POST = withAuthorization(
  async (request: NextRequest) => {
    try {
      // Delete secure session with logging
      await deleteSecureSession(request)

      return applySecurityHeaders(NextResponse.json({
        success: true,
        message: 'Logged out successfully'
      }))
    } catch (error) {
      console.error('Logout error:', error)
      return applySecurityHeaders(NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      ))
    }
  },
  {
    requireCSRF: true, // Require CSRF protection for logout
  }
)
