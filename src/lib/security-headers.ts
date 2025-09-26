/**
 * Security headers utilities
 * Provides comprehensive security headers to protect against common attacks
 */

import { NextResponse } from 'next/server'
import { env } from './env'

interface SecurityHeadersOptions {
  contentSecurityPolicy?: string
  strictTransportSecurity?: string
  xFrameOptions?: string
  xContentTypeOptions?: string
  referrerPolicy?: string
  permissionsPolicy?: string
  crossOriginEmbedderPolicy?: string
  crossOriginOpenerPolicy?: string
  crossOriginResourcePolicy?: string
}

/**
 * Default security headers configuration
 */
const defaultSecurityHeaders: Required<SecurityHeadersOptions> = {
  // Content Security Policy - prevents XSS attacks
  contentSecurityPolicy: [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Next.js requires unsafe-inline and unsafe-eval
    "style-src 'self' 'unsafe-inline'", // Tailwind requires unsafe-inline
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; '),
  
  // HTTP Strict Transport Security - enforces HTTPS
  strictTransportSecurity: 'max-age=31536000; includeSubDomains; preload',
  
  // X-Frame-Options - prevents clickjacking
  xFrameOptions: 'DENY',
  
  // X-Content-Type-Options - prevents MIME type sniffing
  xContentTypeOptions: 'nosniff',
  
  // Referrer Policy - controls referrer information
  referrerPolicy: 'strict-origin-when-cross-origin',
  
  // Permissions Policy - controls browser features
  permissionsPolicy: [
    'camera=()',
    'microphone=()',
    'geolocation=()',
    'interest-cohort=()'
  ].join(', '),
  
  // Cross-Origin Embedder Policy
  crossOriginEmbedderPolicy: 'require-corp',
  
  // Cross-Origin Opener Policy
  crossOriginOpenerPolicy: 'same-origin',
  
  // Cross-Origin Resource Policy
  crossOriginResourcePolicy: 'same-origin'
}

/**
 * Development-friendly security headers (less restrictive)
 */
const developmentSecurityHeaders: Required<SecurityHeadersOptions> = {
  ...defaultSecurityHeaders,
  // More permissive CSP for development
  contentSecurityPolicy: [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' ws: wss:", // Allow WebSocket for hot reload
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; '),
  
  // Less strict HSTS for development
  strictTransportSecurity: 'max-age=0',
  
  // More permissive COEP for development
  crossOriginEmbedderPolicy: 'unsafe-none'
}

/**
 * Apply security headers to a response
 */
export function applySecurityHeaders(
  response: NextResponse,
  options: SecurityHeadersOptions = {}
): NextResponse {
  if (!env.SECURITY_HEADERS_ENABLED || !response) {
    return response
  }

  // Choose appropriate headers based on environment
  const headers = env.isDevelopment ? developmentSecurityHeaders : defaultSecurityHeaders
  
  // Merge with custom options
  const finalHeaders = { ...headers, ...options }

  // Apply headers
  if (response.headers) {
    response.headers.set('Content-Security-Policy', finalHeaders.contentSecurityPolicy)
    response.headers.set('Strict-Transport-Security', finalHeaders.strictTransportSecurity)
    response.headers.set('X-Frame-Options', finalHeaders.xFrameOptions)
    response.headers.set('X-Content-Type-Options', finalHeaders.xContentTypeOptions)
    response.headers.set('Referrer-Policy', finalHeaders.referrerPolicy)
    response.headers.set('Permissions-Policy', finalHeaders.permissionsPolicy)
    response.headers.set('Cross-Origin-Embedder-Policy', finalHeaders.crossOriginEmbedderPolicy)
    response.headers.set('Cross-Origin-Opener-Policy', finalHeaders.crossOriginOpenerPolicy)
    response.headers.set('Cross-Origin-Resource-Policy', finalHeaders.crossOriginResourcePolicy)

    // Additional security headers
    response.headers.set('X-DNS-Prefetch-Control', 'off')
    response.headers.set('X-Download-Options', 'noopen')
    response.headers.set('X-Permitted-Cross-Domain-Policies', 'none')

    // Remove potentially sensitive headers
    response.headers.delete('X-Powered-By')
    response.headers.delete('Server')
  }

  return response
}

/**
 * Create a response with security headers
 */
export function createSecureResponse(
  body?: BodyInit | null,
  init?: ResponseInit,
  securityOptions?: SecurityHeadersOptions
): NextResponse {
  const response = new NextResponse(body, init)
  return applySecurityHeaders(response, securityOptions)
}

/**
 * Middleware wrapper that applies security headers
 */
export function withSecurityHeaders(
  handler: () => NextResponse | Promise<NextResponse>,
  options: SecurityHeadersOptions = {}
) {
  return async (): Promise<NextResponse> => {
    const response = await handler()
    return applySecurityHeaders(response, options)
  }
}

/**
 * Input validation utilities
 */
export class InputValidator {
  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    if (!email || typeof email !== 'string') {
      return false
    }
    
    // Basic email regex - more permissive than RFC 5322 but practical
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    
    // Additional checks
    return (
      emailRegex.test(email) &&
      email.length <= 254 && // RFC 5321 limit
      email.indexOf('..') === -1 && // No consecutive dots
      !email.startsWith('.') &&
      !email.endsWith('.')
    )
  }

  /**
   * Validate password strength
   */
  static isValidPassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = []
    
    if (!password || typeof password !== 'string') {
      errors.push('Password is required')
      return { valid: false, errors }
    }
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long')
    }
    
    if (password.length > 128) {
      errors.push('Password must be less than 128 characters long')
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter')
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter')
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number')
    }
    
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character')
    }
    
    return { valid: errors.length === 0, errors }
  }

  /**
   * Sanitize string input
   */
  static sanitizeString(input: string, maxLength: number = 1000): string {
    if (!input || typeof input !== 'string') {
      return ''
    }

    return input
      .trim()
      .slice(0, maxLength)
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/[<>]/g, '') // Remove remaining angle brackets
  }

  /**
   * Validate and sanitize request body
   */
  static validateRequestBody(body: unknown, requiredFields: string[]): { valid: boolean; errors: string[]; sanitized: Record<string, unknown> } {
    const errors: string[] = []
    const sanitized: Record<string, unknown> = {}

    if (!body || typeof body !== 'object') {
      errors.push('Request body must be a valid JSON object')
      return { valid: false, errors, sanitized }
    }

    const bodyObj = body as Record<string, unknown>
    
    // Check required fields
    for (const field of requiredFields) {
      if (!bodyObj[field]) {
        errors.push(`Field '${field}' is required`)
      } else {
        sanitized[field] = typeof bodyObj[field] === 'string'
          ? this.sanitizeString(bodyObj[field] as string)
          : bodyObj[field]
      }
    }
    
    return { valid: errors.length === 0, errors, sanitized }
  }
}
