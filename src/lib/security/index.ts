/**
 * Security Module Main Export
 * Centralized exports for enhanced security features
 */

// Session Security
export type {
  SecureSessionPayload,
  SessionValidationResult,
  SecurityEvent,
} from './session-security'

export {
  SecurityEventType,
  generateSessionId,
  generateCSRFToken,
  extractClientInfo,
  createSecureToken,
  verifySecureToken,
  validateSessionSecurity,
  logSecurityEvent,
  createSecureSession,
  invalidateSession,
  invalidateAllUserSessions,
  getUserActiveSessions,
  getUserSecurityEvents,
  validateCSRFToken,
  cleanupExpiredSessions,
  startSessionCleanup,
  stopSessionCleanup,
} from './session-security'

// CSRF Protection
export type {
  CSRFValidationResult,
} from './csrf-protection'

export {
  extractCSRFToken,
  validateCSRFForRequest,
  addCSRFTokenToResponse,
  createCSRFProtectedResponse,
  withCSRFProtection,
  generateCSRFMetaTags,
  CSRFClientHelper,
} from './csrf-protection'