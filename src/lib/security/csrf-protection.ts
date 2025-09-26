/**
 * CSRF Protection Utilities
 * Provides Cross-Site Request Forgery protection
 */

import { NextRequest, NextResponse } from 'next/server'
import { SecureSessionPayload, validateCSRFToken, logSecurityEvent, SecurityEventType } from './session-security'

/**
 * CSRF validation result
 */
export interface CSRFValidationResult {
  valid: boolean
  reason?: string
}

/**
 * Extract CSRF token from request headers or body
 */
export function extractCSRFToken(request: NextRequest): string | null {
  // Check X-CSRF-Token header (recommended)
  const headerToken = request.headers.get('x-csrf-token')
  if (headerToken) return headerToken

  // Check Authorization header with CSRF prefix
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('CSRF ')) {
    return authHeader.substring(5)
  }

  return null
}

/**
 * Validate CSRF token for a request
 */
export async function validateCSRFForRequest(
  request: NextRequest,
  session: SecureSessionPayload
): Promise<CSRFValidationResult> {
  // Skip CSRF validation for GET, HEAD, OPTIONS requests
  const method = request.method.toUpperCase()
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    return { valid: true }
  }

  const requestToken = extractCSRFToken(request)

  if (!requestToken) {
    await logSecurityEvent({
      type: SecurityEventType.CSRF_TOKEN_MISMATCH,
      userId: session.userId,
      sessionId: session.sessionId,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      severity: 'high',
      details: { reason: 'Missing CSRF token' },
    })

    return {
      valid: false,
      reason: 'CSRF token required for this request',
    }
  }

  if (!validateCSRFToken(session.csrfToken, requestToken)) {
    await logSecurityEvent({
      type: SecurityEventType.CSRF_TOKEN_MISMATCH,
      userId: session.userId,
      sessionId: session.sessionId,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      severity: 'high',
      details: {
        reason: 'Invalid CSRF token',
        expectedToken: session.csrfToken.substring(0, 10) + '...',
        receivedToken: requestToken.substring(0, 10) + '...',
      },
    })

    return {
      valid: false,
      reason: 'Invalid CSRF token',
    }
  }

  return { valid: true }
}

/**
 * Add CSRF token to response headers
 */
export function addCSRFTokenToResponse(
  response: NextResponse,
  csrfToken: string
): NextResponse {
  response.headers.set('X-CSRF-Token', csrfToken)
  return response
}

/**
 * Create a response with CSRF token
 */
export function createCSRFProtectedResponse(
  body: unknown,
  init: ResponseInit = {},
  csrfToken: string
): NextResponse {
  const response = NextResponse.json(body, init)
  return addCSRFTokenToResponse(response, csrfToken)
}

/**
 * CSRF protection middleware wrapper
 */
export function withCSRFProtection(
  handler: (request: NextRequest, session: SecureSessionPayload) => Promise<NextResponse>
) {
  return async (request: NextRequest, session: SecureSessionPayload): Promise<NextResponse> => {
    // Validate CSRF token
    const csrfValidation = await validateCSRFForRequest(request, session)

    if (!csrfValidation.valid) {
      return NextResponse.json(
        { error: csrfValidation.reason },
        { status: 403 }
      )
    }

    // Execute the handler
    const response = await handler(request, session)

    // Add CSRF token to response
    return addCSRFTokenToResponse(response, session.csrfToken)
  }
}

/**
 * Generate CSRF meta tags for HTML pages
 */
export function generateCSRFMetaTags(csrfToken: string): string {
  return `<meta name="csrf-token" content="${csrfToken}">`
}

/**
 * Client-side CSRF token helper (for use in frontend)
 */
export const CSRFClientHelper = {
  /**
   * Get CSRF token from meta tag
   */
  getTokenFromMeta(): string | null {
    if (typeof document === 'undefined') return null

    const metaTag = document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement
    return metaTag?.content || null
  },

  /**
   * Add CSRF token to fetch headers
   */
  addTokenToHeaders(headers: HeadersInit = {}): HeadersInit {
    const token = this.getTokenFromMeta()
    if (!token) return headers

    return {
      ...headers,
      'X-CSRF-Token': token,
    }
  },

  /**
   * Create fetch options with CSRF protection
   */
  createFetchOptions(options: RequestInit = {}): RequestInit {
    return {
      ...options,
      headers: this.addTokenToHeaders(options.headers),
    }
  },
}