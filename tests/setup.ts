import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util'
import 'whatwg-fetch'
import path from 'path'

// Set up environment variables for testing
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only-at-least-32-characters-long'
process.env.NEXT_PUBLIC_BASE_URL = 'http://localhost:3000'
process.env.USER_DATA_FILE = path.join(__dirname, 'test-users.json')

// Add Web API polyfills for Node.js environment
global.TextEncoder = TextEncoder as typeof global.TextEncoder
global.TextDecoder = TextDecoder as typeof global.TextDecoder

// Global test utilities
declare global {
  var createMockRequest: (url: string, options?: RequestInit) => Request
}

globalThis.createMockRequest = (url: string, options: RequestInit = {}) => {
  return new Request(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })
}

// Suppress security event warnings during tests
const originalConsoleWarn = console.warn
console.warn = (...args: unknown[]) => {
  // Suppress security event logs during tests
  if (args[0] === 'Security Event:') {
    return
  }
  // Allow other warnings through
  originalConsoleWarn.apply(console, args)
}


