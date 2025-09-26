import { NextRequest } from 'next/server'
import { middleware } from '../../middleware'
import { createSecureSessionWithCookie, User } from '@/lib/auth'
import { createSecureToken, SecureSessionPayload } from '@/lib/security/session-security'

// Mock NextResponse.redirect and next
const mockRedirect = jest.fn()
const mockNext = jest.fn()

jest.mock('next/server', () => {
  const actual = jest.requireActual('next/server')
  return {
    ...actual,
    NextResponse: {
      ...actual.NextResponse,
      redirect: jest.fn((url) => {
        mockRedirect(url)
        return {
          type: 'redirect',
          url,
          headers: new Headers(),
          status: 302,
        }
      }),
      next: jest.fn(() => {
        mockNext()
        return {
          type: 'next',
          headers: new Headers(),
          status: 200,
        }
      }),
    },
  }
})

// Mock cookies
const mockCookies = {
  get: jest.fn(),
  set: jest.fn(),
  delete: jest.fn(),
}

jest.mock('next/headers', () => ({
  cookies: () => mockCookies,
}))

// Mock security headers
jest.mock('@/lib/security-headers', () => ({
  applySecurityHeaders: jest.fn((response) => response),
}))

// Helper function to create secure session for testing
async function createSecureSessionForTest(user: User, request: NextRequest): Promise<void> {
  await createSecureSessionWithCookie(user, request)

  // Mock the cookie retrieval for the test
  const setSessionCall = mockCookies.set.mock.calls.find(call => call[0] === 'session')
  if (setSessionCall) {
    const sessionToken = setSessionCall[1]
    mockCookies.get.mockReturnValue({ value: sessionToken })
  }
}

describe('Middleware Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockRedirect.mockClear()
    mockNext.mockClear()
  })

  describe('Protected Routes', () => {
    it('should redirect unauthenticated users from dashboard to login', async () => {
      const request = new NextRequest('http://localhost:3000/dashboard', {
        method: 'GET',
      })

      await middleware(request)

      expect(mockRedirect).toHaveBeenCalledWith(
        expect.objectContaining({
          pathname: '/login',
          searchParams: expect.objectContaining({
            get: expect.any(Function),
          }),
        })
      )
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('should allow authenticated users to access dashboard', async () => {
      // Create a test user
      const testUser: User = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
        roleId: 'role_user_001',
      }

      const request = new NextRequest('http://localhost:3000/dashboard', {
        method: 'GET',
        headers: {
          'User-Agent': 'test-agent',
          'X-Forwarded-For': '127.0.0.1',
        },
      })

      // Create secure session
      await createSecureSessionForTest(testUser, request)

      const response = await middleware(request)

      // Check that the response allows the request to continue (not a redirect)
      expect(response).toBeDefined()
      expect(response.status).not.toBe(302) // Not a redirect
      expect(mockNext).toHaveBeenCalled()
      expect(mockRedirect).not.toHaveBeenCalled()
    })

    it('should redirect unauthenticated users from nested dashboard routes', async () => {
      const request = new NextRequest('http://localhost:3000/dashboard/profile', {
        method: 'GET',
      })

      await middleware(request)

      expect(mockRedirect).toHaveBeenCalledWith(
        expect.objectContaining({
          pathname: '/login',
          searchParams: expect.objectContaining({
            get: expect.any(Function),
          }),
        })
      )
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('should allow authenticated users to access nested dashboard routes', async () => {
      // Create a test user
      const testUser: User = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
        roleId: 'role_user_001',
      }

      const request = new NextRequest('http://localhost:3000/dashboard/settings', {
        method: 'GET',
        headers: {
          'User-Agent': 'test-agent',
          'X-Forwarded-For': '127.0.0.1',
        },
      })

      // Create secure session
      await createSecureSessionForTest(testUser, request)

      const response = await middleware(request)

      // Check that the response allows the request to continue (not a redirect)
      expect(response).toBeDefined()
      expect(response.status).not.toBe(302) // Not a redirect
      expect(mockNext).toHaveBeenCalled()
      expect(mockRedirect).not.toHaveBeenCalled()
    })
  })

  describe('Auth Routes', () => {
    it('should redirect authenticated users from login to dashboard', async () => {
      // Create a test user
      const testUser: User = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
        roleId: 'role_user_001',
      }

      const request = new NextRequest('http://localhost:3000/login', {
        method: 'GET',
        headers: {
          'User-Agent': 'test-agent',
          'X-Forwarded-For': '127.0.0.1',
        },
      })

      // Create secure session
      await createSecureSessionForTest(testUser, request)

      const response = await middleware(request)

      // Check that the response is a redirect to dashboard
      expect(response).toBeDefined()
      expect(response.status).toBe(302) // Redirect status
      expect(mockRedirect).toHaveBeenCalledWith(
        expect.objectContaining({
          pathname: '/dashboard',
        })
      )
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('should allow unauthenticated users to access login', async () => {
      const request = new NextRequest('http://localhost:3000/login', {
        method: 'GET',
      })

      await middleware(request)

      expect(mockNext).toHaveBeenCalled()
      expect(mockRedirect).not.toHaveBeenCalled()
    })
  })

  describe('Public Routes', () => {
    it('should allow access to home page without authentication', async () => {
      const request = new NextRequest('http://localhost:3000/', {
        method: 'GET',
      })

      await middleware(request)

      expect(mockNext).toHaveBeenCalled()
      expect(mockRedirect).not.toHaveBeenCalled()
    })

    it('should allow access to API routes without middleware interference', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
      })

      await middleware(request)

      expect(mockNext).toHaveBeenCalled()
      expect(mockRedirect).not.toHaveBeenCalled()
    })

    it('should allow access to static assets', async () => {
      const request = new NextRequest('http://localhost:3000/logo.png', {
        method: 'GET',
      })

      await middleware(request)

      expect(mockNext).toHaveBeenCalled()
      expect(mockRedirect).not.toHaveBeenCalled()
    })
  })

  describe('Invalid Token Scenarios', () => {
    it('should redirect users with invalid tokens from protected routes', async () => {
      const request = new NextRequest('http://localhost:3000/dashboard', {
        method: 'GET',
        headers: {
          Cookie: 'session=invalid-token',
        },
      })

      await middleware(request)

      expect(mockRedirect).toHaveBeenCalledWith(
        expect.objectContaining({
          pathname: '/login',
        })
      )
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('should redirect users with expired tokens from protected routes', async () => {
      const sessionPayload: SecureSessionPayload = {
        userId: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
        roleId: 'role_user_001',
        permissions: ['USER_READ', 'USER_WRITE'],
        expiresAt: new Date(Date.now() - 1000), // Expired
        ipAddress: '127.0.0.1',
        userAgent: 'test-agent',
        sessionId: 'test-session-id',
        csrfToken: 'test-csrf-token',
        createdAt: new Date(Date.now() - 60000),
        lastActivity: new Date(Date.now() - 1000),
        loginMethod: 'password',
      }
      const token = await createSecureToken(sessionPayload)

      const request = new NextRequest('http://localhost:3000/dashboard', {
        method: 'GET',
        headers: {
          Cookie: `session=${token}`,
          'User-Agent': 'test-agent',
          'X-Forwarded-For': '127.0.0.1',
        },
      })

      await middleware(request)

      expect(mockRedirect).toHaveBeenCalledWith(
        expect.objectContaining({
          pathname: '/login',
        })
      )
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('should allow users with invalid tokens to access login page', async () => {
      const request = new NextRequest('http://localhost:3000/login', {
        method: 'GET',
        headers: {
          Cookie: 'session=invalid-token',
        },
      })

      await middleware(request)

      expect(mockNext).toHaveBeenCalled()
      expect(mockRedirect).not.toHaveBeenCalled()
    })
  })

  describe('Query Parameters', () => {
    it('should preserve query parameters when redirecting to login', async () => {
      const request = new NextRequest('http://localhost:3000/dashboard?tab=settings', {
        method: 'GET',
      })

      await middleware(request)

      expect(mockRedirect).toHaveBeenCalledWith(
        expect.objectContaining({
          pathname: '/login',
          searchParams: expect.objectContaining({
            get: expect.any(Function),
          }),
        })
      )
    })
  })
})
