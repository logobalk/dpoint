/**
 * Admin Role Management API
 * Secure endpoints for role management with RBAC
 */

import { NextResponse } from 'next/server'
import { withAuthorization } from '@/lib/middleware'
import { Permission, getAllRoles, createRole, PERMISSION_DEFINITIONS } from '@/lib/permissions'
import { applySecurityHeaders, InputValidator } from '@/lib/security-headers'
import { createCSRFProtectedResponse } from '@/lib/security'

/**
 * GET /api/admin/roles - List all roles
 * Requires VIEW_ROLES permission
 */
export const GET = withAuthorization(
  async (_request, session) => {
    try {
      const roles = getAllRoles()

      return createCSRFProtectedResponse(
        {
          roles,
          total: roles.length,
        },
        { status: 200 },
        session.csrfToken
      )
    } catch (error) {
      console.error('Error fetching roles:', error)
      return applySecurityHeaders(NextResponse.json(
        { error: 'Failed to fetch roles' },
        { status: 500 }
      ))
    }
  },
  {
    requiredPermissions: Permission.VIEW_ROLES,
    requireCSRF: false,
  }
)

/**
 * POST /api/admin/roles - Create a new role
 * Requires MANAGE_ROLES permission
 */
export const POST = withAuthorization(
  async (request, session) => {
    try {
      const body = await request.json()

      // Validate input
      const validation = InputValidator.validateRequestBody(body, [
        'name',
        'description',
        'permissions'
      ])

      if (!validation.valid) {
        return createCSRFProtectedResponse(
          { error: 'Invalid input', details: validation.errors },
          { status: 400 },
          session.csrfToken
        )
      }

      const { name, description, permissions } = validation.sanitized

      // Validate permissions array
      if (!Array.isArray(permissions)) {
        return createCSRFProtectedResponse(
          { error: 'Permissions must be an array' },
          { status: 400 },
          session.csrfToken
        )
      }

      // Validate that all permissions are valid
      const validPermissions = Object.keys(PERMISSION_DEFINITIONS)
      const invalidPermissions = (permissions as string[]).filter(
        p => !validPermissions.includes(p)
      )

      if (invalidPermissions.length > 0) {
        return createCSRFProtectedResponse(
          {
            error: 'Invalid permissions',
            invalid: invalidPermissions,
            valid: validPermissions,
          },
          { status: 400 },
          session.csrfToken
        )
      }

      // Create role
      const result = createRole({
        name: name as string,
        description: description as string,
        permissions: permissions as Permission[],
        isSystemRole: false,
      })

      if (!result.success) {
        return createCSRFProtectedResponse(
          { error: result.error },
          { status: 400 },
          session.csrfToken
        )
      }

      return createCSRFProtectedResponse(
        {
          message: 'Role created successfully',
          role: result.role,
        },
        { status: 201 },
        session.csrfToken
      )
    } catch (error) {
      console.error('Error creating role:', error)
      return applySecurityHeaders(NextResponse.json(
        { error: 'Failed to create role' },
        { status: 500 }
      ))
    }
  },
  {
    requiredPermissions: Permission.MANAGE_ROLES,
    requireCSRF: true,
  }
)