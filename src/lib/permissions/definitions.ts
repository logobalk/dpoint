/**
 * Permission Definitions and Role Mappings
 * Defines all available permissions and their metadata
 */

import { Permission, PermissionCategory, PermissionMetadata, Role } from './types'

/**
 * Complete permission metadata registry
 */
export const PERMISSION_DEFINITIONS: Record<Permission, PermissionMetadata> = {
  // Dashboard permissions
  [Permission.VIEW_DASHBOARD]: {
    id: Permission.VIEW_DASHBOARD,
    name: 'View Dashboard',
    description: 'Access to the main dashboard',
    category: PermissionCategory.DASHBOARD,
  },

  // User management permissions
  [Permission.VIEW_USERS]: {
    id: Permission.VIEW_USERS,
    name: 'View Users',
    description: 'View list of users in the system',
    category: PermissionCategory.USER_MANAGEMENT,
  },
  [Permission.ADD_USER]: {
    id: Permission.ADD_USER,
    name: 'Add User',
    description: 'Create new user accounts',
    category: PermissionCategory.USER_MANAGEMENT,
    isSystemCritical: true,
  },
  [Permission.EDIT_USER]: {
    id: Permission.EDIT_USER,
    name: 'Edit User',
    description: 'Modify existing user accounts',
    category: PermissionCategory.USER_MANAGEMENT,
    isSystemCritical: true,
  },
  [Permission.REMOVE_USER]: {
    id: Permission.REMOVE_USER,
    name: 'Remove User',
    description: 'Delete user accounts',
    category: PermissionCategory.USER_MANAGEMENT,
    isSystemCritical: true,
  },
  [Permission.VIEW_USER_DETAILS]: {
    id: Permission.VIEW_USER_DETAILS,
    name: 'View User Details',
    description: 'Access detailed user information',
    category: PermissionCategory.USER_MANAGEMENT,
  },

  // Role management permissions
  [Permission.VIEW_ROLES]: {
    id: Permission.VIEW_ROLES,
    name: 'View Roles',
    description: 'View available roles and their permissions',
    category: PermissionCategory.ROLE_MANAGEMENT,
  },
  [Permission.MANAGE_ROLES]: {
    id: Permission.MANAGE_ROLES,
    name: 'Manage Roles',
    description: 'Create, edit, and delete roles',
    category: PermissionCategory.ROLE_MANAGEMENT,
    isSystemCritical: true,
  },
  [Permission.ASSIGN_ROLES]: {
    id: Permission.ASSIGN_ROLES,
    name: 'Assign Roles',
    description: 'Assign roles to users',
    category: PermissionCategory.ROLE_MANAGEMENT,
    isSystemCritical: true,
  },

  // System administration permissions
  [Permission.VIEW_SYSTEM_LOGS]: {
    id: Permission.VIEW_SYSTEM_LOGS,
    name: 'View System Logs',
    description: 'Access system logs and audit trails',
    category: PermissionCategory.SYSTEM_ADMIN,
  },
  [Permission.MANAGE_SYSTEM_SETTINGS]: {
    id: Permission.MANAGE_SYSTEM_SETTINGS,
    name: 'Manage System Settings',
    description: 'Configure system-wide settings',
    category: PermissionCategory.SYSTEM_ADMIN,
    isSystemCritical: true,
  },
  [Permission.VIEW_ANALYTICS]: {
    id: Permission.VIEW_ANALYTICS,
    name: 'View Analytics',
    description: 'Access system analytics and reports',
    category: PermissionCategory.SYSTEM_ADMIN,
  },

  // Security permissions
  [Permission.VIEW_SECURITY_LOGS]: {
    id: Permission.VIEW_SECURITY_LOGS,
    name: 'View Security Logs',
    description: 'Access security logs and events',
    category: PermissionCategory.SECURITY,
  },
  [Permission.MANAGE_SECURITY_SETTINGS]: {
    id: Permission.MANAGE_SECURITY_SETTINGS,
    name: 'Manage Security Settings',
    description: 'Configure security policies and settings',
    category: PermissionCategory.SECURITY,
    isSystemCritical: true,
  },
  [Permission.FORCE_LOGOUT_USERS]: {
    id: Permission.FORCE_LOGOUT_USERS,
    name: 'Force Logout Users',
    description: 'Force logout users for security reasons',
    category: PermissionCategory.SECURITY,
    isSystemCritical: true,
  },

  // API permissions
  [Permission.ACCESS_API]: {
    id: Permission.ACCESS_API,
    name: 'Access API',
    description: 'Basic API access for authenticated users',
    category: PermissionCategory.API,
  },
  [Permission.ADMIN_API_ACCESS]: {
    id: Permission.ADMIN_API_ACCESS,
    name: 'Admin API Access',
    description: 'Access to administrative API endpoints',
    category: PermissionCategory.API,
    isSystemCritical: true,
  },
}

/**
 * Default role definitions with their permissions
 */
export const DEFAULT_ROLES: Omit<Role, 'createdAt' | 'updatedAt'>[] = [
  {
    id: 'role_user',
    name: 'User',
    description: 'Standard user with basic access',
    permissions: [
      Permission.VIEW_DASHBOARD,
      Permission.ACCESS_API,
    ],
    isSystemRole: true,
  },
  {
    id: 'role_admin',
    name: 'Administrator',
    description: 'Full system administrator with all permissions',
    permissions: Object.values(Permission),
    isSystemRole: true,
  },
  {
    id: 'role_user_manager',
    name: 'User Manager',
    description: 'Can manage users but not system settings',
    permissions: [
      Permission.VIEW_DASHBOARD,
      Permission.VIEW_USERS,
      Permission.ADD_USER,
      Permission.EDIT_USER,
      Permission.VIEW_USER_DETAILS,
      Permission.VIEW_ROLES,
      Permission.ASSIGN_ROLES,
      Permission.ACCESS_API,
    ],
    isSystemRole: false,
  },
  {
    id: 'role_viewer',
    name: 'Viewer',
    description: 'Read-only access to most system information',
    permissions: [
      Permission.VIEW_DASHBOARD,
      Permission.VIEW_USERS,
      Permission.VIEW_USER_DETAILS,
      Permission.VIEW_ROLES,
      Permission.VIEW_SYSTEM_LOGS,
      Permission.VIEW_ANALYTICS,
      Permission.ACCESS_API,
    ],
    isSystemRole: false,
  },
]

/**
 * Get permission metadata by permission ID
 */
export function getPermissionMetadata(permission: Permission): PermissionMetadata {
  return PERMISSION_DEFINITIONS[permission]
}

/**
 * Get all permissions in a category
 */
export function getPermissionsByCategory(category: PermissionCategory): PermissionMetadata[] {
  return Object.values(PERMISSION_DEFINITIONS).filter(p => p.category === category)
}

/**
 * Get all system critical permissions
 */
export function getSystemCriticalPermissions(): Permission[] {
  return Object.values(PERMISSION_DEFINITIONS)
    .filter(p => p.isSystemCritical)
    .map(p => p.id)
}