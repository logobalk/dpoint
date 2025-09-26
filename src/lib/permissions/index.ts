/**
 * Permission System Main Export
 * Centralized exports for the RBAC permission system
 */

// Types
export type {
  PermissionMetadata,
  Role,
  UserWithPermissions,
  PermissionCheckResult,
  RoleAssignment,
  PermissionContext,
} from './types'

// Enums (exported as both types and values)
export { Permission, PermissionCategory } from './types'

// Definitions
export {
  PERMISSION_DEFINITIONS,
  DEFAULT_ROLES,
  getPermissionMetadata,
  getPermissionsByCategory,
  getSystemCriticalPermissions,
} from './definitions'

// Validation utilities
export {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  checkPermission,
  checkPermissionWithContext,
  getRoleById,
  getRolePermissions,
  isSystemRole,
  validateRolePermissions,
  canAssignRole,
  getEffectivePermissions,
  isSystemCriticalPermission,
} from './validator'

// Role management
export {
  initializeRoles,
  getAllRoles,
  createRole,
  updateRole,
  deleteRole,
  getAssignableRoles,
  roleExists,
  getDefaultRole,
} from './role-service'