/**
 * Enhanced Authorization Middleware
 * Provides role-based and permission-based access control with security features
 */

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { Permission, hasAnyPermission, hasAllPermissions, hasPermission } from '../permissions'
import { verifySecureToken, SecureSessionPayload, validateCSRFForRequest } from '../security'
import { applySecurityHeaders } from '../security-headers'

/**
 * Authentication result
 */
export interface AuthResult {
  authenticated: boolean
  session?: SecureSessionPayload
  reason?: string
}

/**
 * Authorization options
 */
export interface AuthorizationOptions {
  requiredPermissions?: Permission | Permission[]
  requireAllPermissions?: boolean
  allowedRoles?: string[]
  requireCSRF?: boolean
  skipIPValidation?: boolean
  skipUserAgentValidation?: boolean
}

/**
 * Authorization result
 */
export interface AuthorizationResult {
  authorized: boolean
  session?: SecureSessionPayload
  reason?: string
  statusCode?: number
}

/**
 * Get session from request cookies with enhanced security validation
 */
export async function getSecureSession(request: NextRequest): Promise<AuthResult> {
  try {
    // Try to get token from request cookies first (works in middleware and tests)
    let token = request.cookies.get('session')?.value

    // Fallback to cookies() for API routes (when available)
    if (!token) {
      try {
        const cookieStore = await cookies()
        token = cookieStore.get('session')?.value
      } catch {
        // cookies() not available in this context (e.g., tests)
        // token remains undefined, will be handled below
      }
    }

    if (!token) {
      return {
        authenticated: false,
        reason: 'No session token found',
      }
    }

    // Verify token with security validation
    const validation = await verifySecureToken(token, request)

    if (!validation.valid) {
      return {
        authenticated: false,
        reason: validation.reason || 'Invalid session',
      }
    }

    return {
      authenticated: true,
      session: validation.session,
    }
  } catch (error) {
    console.error('Session validation error:', error)
    return {
      authenticated: false,
      reason: 'Session validation failed',
    }
  }
}

/**
 * Check if user is authenticated (for middleware)
 */
export async function isAuthenticated(request: NextRequest): Promise<boolean> {
  const authResult = await getSecureSession(request)
  return authResult.authenticated
}

/**
 * Require authentication middleware
 */
export function requireAuth() {
  return async (request: NextRequest): Promise<NextResponse | null> => {
    const authResult = await getSecureSession(request)

    if (!authResult.authenticated) {
      return applySecurityHeaders(NextResponse.json(
        { error: 'Authentication required', reason: authResult.reason },
        { status: 401 }
      ))
    }

    return null // Allow request to continue
  }
}

/**
 * Require specific permissions middleware
 */
export function requirePermissions(
  requiredPermissions: Permission | Permission[],
  requireAll: boolean = false
) {
  return async (request: NextRequest): Promise<NextResponse | null> => {
    const authResult = await getSecureSession(request)

    if (!authResult.authenticated || !authResult.session) {
      return applySecurityHeaders(NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      ))
    }

    const permissions = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions]
    const userPermissions = authResult.session.permissions as Permission[]

    let hasRequiredPermissions: boolean
    if (requireAll) {
      hasRequiredPermissions = hasAllPermissions(userPermissions, permissions)
    } else {
      hasRequiredPermissions = hasAnyPermission(userPermissions, permissions)
    }

    if (!hasRequiredPermissions) {
      return applySecurityHeaders(NextResponse.json(
        {
          error: 'Insufficient permissions',
          required: permissions,
          user: userPermissions,
        },
        { status: 403 }
      ))
    }

    return null // Allow request to continue
  }
}

/**
 * Require specific roles middleware
 */
export function requireRoles(allowedRoles: string[]) {
  return async (request: NextRequest): Promise<NextResponse | null> => {
    const authResult = await getSecureSession(request)

    if (!authResult.authenticated || !authResult.session) {
      return applySecurityHeaders(NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      ))
    }

    if (!allowedRoles.includes(authResult.session.roleId)) {
      return applySecurityHeaders(NextResponse.json(
        {
          error: 'Insufficient role permissions',
          required: allowedRoles,
          user: authResult.session.roleId,
        },
        { status: 403 }
      ))
    }

    return null // Allow request to continue
  }
}

/**
 * Comprehensive authorization middleware with all security features
 */
export function requireAuthorization(options: AuthorizationOptions = {}) {
  return async (request: NextRequest): Promise<NextResponse | null> => {
    const authResult = await getSecureSession(request)

    if (!authResult.authenticated || !authResult.session) {
      return applySecurityHeaders(NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      ))
    }

    const session = authResult.session

    // Check CSRF protection if required
    if (options.requireCSRF !== false) {
      const csrfValidation = await validateCSRFForRequest(request, session)
      if (!csrfValidation.valid) {
        return applySecurityHeaders(NextResponse.json(
          { error: csrfValidation.reason },
          { status: 403 }
        ))
      }
    }

    // Check role requirements
    if (options.allowedRoles && !options.allowedRoles.includes(session.roleId)) {
      return applySecurityHeaders(NextResponse.json(
        {
          error: 'Insufficient role permissions',
          required: options.allowedRoles,
          user: session.roleId,
        },
        { status: 403 }
      ))
    }

    // Check permission requirements
    if (options.requiredPermissions) {
      const permissions = Array.isArray(options.requiredPermissions)
        ? options.requiredPermissions
        : [options.requiredPermissions]
      const userPermissions = session.permissions as Permission[]

      let hasRequiredPermissions: boolean
      if (options.requireAllPermissions) {
        hasRequiredPermissions = hasAllPermissions(userPermissions, permissions)
      } else {
        hasRequiredPermissions = hasAnyPermission(userPermissions, permissions)
      }

      if (!hasRequiredPermissions) {
        return applySecurityHeaders(NextResponse.json(
          {
            error: 'Insufficient permissions',
            required: permissions,
            user: userPermissions,
          },
          { status: 403 }
        ))
      }
    }

    return null // Allow request to continue
  }
}

/**
 * API route wrapper with authorization
 */
export function withAuthorization<T extends unknown[]>(
  handler: (request: NextRequest, session: SecureSessionPayload, ...args: T) => Promise<NextResponse>,
  options: AuthorizationOptions = {}
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    const authCheck = requireAuthorization(options)
    const authResult = await authCheck(request)

    if (authResult) {
      return authResult // Return error response
    }

    // Get session (we know it's valid from the check above)
    const sessionResult = await getSecureSession(request)
    if (!sessionResult.session) {
      return applySecurityHeaders(NextResponse.json(
        { error: 'Session validation failed' },
        { status: 500 }
      ))
    }

    // Execute the handler with the validated session
    return await handler(request, sessionResult.session, ...args)
  }
}

/**
 * Admin-only middleware (requires admin role and admin API access permission)
 */
export function requireAdmin() {
  return requireAuthorization({
    allowedRoles: ['role_admin'],
    requiredPermissions: Permission.ADMIN_API_ACCESS,
    requireCSRF: true,
  })
}

/**
 * User management middleware (requires user management permissions)
 */
export function requireUserManagement() {
  return requireAuthorization({
    requiredPermissions: [
      Permission.VIEW_USERS,
      Permission.ADD_USER,
      Permission.EDIT_USER,
    ],
    requireAllPermissions: false, // Any of these permissions
    requireCSRF: true,
  })
}

/**
 * Helper to check if user has permission (for use in components/pages)
 */
export function userHasPermission(
  session: SecureSessionPayload | null,
  permission: Permission
): boolean {
  if (!session) return false
  return hasPermission(session.permissions as Permission[], permission)
}

/**
 * Helper to check if user has any of the permissions
 */
export function userHasAnyPermission(
  session: SecureSessionPayload | null,
  permissions: Permission[]
): boolean {
  if (!session) return false
  return hasAnyPermission(session.permissions as Permission[], permissions)
}

/**
 * Helper to check if user has all permissions
 */
export function userHasAllPermissions(
  session: SecureSessionPayload | null,
  permissions: Permission[]
): boolean {
  if (!session) return false
  return hasAllPermissions(session.permissions as Permission[], permissions)
}