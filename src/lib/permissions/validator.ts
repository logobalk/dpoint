/**
 * Permission Validation Utilities
 * Provides functions to validate user permissions and access control
 */

import { Permission, PermissionCheckResult, PermissionContext, Role } from './types'
import { DEFAULT_ROLES, getSystemCriticalPermissions } from './definitions'

/**
 * Check if a user has a specific permission
 */
export function hasPermission(
  userPermissions: Permission[],
  requiredPermission: Permission
): boolean {
  return userPermissions.includes(requiredPermission)
}

/**
 * Check if a user has any of the specified permissions
 */
export function hasAnyPermission(
  userPermissions: Permission[],
  requiredPermissions: Permission[]
): boolean {
  return requiredPermissions.some(permission => userPermissions.includes(permission))
}

/**
 * Check if a user has all of the specified permissions
 */
export function hasAllPermissions(
  userPermissions: Permission[],
  requiredPermissions: Permission[]
): boolean {
  return requiredPermissions.every(permission => userPermissions.includes(permission))
}

/**
 * Comprehensive permission check with detailed result
 */
export function checkPermission(
  userPermissions: Permission[],
  requiredPermissions: Permission | Permission[],
  requireAll: boolean = false
): PermissionCheckResult {
  const permissions = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions]

  let allowed: boolean
  if (requireAll) {
    allowed = hasAllPermissions(userPermissions, permissions)
  } else {
    allowed = hasAnyPermission(userPermissions, permissions)
  }

  return {
    allowed,
    reason: allowed
      ? 'Permission granted'
      : `Missing required permission${permissions.length > 1 ? 's' : ''}: ${permissions.join(', ')}`,
    requiredPermissions: permissions,
    userPermissions,
  }
}

/**
 * Check if a user can perform an action based on context
 */
export function checkPermissionWithContext(
  context: PermissionContext,
  requiredPermissions: Permission | Permission[],
  requireAll: boolean = false
): PermissionCheckResult {
  return checkPermission(context.userPermissions, requiredPermissions, requireAll)
}

/**
 * Get role by ID from default roles
 */
export function getRoleById(roleId: string): Role | null {
  const roleTemplate = DEFAULT_ROLES.find(role => role.id === roleId)
  if (!roleTemplate) return null

  return {
    ...roleTemplate,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}

/**
 * Get permissions for a role
 */
export function getRolePermissions(roleId: string): Permission[] {
  const role = getRoleById(roleId)
  return role ? role.permissions : []
}

/**
 * Check if a role is a system role (cannot be deleted)
 */
export function isSystemRole(roleId: string): boolean {
  const role = getRoleById(roleId)
  return role ? role.isSystemRole === true : false
}

/**
 * Validate role permissions (ensure system critical permissions are not removed from admin)
 */
export function validateRolePermissions(
  roleId: string,
  permissions: Permission[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  // Check if this is an admin role
  if (roleId === 'role_admin') {
    const systemCritical = getSystemCriticalPermissions()
    const missingCritical = systemCritical.filter(p => !permissions.includes(p))

    if (missingCritical.length > 0) {
      errors.push(`Admin role cannot remove system critical permissions: ${missingCritical.join(', ')}`)
    }
  }

  // Validate that all permissions are valid
  const validPermissions = Object.values(Permission)
  const invalidPermissions = permissions.filter(p => !validPermissions.includes(p))

  if (invalidPermissions.length > 0) {
    errors.push(`Invalid permissions: ${invalidPermissions.join(', ')}`)
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Check if a user can assign a specific role
 */
export function canAssignRole(
  userPermissions: Permission[],
  targetRoleId: string
): boolean {
  // Must have ASSIGN_ROLES permission
  if (!hasPermission(userPermissions, Permission.ASSIGN_ROLES)) {
    return false
  }

  // Admin role can only be assigned by users with MANAGE_ROLES permission
  if (targetRoleId === 'role_admin') {
    return hasPermission(userPermissions, Permission.MANAGE_ROLES)
  }

  return true
}

/**
 * Get effective permissions for a user (combines role permissions with any additional permissions)
 */
export function getEffectivePermissions(
  roleId: string,
  additionalPermissions: Permission[] = []
): Permission[] {
  const rolePermissions = getRolePermissions(roleId)
  const allPermissions = [...rolePermissions, ...additionalPermissions]

  // Remove duplicates
  return Array.from(new Set(allPermissions))
}

/**
 * Check if a permission is system critical
 */
export function isSystemCriticalPermission(permission: Permission): boolean {
  return getSystemCriticalPermissions().includes(permission)
}