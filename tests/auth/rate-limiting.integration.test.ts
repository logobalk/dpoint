/**
 * Rate limiting integration tests
 * Tests the rate limiting functionality for authentication endpoints
 */

import { NextRequest } from 'next/server'
import { POST as loginPOST } from '@/app/api/auth/login/route'
import { clearRateLimitStore } from '@/lib/rate-limit'

// Mock cookies for testing
const mockCookies = {
  set: jest.fn(),
  get: jest.fn(),
  delete: jest.fn(),
  has: jest.fn(),
  clear: jest.fn(),
  getAll: jest.fn(),
  toString: jest.fn()
}

jest.mock('next/headers', () => ({
  cookies: () => mockCookies
}))

// Mock the environment variables for testing
jest.mock('@/lib/env', () => ({
  env: {
    JWT_SECRET: 'test-secret-key-at-least-32-characters-long',
    NODE_ENV: 'test',
    RATE_LIMIT_MAX_REQUESTS: 3, // Lower limit for testing
    RATE_LIMIT_WINDOW_MS: 60000, // 1 minute
    RATE_LIMIT_SKIP_SUCCESSFUL_REQUESTS: true,
    SECURITY_HEADERS_ENABLED: true,
    isProduction: false,
    isDevelopment: false
  }
}))

describe('Rate Limiting Integration Tests', () => {
  const testKey = 'test-ip'
  const testCredentials = { email: 'test@example.com', password: 'wrongpassword' }

  // Helper function to create fresh requests
  const createLoginRequest = (body = testCredentials) => new NextRequest('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-forwarded-for': testKey,
    },
    body: JSON.stringify(body),
  })

  beforeEach(() => {
    // Clear rate limit store before each test
    clearRateLimitStore()
    // Reset mocks
    jest.clearAllMocks()
  })

  afterEach(() => {
    // Clean up after each test
    clearRateLimitStore()
  })

  describe('Login Rate Limiting', () => {
    it('should allow requests within the rate limit', async () => {
      const createLoginRequest = () => new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'wrongpassword'
        }),
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': '192.168.1.100' // Consistent IP for testing
        },
      })

      // First request should succeed (but fail authentication)
      const response1 = await loginPOST(createLoginRequest())
      expect(response1.status).toBe(401) // Authentication failed, but not rate limited
      expect(response1.headers.get('X-RateLimit-Limit')).toBe('3')
      expect(response1.headers.get('X-RateLimit-Remaining')).toBe('2')

      // Second request should succeed
      const response2 = await loginPOST(createLoginRequest())
      expect(response2.status).toBe(401)
      expect(response2.headers.get('X-RateLimit-Remaining')).toBe('1')

      // Third request should succeed
      const response3 = await loginPOST(createLoginRequest())
      expect(response3.status).toBe(401)
      expect(response3.headers.get('X-RateLimit-Remaining')).toBe('0')
    })

    it('should block requests that exceed the rate limit', async () => {
      const createLoginRequest = () => new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'wrongpassword'
        }),
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': '192.168.1.101' // Different IP
        },
      })

      // Make 3 requests to reach the limit
      await loginPOST(createLoginRequest())
      await loginPOST(createLoginRequest())
      await loginPOST(createLoginRequest())

      // Fourth request should be rate limited
      const response4 = await loginPOST(createLoginRequest())
      expect(response4.status).toBe(429)
      
      const data = await response4.json()
      expect(data.error).toBe('Too many requests')
      expect(data.message).toBe('Rate limit exceeded. Please try again later.')
      expect(response4.headers.get('Retry-After')).toBeTruthy()
      expect(response4.headers.get('X-RateLimit-Remaining')).toBe('0')
    })

    it('should not count successful requests against the limit when skipSuccessfulRequests is enabled', async () => {
      const createSuccessfulRequest = () => new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'hello' // Valid password from test data
        }),
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': '192.168.1.102'
        },
      })

      const createFailedRequest = () => new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'wrongpassword'
        }),
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': '192.168.1.102' // Same IP
        },
      })

      // Make a successful request - should not count against limit
      const successResponse = await loginPOST(createSuccessfulRequest())
      expect(successResponse.status).toBe(200)

      // Make 3 failed requests - should reach the limit
      await loginPOST(createFailedRequest())
      await loginPOST(createFailedRequest())
      await loginPOST(createFailedRequest())

      // Fourth failed request should be rate limited
      const rateLimitedResponse = await loginPOST(createFailedRequest())
      expect(rateLimitedResponse.status).toBe(429)
    })

    it('should handle different IP addresses separately', async () => {
      const createRequestForIP = (ip: string) => new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'wrongpassword'
        }),
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': ip
        },
      })

      // Make 3 requests from first IP to reach limit
      await loginPOST(createRequestForIP('192.168.1.103'))
      await loginPOST(createRequestForIP('192.168.1.103'))
      await loginPOST(createRequestForIP('192.168.1.103'))

      // Fourth request from first IP should be rate limited
      const response1 = await loginPOST(createRequestForIP('192.168.1.103'))
      expect(response1.status).toBe(429)

      // Request from different IP should not be rate limited
      const response2 = await loginPOST(createRequestForIP('192.168.1.104'))
      expect(response2.status).toBe(401) // Authentication failed, but not rate limited
    })

    it('should include proper rate limit headers', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'wrongpassword'
        }),
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': '192.168.1.105'
        },
      })

      const response = await loginPOST(request)
      
      // Check rate limit headers are present
      expect(response.headers.get('X-RateLimit-Limit')).toBe('3')
      expect(response.headers.get('X-RateLimit-Remaining')).toBe('2')
      expect(response.headers.get('X-RateLimit-Reset')).toBeTruthy()
      
      // Verify reset time is in the future
      const resetTime = new Date(response.headers.get('X-RateLimit-Reset')!)
      expect(resetTime.getTime()).toBeGreaterThan(Date.now())
    })

    it('should handle malformed requests gracefully', async () => {
      // Suppress console.error for this test since we expect an error
      const originalConsoleError = console.error
      console.error = jest.fn()

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: 'invalid json',
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': '192.168.1.106'
        },
      })

      const response = await loginPOST(request)

      // Should still apply rate limiting even for malformed requests
      expect(response.headers.get('X-RateLimit-Limit')).toBeTruthy()
      expect(response.headers.get('X-RateLimit-Remaining')).toBeTruthy()
      expect(response.status).toBe(500) // Internal server error due to malformed JSON

      // Restore console.error
      console.error = originalConsoleError
    })
  })

  describe('Rate Limit Reset', () => {
    it('should reset rate limit after the window expires', async () => {
      // This test would require mocking time or using a very short window
      // For now, we'll test the reset functionality directly

      // Simulate reaching rate limit

      // Make requests to reach limit
      await loginPOST(createLoginRequest())
      await loginPOST(createLoginRequest())
      await loginPOST(createLoginRequest())

      // Should be rate limited
      const rateLimitedResponse = await loginPOST(createLoginRequest())
      expect(rateLimitedResponse.status).toBe(429)

      // Reset the rate limit manually
      clearRateLimitStore()

      // Should now be allowed
      const allowedResponse = await loginPOST(createLoginRequest())
      expect(allowedResponse.status).toBe(401) // Authentication failed, but not rate limited
    })
  })
})
