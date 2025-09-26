/**
 * Rate limiting utilities for API endpoints
 * Provides configurable rate limiting to prevent brute force attacks
 */

import { NextRequest, NextResponse } from 'next/server'
import { env } from './env'

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

// In-memory store for rate limiting
// In production, consider using Redis or a database
const rateLimitStore: RateLimitStore = {}

interface RateLimitOptions {
  maxRequests?: number
  windowMs?: number
  skipSuccessfulRequests?: boolean
  keyGenerator?: (request: NextRequest) => string
  onLimitReached?: () => NextResponse
}

interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  resetTime: number
  response?: NextResponse
}

/**
 * Default key generator - uses IP address
 */
function defaultKeyGenerator(request: NextRequest): string {
  // Try to get real IP from headers (for proxies/load balancers)
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const cfConnectingIp = request.headers.get('cf-connecting-ip')

  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  if (realIp) {
    return realIp
  }

  if (cfConnectingIp) {
    return cfConnectingIp
  }

  // Fallback to a default identifier
  return 'unknown'
}

/**
 * Default response when rate limit is exceeded
 */
function defaultLimitResponse(): NextResponse {
  return NextResponse.json(
    {
      error: 'Too many requests',
      message: 'Rate limit exceeded. Please try again later.',
      retryAfter: Math.ceil(env.RATE_LIMIT_WINDOW_MS / 1000)
    },
    { 
      status: 429,
      headers: {
        'Retry-After': Math.ceil(env.RATE_LIMIT_WINDOW_MS / 1000).toString(),
        'X-RateLimit-Limit': env.RATE_LIMIT_MAX_REQUESTS.toString(),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': new Date(Date.now() + env.RATE_LIMIT_WINDOW_MS).toISOString()
      }
    }
  )
}

/**
 * Clean up expired entries from the rate limit store
 */
function cleanupExpiredEntries(): void {
  const now = Date.now()
  
  for (const key in rateLimitStore) {
    if (rateLimitStore[key].resetTime <= now) {
      delete rateLimitStore[key]
    }
  }
}

/**
 * Check if a request should be rate limited
 */
export function checkRateLimit(
  request: NextRequest,
  options: RateLimitOptions = {}
): RateLimitResult {
  const {
    maxRequests = env.RATE_LIMIT_MAX_REQUESTS,
    windowMs = env.RATE_LIMIT_WINDOW_MS,
    keyGenerator = defaultKeyGenerator,
    onLimitReached = defaultLimitResponse
  } = options

  // Clean up expired entries periodically
  if (Math.random() < 0.1) { // 10% chance to cleanup
    cleanupExpiredEntries()
  }

  const key = keyGenerator(request)
  const now = Date.now()
  const resetTime = now + windowMs

  // Get or create rate limit entry
  let entry = rateLimitStore[key]
  
  if (!entry || entry.resetTime <= now) {
    // Create new entry or reset expired entry
    entry = {
      count: 0,
      resetTime
    }
    rateLimitStore[key] = entry
  }

  // Check if limit is exceeded
  if (entry.count >= maxRequests) {
    return {
      success: false,
      limit: maxRequests,
      remaining: 0,
      resetTime: entry.resetTime,
      response: onLimitReached()
    }
  }

  // Increment counter
  entry.count++

  return {
    success: true,
    limit: maxRequests,
    remaining: Math.max(0, maxRequests - entry.count),
    resetTime: entry.resetTime
  }
}

/**
 * Middleware wrapper for rate limiting
 */
export function withRateLimit(
  handler: (request: NextRequest) => Promise<NextResponse>,
  options: RateLimitOptions = {}
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const rateLimitResult = checkRateLimit(request, options)
    
    if (!rateLimitResult.success) {
      return rateLimitResult.response!
    }

    // Execute the handler
    const response = await handler(request)
    
    // If skipSuccessfulRequests is enabled and the request was successful,
    // decrement the counter
    if (options.skipSuccessfulRequests !== false && 
        env.RATE_LIMIT_SKIP_SUCCESSFUL_REQUESTS && 
        response.status < 400) {
      const key = (options.keyGenerator || defaultKeyGenerator)(request)
      const entry = rateLimitStore[key]
      if (entry) {
        entry.count = Math.max(0, entry.count - 1)
      }
    }

    // Add rate limit headers to response
    response.headers.set('X-RateLimit-Limit', rateLimitResult.limit.toString())
    response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString())
    response.headers.set('X-RateLimit-Reset', new Date(rateLimitResult.resetTime).toISOString())

    return response
  }
}

/**
 * Reset rate limit for a specific key (useful for testing)
 */
export function resetRateLimit(key: string): void {
  delete rateLimitStore[key]
}

/**
 * Clear all rate limit entries (useful for testing)
 */
export function clearRateLimitStore(): void {
  for (const key in rateLimitStore) {
    delete rateLimitStore[key]
  }
}

/**
 * Get current rate limit status for a key
 */
export function getRateLimitStatus(key: string): { count: number; resetTime: number } | null {
  const entry = rateLimitStore[key]
  if (!entry || entry.resetTime <= Date.now()) {
    return null
  }
  return { count: entry.count, resetTime: entry.resetTime }
}
