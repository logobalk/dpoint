// Mock CSRF validation BEFORE importing any modules
jest.mock('@/lib/security/csrf-protection', () => ({
  ...jest.requireActual('@/lib/security/csrf-protection'),
  validateCSRFForRequest: jest.fn().mockResolvedValue({ valid: true }),
}))

import { NextRequest } from 'next/server'
import { POST as loginPOST } from '@/app/api/auth/login/route'
import { GET as meGET } from '@/app/api/auth/me/route'
import { POST as logoutPOST } from '@/app/api/auth/logout/route'
import { authenticate, createSecureSessionWithCookie, deleteSecureSession } from '@/lib/auth'
import { createSecureSession } from '@/lib/security'
import { getSecureSession } from '@/lib/middleware/auth-middleware'
import { clearEnvCache } from '@/lib/env'

// Mock Next.js cookies
const mockCookies = {
  set: jest.fn(),
  get: jest.fn(),
  delete: jest.fn(),
}

jest.mock('next/headers', () => ({
  cookies: jest.fn(() => Promise.resolve(mockCookies)),
}))

// Mock console.error to avoid noise in tests
const originalConsoleError = console.error
beforeAll(() => {
  console.error = jest.fn()
})

afterAll(() => {
  console.error = originalConsoleError
})

describe('Authentication Flow Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockCookies.set.mockClear()
    mockCookies.get.mockClear()
    mockCookies.delete.mockClear()
  })

  describe('Complete Authentication Flow', () => {
    it('should complete full login -> check session -> logout flow', async () => {
      // Step 1: Login
      const loginRequest = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'hello'
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const loginResponse = await loginPOST(loginRequest)
      const loginData = await loginResponse.json()

      expect(loginResponse.status).toBe(200)
      expect(loginData.success).toBe(true)
      expect(loginData.user.email).toBe('test@example.com')
      expect(mockCookies.set).toHaveBeenCalledWith(
        'session',
        expect.any(String),
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'strict',
          path: '/',
        })
      )

      // Extract the token that was set
      const setSessionCall = mockCookies.set.mock.calls.find(call => call[0] === 'session')
      const sessionToken = setSessionCall[1]

      // Step 2: Check session with the token
      mockCookies.get.mockReturnValue({ value: sessionToken })

      const meRequest = new NextRequest('http://localhost:3000/api/auth/me')
      const meResponse = await meGET(meRequest)
      const meData = await meResponse.json()

      expect(meResponse.status).toBe(200)
      expect(meData.email).toBe('test@example.com')
      expect(meData.id).toBe('test_user_001')

      // Step 3: Logout (CSRF validation is mocked to always pass)
      const logoutRequest = new NextRequest('http://localhost:3000/api/auth/logout', { method: 'POST' })
      const logoutResponse = await logoutPOST(logoutRequest)
      const logoutData = await logoutResponse.json()

      expect(logoutResponse.status).toBe(200)
      expect(logoutData.success).toBe(true)
      expect(mockCookies.set).toHaveBeenCalledWith('session', '', expect.objectContaining({
        expires: expect.any(Date),
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        path: '/',
      }))
    })

    it('should handle session expiry correctly', async () => {
      // Login first
      const loginRequest = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'hello'
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const loginResponse = await loginPOST(loginRequest)
      expect(loginResponse.status).toBe(200)

      // Simulate expired token by mocking an expired token
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwibmFtZSI6IlRlc3QiLCJyb2xlIjoidXNlciIsImlhdCI6MTYwMDAwMDAwMCwiZXhwIjoxNjAwMDAwMDAxfQ.invalid'
      mockCookies.get.mockReturnValue({ value: expiredToken })

      const meRequest = new NextRequest('http://localhost:3000/api/auth/me')
      const meResponse = await meGET(meRequest)
      const meData = await meResponse.json()

      expect(meResponse.status).toBe(401)
      expect(meData.error).toBe('Authentication required')
    })
  })

  describe('Authentication Helper Functions', () => {
    it('should authenticate valid credentials', async () => {
      const user = await authenticate('test@example.com', 'hello')

      expect(user).not.toBeNull()
      expect(user?.email).toBe('test@example.com')
      expect(user?.name).toBe('Test User')
      expect(user?.role).toBe('user')
      expect(user?.id).toBe('test_user_001')
    })

    it('should reject invalid credentials', async () => {
      const user = await authenticate('test@example.com', 'wrongpassword')
      
      expect(user).toBeNull()
    })

    it('should create and retrieve secure session', async () => {
      const testUser = {
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'admin',
        roleId: 'role_admin'
      }

      const mockRequest = new NextRequest('http://localhost:3000/test', {
        headers: {
          'User-Agent': 'test-agent',
          'X-Forwarded-For': '127.0.0.1',
        },
      })

      // Create secure session
      await createSecureSessionWithCookie(testUser, mockRequest)

      expect(mockCookies.set).toHaveBeenCalledWith(
        'session',
        expect.any(String),
        expect.objectContaining({
          httpOnly: true,
          secure: true, // Always secure
          sameSite: 'strict',
          path: '/',
          expires: expect.any(Date),
        })
      )

      // Mock the cookie retrieval
      const setSessionCall = mockCookies.set.mock.calls.find(call => call[0] === 'session')
      const sessionToken = setSessionCall[1]
      mockCookies.get.mockReturnValue({ value: sessionToken })

      // Retrieve session using secure middleware
      const authResult = await getSecureSession(mockRequest)

      expect(authResult.authenticated).toBe(true)
      expect(authResult.session?.userId).toBe('123')
      expect(authResult.session?.email).toBe('test@example.com')
      expect(authResult.session?.name).toBe('Test User')
      expect(authResult.session?.role).toBe('admin')
    })

    it('should return unauthenticated for non-existent session', async () => {
      mockCookies.get.mockReturnValue(undefined)
      const mockRequest = new NextRequest('http://localhost:3000/test')

      const authResult = await getSecureSession(mockRequest)

      expect(authResult.authenticated).toBe(false)
      expect(authResult.reason).toBe('No session token found')
    })

    it('should delete secure session', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/test')
      await deleteSecureSession(mockRequest)

      expect(mockCookies.set).toHaveBeenCalledWith('session', '', expect.objectContaining({
        expires: expect.any(Date),
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        path: '/',
      }))
    })
  })

  describe('Edge Cases and Error Handling', () => {
    it('should handle multiple login attempts', async () => {
      const createLoginRequest = (email: string) => new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email,
          password: 'hello'
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      // First login
      const response1 = await loginPOST(createLoginRequest('test@example.com'))
      const data1 = await response1.json()

      expect(response1.status).toBe(200)
      expect(data1.user.email).toBe('test@example.com')

      // Second login (should overwrite the first session)
      const response2 = await loginPOST(createLoginRequest('admin@example.com'))
      const data2 = await response2.json()

      expect(response2.status).toBe(200)
      expect(data2.user.email).toBe('admin@example.com')

      // Both should have called set cookie
      expect(mockCookies.set).toHaveBeenCalledTimes(2)
    })

    it('should handle concurrent session checks', async () => {
      // Create a valid session
      const testUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
        roleId: 'role_user'
      }

      const userData = {
        userId: testUser.id,
        email: testUser.email,
        name: testUser.name,
        role: testUser.role,
        roleId: testUser.roleId,
        permissions: ['view_dashboard', 'access_api'],
      }

      const request = new NextRequest('http://localhost:3000/api/auth/me')
      const { token } = await createSecureSession(userData, request, 'password')
      mockCookies.get.mockReturnValue({ value: token })

      // Make multiple concurrent session checks
      const promises = Array(5).fill(null).map(() => meGET(new NextRequest('http://localhost:3000/api/auth/me')))
      const responses = await Promise.all(promises)

      // All should succeed
      for (const response of responses) {
        expect(response.status).toBe(200)
        const data = await response.json()
        expect(data.email).toBe('test@example.com')
      }
    })

    it('should handle malformed session tokens gracefully', async () => {
      mockCookies.get.mockReturnValue({ value: 'malformed.token.here' })

      const request = new NextRequest('http://localhost:3000/api/auth/me')
      const response = await meGET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Authentication required')
    })

    it('should handle empty session tokens', async () => {
      mockCookies.get.mockReturnValue({ value: '' })

      const request = new NextRequest('http://localhost:3000/api/auth/me')
      const response = await meGET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Authentication required')
    })
  })

  describe('Security Tests', () => {
    it('should not expose sensitive information in error responses', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'wrongpassword'
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await loginPOST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Invalid email or password')
      // Should not expose whether email exists or not
      expect(data).not.toHaveProperty('user')
      expect(data).not.toHaveProperty('details')
    })

    it('should set secure cookie flags appropriately', async () => {
      const originalNodeEnv = process.env.NODE_ENV

      // Use Object.defineProperty to override the read-only NODE_ENV
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'production',
        writable: true,
        configurable: true
      })
      clearEnvCache()

      const testUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
        roleId: 'role_user'
      }

      const mockRequest = new NextRequest('http://localhost:3000/test', {
        headers: {
          'User-Agent': 'test-agent',
          'X-Forwarded-For': '127.0.0.1',
        },
      })

      await createSecureSessionWithCookie(testUser, mockRequest)

      expect(mockCookies.set).toHaveBeenCalledWith(
        'session',
        expect.any(String),
        expect.objectContaining({
          httpOnly: true,
          secure: true, // Should be true in production
          sameSite: 'strict',
          path: '/',
        })
      )

      // Restore original NODE_ENV
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: originalNodeEnv,
        writable: true,
        configurable: true
      })
      clearEnvCache()
    })
  })
})
