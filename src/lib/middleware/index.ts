/**
 * Middleware Main Export
 * Centralized exports for authorization and security middleware
 */

// Auth Middleware
export type {
  AuthResult,
  AuthorizationOptions,
  AuthorizationResult,
} from './auth-middleware'

export {
  getSecureSession,
  isAuthenticated,
  requireAuth,
  requirePermissions,
  requireRoles,
  requireAuthorization,
  withAuthorization,
  requireAdmin,
  requireUserManagement,
  userHasPermission,
  userHasAnyPermission,
  userHasAllPermissions,
} from './auth-middleware'