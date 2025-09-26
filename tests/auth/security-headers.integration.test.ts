/**
 * Security headers integration tests
 * Tests the security headers functionality across API endpoints
 */

import { NextRequest } from 'next/server'
import { POST as loginPOST } from '@/app/api/auth/login/route'
import { GET as meGET } from '@/app/api/auth/me/route'
import { POST as logoutPOST } from '@/app/api/auth/logout/route'
import { InputValidator } from '@/lib/security-headers'

// Mock the environment variables for testing
jest.mock('@/lib/env', () => ({
  env: {
    JWT_SECRET: 'test-secret-key-at-least-32-characters-long',
    NODE_ENV: 'test',
    RATE_LIMIT_MAX_REQUESTS: 5,
    RATE_LIMIT_WINDOW_MS: 60000,
    RATE_LIMIT_SKIP_SUCCESSFUL_REQUESTS: true,
    SECURITY_HEADERS_ENABLED: true,
    isProduction: false,
    isDevelopment: false
  }
}))

describe('Security Headers Integration Tests', () => {
  describe('API Endpoints Security Headers', () => {
    it('should apply security headers to login endpoint responses', async () => {
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
      
      // Check essential security headers
      expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff')
      expect(response.headers.get('X-Frame-Options')).toBe('DENY')
      expect(response.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin')
      expect(response.headers.get('X-DNS-Prefetch-Control')).toBe('off')
      expect(response.headers.get('X-Download-Options')).toBe('noopen')
      expect(response.headers.get('X-Permitted-Cross-Domain-Policies')).toBe('none')
      
      // Check that sensitive headers are removed
      expect(response.headers.get('X-Powered-By')).toBeNull()
      expect(response.headers.get('Server')).toBeNull()
      
      // Check CSP header exists
      expect(response.headers.get('Content-Security-Policy')).toBeTruthy()
    })

    it('should apply security headers to me endpoint responses', async () => {
      // Suppress console.error for this test since we expect an error (cookies outside request scope)
      const originalConsoleError = console.error
      console.error = jest.fn()

      const response = await meGET()

      // Check security headers are present
      expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff')
      expect(response.headers.get('X-Frame-Options')).toBe('DENY')
      expect(response.headers.get('Content-Security-Policy')).toBeTruthy()

      // Restore console.error
      console.error = originalConsoleError
    })

    it('should apply security headers to logout endpoint responses', async () => {
      // Suppress console.error for this test since we expect an error (cookies outside request scope)
      const originalConsoleError = console.error
      console.error = jest.fn()

      const response = await logoutPOST()

      // Check security headers are present
      expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff')
      expect(response.headers.get('X-Frame-Options')).toBe('DENY')
      expect(response.headers.get('Content-Security-Policy')).toBeTruthy()

      // Restore console.error
      console.error = originalConsoleError
    })

    it('should include CORS headers appropriately', async () => {
      // Suppress console.error for this test since we expect an error (cookies outside request scope)
      const originalConsoleError = console.error
      console.error = jest.fn()

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

      // Check CORS-related headers
      expect(response.headers.get('Cross-Origin-Embedder-Policy')).toBeTruthy()
      expect(response.headers.get('Cross-Origin-Opener-Policy')).toBeTruthy()
      expect(response.headers.get('Cross-Origin-Resource-Policy')).toBeTruthy()

      // Restore console.error
      console.error = originalConsoleError
    })
  })

  describe('Input Validation', () => {
    describe('Email Validation', () => {
      it('should validate correct email formats', () => {
        expect(InputValidator.isValidEmail('test@example.com')).toBe(true)
        expect(InputValidator.isValidEmail('user.name@domain.co.uk')).toBe(true)
        expect(InputValidator.isValidEmail('user+tag@example.org')).toBe(true)
      })

      it('should reject invalid email formats', () => {
        expect(InputValidator.isValidEmail('')).toBe(false)
        expect(InputValidator.isValidEmail('invalid')).toBe(false)
        expect(InputValidator.isValidEmail('invalid@')).toBe(false)
        expect(InputValidator.isValidEmail('@invalid.com')).toBe(false)
        expect(InputValidator.isValidEmail('invalid..email@example.com')).toBe(false)
        expect(InputValidator.isValidEmail('.invalid@example.com')).toBe(false)
        expect(InputValidator.isValidEmail('invalid@example.com.')).toBe(false)
      })

      it('should handle edge cases', () => {
        expect(InputValidator.isValidEmail(null as unknown as string)).toBe(false)
        expect(InputValidator.isValidEmail(undefined as unknown as string)).toBe(false)
        expect(InputValidator.isValidEmail(123 as unknown as string)).toBe(false)
        
        // Very long email (over RFC limit)
        const longEmail = 'a'.repeat(250) + '@example.com'
        expect(InputValidator.isValidEmail(longEmail)).toBe(false)
      })
    })

    describe('Password Validation', () => {
      it('should validate strong passwords', () => {
        const result = InputValidator.isValidPassword('StrongPass123!')
        expect(result.valid).toBe(true)
        expect(result.errors).toHaveLength(0)
      })

      it('should reject weak passwords', () => {
        const result = InputValidator.isValidPassword('weak')
        expect(result.valid).toBe(false)
        expect(result.errors).toContain('Password must be at least 8 characters long')
        expect(result.errors).toContain('Password must contain at least one uppercase letter')
        expect(result.errors).toContain('Password must contain at least one number')
        expect(result.errors).toContain('Password must contain at least one special character')
      })

      it('should handle missing password requirements', () => {
        const testCases = [
          { password: 'nouppercase123!', missing: 'uppercase letter' },
          { password: 'NOLOWERCASE123!', missing: 'lowercase letter' },
          { password: 'NoNumbers!', missing: 'number' },
          { password: 'NoSpecialChars123', missing: 'special character' }
        ]

        testCases.forEach(({ password, missing }) => {
          const result = InputValidator.isValidPassword(password)
          expect(result.valid).toBe(false)
          expect(result.errors.some(error => error.includes(missing))).toBe(true)
        })
      })

      it('should reject overly long passwords', () => {
        const longPassword = 'A'.repeat(130) + 'a1!'
        const result = InputValidator.isValidPassword(longPassword)
        expect(result.valid).toBe(false)
        expect(result.errors).toContain('Password must be less than 128 characters long')
      })

      it('should handle edge cases', () => {
        expect(InputValidator.isValidPassword(null as unknown as string).valid).toBe(false)
        expect(InputValidator.isValidPassword(undefined as unknown as string).valid).toBe(false)
        expect(InputValidator.isValidPassword('').valid).toBe(false)
      })
    })

    describe('String Sanitization', () => {
      it('should sanitize strings properly', () => {
        expect(InputValidator.sanitizeString('  test  ')).toBe('test')
        expect(InputValidator.sanitizeString('test<script>alert("xss")</script>')).toBe('testalert("xss")')
        expect(InputValidator.sanitizeString('test>malicious')).toBe('testmalicious')
      })

      it('should respect max length', () => {
        const longString = 'a'.repeat(1500)
        const sanitized = InputValidator.sanitizeString(longString, 100)
        expect(sanitized.length).toBe(100)
      })

      it('should handle edge cases', () => {
        expect(InputValidator.sanitizeString(null as unknown as string)).toBe('')
        expect(InputValidator.sanitizeString(undefined as unknown as string)).toBe('')
        expect(InputValidator.sanitizeString(123 as unknown as string)).toBe('')
      })
    })

    describe('Request Body Validation', () => {
      it('should validate valid request bodies', () => {
        const body = { email: 'test@example.com', password: 'password123' }
        const result = InputValidator.validateRequestBody(body, ['email', 'password'])
        
        expect(result.valid).toBe(true)
        expect(result.errors).toHaveLength(0)
        expect(result.sanitized.email).toBe('test@example.com')
        expect(result.sanitized.password).toBe('password123')
      })

      it('should reject invalid request bodies', () => {
        const result = InputValidator.validateRequestBody(null, ['email'])
        expect(result.valid).toBe(false)
        expect(result.errors).toContain('Request body must be a valid JSON object')
      })

      it('should identify missing required fields', () => {
        const body = { email: 'test@example.com' }
        const result = InputValidator.validateRequestBody(body, ['email', 'password'])
        
        expect(result.valid).toBe(false)
        expect(result.errors).toContain("Field 'password' is required")
      })

      it('should sanitize string fields', () => {
        const body = { 
          email: '  test@example.com  ', 
          name: 'John<script>alert("xss")</script>Doe' 
        }
        const result = InputValidator.validateRequestBody(body, ['email', 'name'])
        
        expect(result.valid).toBe(true)
        expect(result.sanitized.email).toBe('test@example.com')
        expect(result.sanitized.name).toBe('Johnalert("xss")Doe')
      })
    })
  })

  describe('Enhanced Login Validation', () => {
    it('should reject requests with invalid email format', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'invalid-email',
          password: 'password123'
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await loginPOST(request)
      expect(response.status).toBe(400)
      
      const data = await response.json()
      expect(data.error).toBe('Invalid email format')
    })

    it('should reject requests with missing fields', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com'
          // missing password
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await loginPOST(request)
      expect(response.status).toBe(400)
      
      const data = await response.json()
      expect(data.error).toBe('Invalid input')
      expect(data.details).toContain("Field 'password' is required")
    })

    it('should sanitize input fields', async () => {
      // Suppress console.error for this test since we expect an error (cookies outside request scope)
      const originalConsoleError = console.error
      console.error = jest.fn()

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: '  test@example.com  ',
          password: 'password123'
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await loginPOST(request)
      // Should process the sanitized email (trimmed)
      expect(response.status).toBe(401) // Authentication will fail, but input was processed

      // Restore console.error
      console.error = originalConsoleError
    })
  })
})
