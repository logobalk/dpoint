/**
 * Admin Permissions API
 * Secure endpoint to list available permissions
 */

import { NextResponse } from 'next/server'
import { withAuthorization } from '@/lib/middleware'
import { Permission, PERMISSION_DEFINITIONS, PermissionCategory, PermissionMetadata, getPermissionsByCategory } from '@/lib/permissions'
import { applySecurityHeaders } from '@/lib/security-headers'
import { createCSRFProtectedResponse } from '@/lib/security'

/**
 * GET /api/admin/permissions - List all available permissions
 * Requires VIEW_ROLES permission (needed to see what permissions are available)
 */
export const GET = withAuthorization(
  async (request, session) => {
    try {
      // Get all permissions organized by category
      const permissionsByCategory: Record<string, PermissionMetadata[]> = {}

      Object.values(PermissionCategory).forEach(category => {
        permissionsByCategory[category] = getPermissionsByCategory(category)
      })

      return createCSRFProtectedResponse(
        {
          permissions: Object.values(PERMISSION_DEFINITIONS),
          permissionsByCategory,
          categories: Object.values(PermissionCategory),
        },
        { status: 200 },
        session.csrfToken
      )
    } catch (error) {
      console.error('Error fetching permissions:', error)
      return applySecurityHeaders(NextResponse.json(
        { error: 'Failed to fetch permissions' },
        { status: 500 }
      ))
    }
  },
  {
    requiredPermissions: Permission.VIEW_ROLES,
    requireCSRF: false,
  }
)