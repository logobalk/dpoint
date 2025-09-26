import { NextRequest } from 'next/server'
import {
  redirectToLogin,
  redirectToDashboard,
} from '@/lib/auth'
import { isAuthenticated } from '@/lib/middleware/auth-middleware'
import { createSecureToken, verifySecureToken, SecureSessionPayload } from '@/lib/security'

describe('Secure Authentication Utilities Integration Tests', () => {
  describe('isAuthenticated', () => {
    it('should return true for valid secure session token', async () => {
      const sessionPayload: SecureSessionPayload = {
        userId: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
        roleId: 'role_user',
        permissions: ['VIEW_PROFILE'],
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

      const request = new NextRequest('http://localhost:3000/dashboard', {
        method: 'GET',
        headers: {
          Cookie: `session=${token}`,
          'User-Agent': 'test-agent',
          'X-Forwarded-For': '127.0.0.1',
        },
      })

      const result = await isAuthenticated(request)
      expect(result).toBe(true)
    })

    it('should return false for missing session token', async () => {
      const request = new NextRequest('http://localhost:3000/dashboard', {
        method: 'GET',
      })

      const result = await isAuthenticated(request)
      expect(result).toBe(false)
    })

    it('should return false for invalid session token', async () => {
      const request = new NextRequest('http://localhost:3000/dashboard', {
        method: 'GET',
        headers: {
          Cookie: 'session=invalid-token',
        },
      })

      const result = await isAuthenticated(request)
      expect(result).toBe(false)
    })

    it('should return false for expired session token', async () => {
      const sessionPayload: SecureSessionPayload = {
        userId: '1',
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

      const request = new NextRequest('http://localhost:3000/dashboard', {
        method: 'GET',
        headers: {
          Cookie: `session=${token}`,
          'User-Agent': 'test-agent',
          'X-Forwarded-For': '127.0.0.1',
        },
      })

      const result = await isAuthenticated(request)
      expect(result).toBe(false)
    })

    it('should return false for IP address mismatch', async () => {
      const sessionPayload: SecureSessionPayload = {
        userId: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
        roleId: 'role_user',
        permissions: ['VIEW_PROFILE'],
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        ipAddress: '192.168.1.1', // Different IP
        userAgent: 'test-agent',
        sessionId: 'test-session-id',
        csrfToken: 'test-csrf-token',
        createdAt: new Date(),
        lastActivity: new Date(),
        loginMethod: 'password',
      }
      const token = await createSecureToken(sessionPayload)

      const request = new NextRequest('http://localhost:3000/dashboard', {
        method: 'GET',
        headers: {
          Cookie: `session=${token}`,
          'User-Agent': 'test-agent',
          'X-Forwarded-For': '127.0.0.1', // Different IP
        },
      })

      const result = await isAuthenticated(request)
      expect(result).toBe(false)
    })

    it('should handle multiple cookies with session', async () => {
      const sessionPayload: SecureSessionPayload = {
        userId: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
        roleId: 'role_user',
        permissions: ['VIEW_PROFILE'],
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

      const request = new NextRequest('http://localhost:3000/dashboard', {
        method: 'GET',
        headers: {
          Cookie: `other=value; session=${token}; another=value`,
          'User-Agent': 'test-agent',
          'X-Forwarded-For': '127.0.0.1',
        },
      })

      const result = await isAuthenticated(request)
      expect(result).toBe(true)
    })
  })

  describe('redirectToLogin', () => {
    it('should create redirect response to login page', () => {
      const request = new NextRequest('http://localhost:3000/dashboard')
      const response = redirectToLogin(request)

      expect(response.status).toBe(307)
      expect(response.headers.get('Location')).toBe('http://localhost:3000/login?from=%2Fdashboard')
    })

    it('should preserve query parameters in from parameter', () => {
      const request = new NextRequest('http://localhost:3000/dashboard?tab=settings&id=123')
      const response = redirectToLogin(request)

      expect(response.status).toBe(307)
      expect(response.headers.get('Location')).toBe('http://localhost:3000/login?from=%2Fdashboard%3Ftab%3Dsettings%26id%3D123')
    })

    it('should handle root path', () => {
      const request = new NextRequest('http://localhost:3000/')
      const response = redirectToLogin(request)

      expect(response.status).toBe(307)
      expect(response.headers.get('Location')).toBe('http://localhost:3000/login?from=%2F')
    })
  })

  describe('redirectToDashboard', () => {
    it('should create redirect response to dashboard', () => {
      const response = redirectToDashboard()

      expect(response.status).toBe(307)
      expect(response.headers.get('Location')).toBe('http://localhost:3000/dashboard')
    })
  })

  describe('Secure Token Operations', () => {
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
  })
})
