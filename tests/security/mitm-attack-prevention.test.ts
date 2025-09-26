/**
 * MITM Attack Prevention and Session Hijacking Security Tests
 *
 * These tests validate that the system prevents man-in-the-middle attacks
 * and session hijacking scenarios as requested by the user.
 */

import { NextRequest } from 'next/server'
import { validateSessionSecurity, extractClientInfo } from '@/lib/security'
import { Permission, hasPermission } from '@/lib/permissions'
import type { SecureSessionPayload } from '@/lib/security'

// Mock console.error to avoid noise in tests
const originalConsoleError = console.error
beforeAll(() => {
  console.error = jest.fn()
})

afterAll(() => {
  console.error = originalConsoleError
})

describe('MITM Attack Prevention and Session Hijacking Tests', () => {
  let mockRequest: NextRequest

  beforeEach(() => {
    // Create mock request with security headers
    mockRequest = {
      headers: new Headers({
        'user-agent': 'Mozilla/5.0 (Test Browser)',
        'x-forwarded-for': '192.168.1.100',
        'x-csrf-token': 'valid-csrf-token',
      }),
      url: 'https://example.com/api/test',
      method: 'POST',
    } as NextRequest
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Session Security Validation', () => {
    it('should reject session with different IP address (MITM protection)', async () => {
      // Simulate a session created from different IP
      const originalSession: SecureSessionPayload = {
        userId: 'user123',
        email: 'user@example.com',
        name: 'Test User',
        role: 'user' as const,
        roleId: 'user',
        permissions: [],
        ipAddress: '10.0.0.1', // Different IP
        userAgent: 'Mozilla/5.0 (Test Browser)',
        csrfToken: 'valid-csrf-token',
        sessionId: 'sess_123',
        createdAt: new Date(),
        lastActivity: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
        loginMethod: 'password',
      }

      // Test session security validation directly
      const result = await validateSessionSecurity(originalSession, mockRequest)

      expect(result.valid).toBe(false)
      expect(result.reason).toContain('IP address')
    })

    it('should reject session with different user agent (device fingerprinting)', async () => {
      const originalSession: SecureSessionPayload = {
        userId: 'user123',
        email: 'user@example.com',
        name: 'Test User',
        role: 'user' as const,
        roleId: 'user',
        permissions: [],
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Different Browser)', // Different user agent
        csrfToken: 'valid-csrf-token',
        sessionId: 'sess_123',
        createdAt: new Date(),
        lastActivity: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
        loginMethod: 'password',
      }

      const result = await validateSessionSecurity(originalSession, mockRequest)

      expect(result.valid).toBe(false)
      expect(result.reason).toContain('User agent')
    })

    it('should accept valid session with matching security context', async () => {
      const validSession: SecureSessionPayload = {
        userId: 'user123',
        email: 'user@example.com',
        name: 'Test User',
        role: 'user' as const,
        roleId: 'user',
        permissions: [],
        ipAddress: '192.168.1.100', // Matching IP
        userAgent: 'Mozilla/5.0 (Test Browser)', // Matching user agent
        csrfToken: 'valid-csrf-token',
        sessionId: 'sess_123',
        createdAt: new Date(),
        lastActivity: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
        loginMethod: 'password',
      }

      const result = await validateSessionSecurity(validSession, mockRequest)

      // Should return valid session when security context matches
      expect(result.valid).toBe(true)
    })
  })

  describe('Client Information Extraction', () => {
    it('should extract IP address and user agent', () => {
      const requestWithInfo = {
        headers: new Headers({
          'user-agent': 'Mozilla/5.0 (Test Browser)',
          'x-forwarded-for': '192.168.1.100',
        }),
      } as NextRequest

      const clientInfo = extractClientInfo(requestWithInfo)
      expect(clientInfo.ipAddress).toBe('192.168.1.100')
      expect(clientInfo.userAgent).toBe('Mozilla/5.0 (Test Browser)')
    })

    it('should handle missing headers gracefully', () => {
      const requestWithoutHeaders = {
        headers: new Headers({}),
      } as NextRequest

      const clientInfo = extractClientInfo(requestWithoutHeaders)
      expect(clientInfo.ipAddress).toBeDefined()
      expect(clientInfo.userAgent).toBeDefined()
    })

  })

  describe('Permission-Based Access Control', () => {
    it('should prevent admin API access with user permissions', () => {
      // Simulate a normal user trying to access admin functionality
      const userPermissions = [Permission.VIEW_DASHBOARD]
      const adminPermission = Permission.VIEW_USERS

      const hasAdminAccess = hasPermission(userPermissions, adminPermission)

      expect(hasAdminAccess).toBe(false)
    })

    it('should allow admin API access with admin permissions', () => {
      // Simulate an admin user accessing admin functionality
      const adminPermissions = [
        Permission.VIEW_DASHBOARD,
        Permission.VIEW_USERS,
        Permission.ADD_USER,
        Permission.EDIT_USER,
        Permission.REMOVE_USER,
      ]
      const adminPermission = Permission.VIEW_USERS

      const hasAdminAccess = hasPermission(adminPermissions, adminPermission)

      expect(hasAdminAccess).toBe(true)
    })

    it('should validate client information extraction', () => {
      const testRequest = {
        headers: new Headers({
          'user-agent': 'Mozilla/5.0 (Test Browser)',
          'x-forwarded-for': '192.168.1.100',
          'x-csrf-token': 'test-csrf-token',
        }),
      } as NextRequest

      const clientInfo = extractClientInfo(testRequest)

      expect(clientInfo.ipAddress).toBe('192.168.1.100')
      expect(clientInfo.userAgent).toBe('Mozilla/5.0 (Test Browser)')
    })
  })

  describe('Security Context Validation', () => {
    it('should detect IP address changes', async () => {
      const session: SecureSessionPayload = {
        userId: 'user123',
        email: 'user@example.com',
        name: 'Test User',
        role: 'user',
        roleId: 'user',
        permissions: [],
        ipAddress: '10.0.0.1', // Original IP
        userAgent: 'Mozilla/5.0 (Test Browser)',
        csrfToken: 'csrf-token',
        sessionId: 'sess_123',
        createdAt: new Date(),
        lastActivity: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
        loginMethod: 'password',
      }

      const requestFromDifferentIP = {
        headers: new Headers({
          'x-forwarded-for': '203.0.113.1', // Different IP
          'user-agent': 'Mozilla/5.0 (Test Browser)',
        }),
      } as NextRequest

      const result = await validateSessionSecurity(session, requestFromDifferentIP)

      expect(result.valid).toBe(false)
      expect(result.reason).toContain('IP address')
    })

    it('should detect user agent changes', async () => {
      const session: SecureSessionPayload = {
        userId: 'user123',
        email: 'user@example.com',
        name: 'Test User',
        role: 'user',
        roleId: 'user',
        permissions: [],
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Original Browser)', // Original user agent
        csrfToken: 'csrf-token',
        sessionId: 'sess_123',
        createdAt: new Date(),
        lastActivity: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
        loginMethod: 'password',
      }

      const requestFromDifferentBrowser = {
        headers: new Headers({
          'x-forwarded-for': '192.168.1.100',
          'user-agent': 'Mozilla/5.0 (Different Browser)', // Different user agent
        }),
      } as NextRequest

      const result = await validateSessionSecurity(session, requestFromDifferentBrowser)

      expect(result.valid).toBe(false)
      expect(result.reason).toContain('User agent')
    })
  })
})