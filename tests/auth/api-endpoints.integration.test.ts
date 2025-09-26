import { NextRequest } from 'next/server'
import { POST as loginPOST } from '@/app/api/auth/login/route'
import { GET as meGET } from '@/app/api/auth/me/route'
import { POST as logoutPOST } from '@/app/api/auth/logout/route'
import { createSecureSession, createSecureToken, verifySecureToken, SecureSessionPayload } from '@/lib/security'
import { getDataSource } from '@/lib/data/data-source'

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

describe('Authentication Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset cookie mock
    mockCookies.set.mockClear()
    mockCookies.get.mockClear()
    mockCookies.delete.mockClear()

    // Reset data source for each test
    getDataSource().reset()
  })

  describe('POST /api/auth/login', () => {
    it('should successfully login with valid credentials', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'hello'
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await loginPOST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.user).toEqual({
        id: 'test_user_001',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
        roleId: 'role_user',
        permissions: ['view_dashboard', 'access_api'],
      })
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
    })

    it('should reject login with invalid password', async () => {
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
      expect(mockCookies.set).not.toHaveBeenCalled()
    })

    it('should reject login with missing email', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          password: 'hello'
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await loginPOST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid input')
      expect(mockCookies.set).not.toHaveBeenCalled()
    })

    it('should reject login with missing password', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com'
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await loginPOST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid input')
      expect(mockCookies.set).not.toHaveBeenCalled()
    })

    it('should handle malformed JSON request', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: 'invalid json',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await loginPOST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Internal server error')
      expect(mockCookies.set).not.toHaveBeenCalled()
    })
  })

  describe('GET /api/auth/me', () => {
    it('should return user data when authenticated', async () => {
      // Create a valid session token
      const userData = {
        userId: 'test_user_001',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
        roleId: 'role_user',
        permissions: ['view_dashboard', 'access_api'],
      }

      const request = new NextRequest('http://localhost:3000/api/auth/me')
      const { token } = await createSecureSession(userData, request, 'password')

      mockCookies.get.mockReturnValue({ value: token })

      const response = await meGET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({
        id: 'test_user_001',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
        roleId: 'role_user',
        permissions: expect.any(Array),
        sessionInfo: expect.any(Object),
      })
    })

    it('should return 401 when no session cookie', async () => {
      mockCookies.get.mockReturnValue(undefined)

      const request = new NextRequest('http://localhost:3000/api/auth/me')
      const response = await meGET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Authentication required')
    })

    it('should return 401 when session token is invalid', async () => {
      mockCookies.get.mockReturnValue({ value: 'invalid-token' })

      const request = new NextRequest('http://localhost:3000/api/auth/me')
      const response = await meGET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Authentication required')
    })

    it('should return 401 when session token is expired', async () => {
      // Create an expired secure session
      const sessionPayload: SecureSessionPayload = {
        userId: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
        roleId: 'role_user',
        permissions: ['VIEW_PROFILE'],
        expiresAt: new Date(Date.now() - 1000), // Expired 1 second ago
        ipAddress: '127.0.0.1',
        userAgent: 'test-agent',
        sessionId: 'test-session-id',
        csrfToken: 'test-csrf-token',
        createdAt: new Date(Date.now() - 60000),
        lastActivity: new Date(Date.now() - 1000),
        loginMethod: 'password',
      }
      const token = await createSecureToken(sessionPayload)

      mockCookies.get.mockReturnValue({ value: token })

      const request = new NextRequest('http://localhost:3000/api/auth/me')
      const response = await meGET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Authentication required')
    })
  })

  describe('POST /api/auth/logout', () => {
    it('should successfully logout', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/logout', { method: 'POST' })
      const response = await logoutPOST(request)
      const data = await response.json()

      expect(response.status).toBe(401) // Will fail auth since no session
      expect(data.error).toBe('Authentication required')
    })
  })

  describe('Secure JWT Token Operations', () => {
    it('should create and verify valid secure JWT token', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/test', {
        headers: {
          'User-Agent': 'test-agent',
          'X-Forwarded-For': '127.0.0.1',
        },
      })
      const sessionPayload: SecureSessionPayload = {
        userId: '123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'admin',
        roleId: 'role_admin',
        permissions: ['ADMIN_API_ACCESS'],
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        ipAddress: '127.0.0.1',
        userAgent: 'test-agent',
        sessionId: 'test-session-id',
        csrfToken: 'test-csrf-token',
        createdAt: new Date(),
        lastActivity: new Date(),
        loginMethod: 'password',
      }

      const token = await createSecureToken(sessionPayload)
      expect(typeof token).toBe('string')
      expect(token.length).toBeGreaterThan(0)

      const verificationResult = await verifySecureToken(token, mockRequest)
      expect(verificationResult.valid).toBe(true)
      if (verificationResult.session) {
        expect(verificationResult.session.userId).toBe(sessionPayload.userId)
        expect(verificationResult.session.email).toBe(sessionPayload.email)
        expect(verificationResult.session.name).toBe(sessionPayload.name)
        expect(verificationResult.session.role).toBe(sessionPayload.role)
        expect(verificationResult.session.expiresAt).toBeInstanceOf(Date)
      }
    })

    it('should reject invalid secure JWT token', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/test')
      const verificationResult = await verifySecureToken('invalid-token', mockRequest)
      expect(verificationResult.valid).toBe(false)
      expect(verificationResult.reason).toBe('Invalid or expired token')
    })

    it('should reject expired secure JWT token', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/test', {
        headers: {
          'User-Agent': 'test-agent',
          'X-Forwarded-For': '127.0.0.1',
        },
      })
      const sessionPayload: SecureSessionPayload = {
        userId: '123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
        roleId: 'role_user',
        permissions: ['VIEW_PROFILE'],
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
      const verificationResult = await verifySecureToken(token, mockRequest)
      expect(verificationResult.valid).toBe(false)
      expect(verificationResult.reason).toBe('Invalid or expired token')
    })
  })
})
