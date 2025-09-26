/**
 * RBAC Permission System Types
 * Defines the structure for flexible role-based access control
 */

/**
 * Available permissions in the system
 * Each permission represents a specific action a user can perform
 */
export enum Permission {
  // Dashboard permissions
  VIEW_DASHBOARD = 'view_dashboard',

  // User management permissions
  VIEW_USERS = 'view_users',
  ADD_USER = 'add_user',
  EDIT_USER = 'edit_user',
  REMOVE_USER = 'remove_user',
  VIEW_USER_DETAILS = 'view_user_details',

  // Role management permissions
  VIEW_ROLES = 'view_roles',
  MANAGE_ROLES = 'manage_roles',
  ASSIGN_ROLES = 'assign_roles',

  // System administration permissions
  VIEW_SYSTEM_LOGS = 'view_system_logs',
  MANAGE_SYSTEM_SETTINGS = 'manage_system_settings',
  VIEW_ANALYTICS = 'view_analytics',

  // Security permissions
  VIEW_SECURITY_LOGS = 'view_security_logs',
  MANAGE_SECURITY_SETTINGS = 'manage_security_settings',
  FORCE_LOGOUT_USERS = 'force_logout_users',

  // API permissions
  ACCESS_API = 'access_api',
  ADMIN_API_ACCESS = 'admin_api_access',
}

/**
 * Permission categories for better organization
 */
export enum PermissionCategory {
  DASHBOARD = 'dashboard',
  USER_MANAGEMENT = 'user_management',
  ROLE_MANAGEMENT = 'role_management',
  SYSTEM_ADMIN = 'system_admin',
  SECURITY = 'security',
  API = 'api',
}

/**
 * Permission metadata for UI display and organization
 */
export interface PermissionMetadata {
  id: Permission
  name: string
  description: string
  category: PermissionCategory
  isSystemCritical?: boolean // Cannot be removed from admin role
}

/**
 * Role definition with associated permissions
 */
export interface Role {
  id: string
  name: string
  description: string
  permissions: Permission[]
  isSystemRole?: boolean // Cannot be deleted (admin, user)
  createdAt: Date
  updatedAt: Date
}

/**
 * User with role and permission information
 */
export interface UserWithPermissions {
  id: string
  email: string
  name: string
  role: string
  roleId: string
  permissions: Permission[]
  isActive: boolean
  createdAt: Date
}

/**
 * Permission check result
 */
export interface PermissionCheckResult {
  allowed: boolean
  reason?: string
  requiredPermissions?: Permission[]
  userPermissions?: Permission[]
}

/**
 * Role assignment data
 */
export interface RoleAssignment {
  userId: string
  roleId: string
  assignedBy: string
  assignedAt: Date
}

/**
 * Permission validation context
 */
export interface PermissionContext {
  userId: string
  userRole: string
  userPermissions: Permission[]
  requestedResource: string
  requestedAction: string
  ipAddress?: string
  userAgent?: string
}