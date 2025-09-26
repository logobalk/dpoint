/**
 * Role Management Service
 * Handles role creation, modification, and assignment
 */

import { Permission, Role } from './types'
import { DEFAULT_ROLES } from './definitions'
import { validateRolePermissions } from './validator'

// In-memory storage for custom roles (in production, use database)
let customRoles: Role[] = []

/**
 * Initialize roles with default system roles
 */
export function initializeRoles(): void {
  // Convert default roles to full Role objects
  const systemRoles: Role[] = DEFAULT_ROLES.map(role => ({
    ...role,
    createdAt: new Date(),
    updatedAt: new Date(),
  }))

  // Store system roles (in production, ensure they exist in database)
  customRoles = [...systemRoles]
}

/**
 * Get all available roles
 */
export function getAllRoles(): Role[] {
  return [...customRoles]
}

/**
 * Get role by ID
 */
export function getRoleById(roleId: string): Role | null {
  return customRoles.find(role => role.id === roleId) || null
}

/**
 * Create a new custom role
 */
export function createRole(
  roleData: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>
): { success: boolean; role?: Role; error?: string } {
  try {
    // Check for duplicate role name
    const existingRole = customRoles.find(role =>
      role.name.toLowerCase() === roleData.name.toLowerCase()
    )
    if (existingRole) {
      return { success: false, error: `Role with name '${roleData.name}' already exists` }
    }

    // Validate permissions
    const validation = validateRolePermissions('custom', roleData.permissions)
    if (!validation.valid) {
      return { success: false, error: validation.errors.join(', ') }
    }

    // Generate unique ID
    const roleId = `role_custom_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`

    const newRole: Role = {
      ...roleData,
      id: roleId,
      isSystemRole: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    customRoles.push(newRole)

    return { success: true, role: newRole }
  } catch {
    return { success: false, error: 'Failed to create role' }
  }
}

/**
 * Update an existing role
 */
export function updateRole(
  roleId: string,
  updates: Partial<Pick<Role, 'name' | 'description' | 'permissions'>>
): { success: boolean; role?: Role; error?: string } {
  try {
    const roleIndex = customRoles.findIndex(role => role.id === roleId)
    if (roleIndex === -1) {
      return { success: false, error: 'Role not found' }
    }

    const existingRole = customRoles[roleIndex]

    // Prevent modification of system roles' core properties
    if (existingRole.isSystemRole && (updates.name || updates.description)) {
      return { success: false, error: 'Cannot modify system role name or description' }
    }

    // Validate permissions if being updated
    if (updates.permissions) {
      const validation = validateRolePermissions(roleId, updates.permissions)
      if (!validation.valid) {
        return { success: false, error: validation.errors.join(', ') }
      }
    }

    const updatedRole: Role = {
      ...existingRole,
      ...updates,
      updatedAt: new Date(),
    }

    customRoles[roleIndex] = updatedRole

    return { success: true, role: updatedRole }
  } catch {
    return { success: false, error: 'Failed to update role' }
  }
}

/**
 * Delete a role
 */
export function deleteRole(
  roleId: string
): { success: boolean; error?: string } {
  try {
    const roleIndex = customRoles.findIndex(role => role.id === roleId)
    if (roleIndex === -1) {
      return { success: false, error: 'Role not found' }
    }

    const role = customRoles[roleIndex]

    // Prevent deletion of system roles
    if (role.isSystemRole) {
      return { success: false, error: 'Cannot delete system role' }
    }

    customRoles.splice(roleIndex, 1)

    return { success: true }
  } catch {
    return { success: false, error: 'Failed to delete role' }
  }
}

/**
 * Get roles that a user can assign (based on their permissions)
 */
export function getAssignableRoles(userPermissions: Permission[]): Role[] {
  const allRoles = getAllRoles()

  // Users with MANAGE_ROLES can assign any role
  if (userPermissions.includes(Permission.MANAGE_ROLES)) {
    return allRoles
  }

  // Users with ASSIGN_ROLES can assign non-admin roles
  if (userPermissions.includes(Permission.ASSIGN_ROLES)) {
    return allRoles.filter(role => role.id !== 'role_admin')
  }

  return []
}

/**
 * Check if a role exists
 */
export function roleExists(roleId: string): boolean {
  return customRoles.some(role => role.id === roleId)
}

/**
 * Get default role for new users
 */
export function getDefaultRole(): Role {
  const userRole = getRoleById('role_user')
  if (!userRole) {
    throw new Error('Default user role not found')
  }
  return userRole
}

// Initialize roles on module load
initializeRoles()