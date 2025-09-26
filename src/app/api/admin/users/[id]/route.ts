/**
 * Admin Individual User Management API
 * Secure endpoints for individual user operations with RBAC
 */

import { NextRequest, NextResponse } from 'next/server'
import { withAuthorization } from '@/lib/middleware'
import { Permission } from '@/lib/permissions'
import { applySecurityHeaders, InputValidator } from '@/lib/security-headers'
import { createCSRFProtectedResponse } from '@/lib/security'
import { getUserRepository } from '@/lib/data/data-source'
import { toPublicUser } from '@/lib/data/interfaces'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

/**
 * GET /api/admin/users/[id] - Get user by ID
 * Requires VIEW_USER_DETAILS permission
 */
export const GET = withAuthorization(
  async (request: NextRequest, session, { params }: RouteParams) => {
    try {
      const { id } = await params

      if (!id) {
        return createCSRFProtectedResponse(
          { error: 'User ID is required' },
          { status: 400 },
          session.csrfToken
        )
      }

      const userRepository = getUserRepository()
      const user = await userRepository.findById(id)

      if (!user) {
        return createCSRFProtectedResponse(
          { error: 'User not found' },
          { status: 404 },
          session.csrfToken
        )
      }

      const publicUser = toPublicUser(user)

      return createCSRFProtectedResponse(
        { user: publicUser },
        { status: 200 },
        session.csrfToken
      )
    } catch (error) {
      console.error('Error fetching user:', error)
      return applySecurityHeaders(NextResponse.json(
        { error: 'Failed to fetch user' },
        { status: 500 }
      ))
    }
  },
  {
    requiredPermissions: Permission.VIEW_USER_DETAILS,
    requireCSRF: false,
  }
)

/**
 * PUT /api/admin/users/[id] - Update user
 * Requires EDIT_USER permission
 */
export const PUT = withAuthorization(
  async (request: NextRequest, session, { params }: RouteParams) => {
    try {
      const { id } = await params

      if (!id) {
        return createCSRFProtectedResponse(
          { error: 'User ID is required' },
          { status: 400 },
          session.csrfToken
        )
      }

      const body = await request.json()

      // Validate input (all fields are optional for updates)
      const validation = InputValidator.validateRequestBody(body, [])

      if (!validation.valid) {
        return createCSRFProtectedResponse(
          { error: 'Invalid input', details: validation.errors },
          { status: 400 },
          session.csrfToken
        )
      }

      const updates = validation.sanitized

      // Validate email if provided
      if (updates.email && !InputValidator.isValidEmail(updates.email as string)) {
        return createCSRFProtectedResponse(
          { error: 'Invalid email format' },
          { status: 400 },
          session.csrfToken
        )
      }

      // Validate role if provided
      if (updates.role) {
        const validRoles = ['user', 'admin']
        if (!validRoles.includes(updates.role as string)) {
          return createCSRFProtectedResponse(
            { error: 'Invalid role. Must be user or admin' },
            { status: 400 },
            session.csrfToken
          )
        }
      }

      const userRepository = getUserRepository()

      // Check if user exists
      const existingUser = await userRepository.findById(id)
      if (!existingUser) {
        return createCSRFProtectedResponse(
          { error: 'User not found' },
          { status: 404 },
          session.csrfToken
        )
      }

      // Prevent users from modifying their own admin status
      if (existingUser.id === session.userId && updates.role && updates.role !== existingUser.role) {
        return createCSRFProtectedResponse(
          { error: 'Cannot modify your own role' },
          { status: 403 },
          session.csrfToken
        )
      }

      // Update user
      const updatedUser = await userRepository.update(id, updates)

      if (!updatedUser) {
        return createCSRFProtectedResponse(
          { error: 'Failed to update user' },
          { status: 500 },
          session.csrfToken
        )
      }

      const publicUser = toPublicUser(updatedUser)

      return createCSRFProtectedResponse(
        {
          message: 'User updated successfully',
          user: publicUser,
        },
        { status: 200 },
        session.csrfToken
      )
    } catch (error) {
      console.error('Error updating user:', error)
      return applySecurityHeaders(NextResponse.json(
        { error: 'Failed to update user' },
        { status: 500 }
      ))
    }
  },
  {
    requiredPermissions: Permission.EDIT_USER,
    requireCSRF: true,
  }
)

/**
 * DELETE /api/admin/users/[id] - Delete user
 * Requires REMOVE_USER permission
 */
export const DELETE = withAuthorization(
  async (request: NextRequest, session, { params }: RouteParams) => {
    try {
      const { id } = await params

      if (!id) {
        return createCSRFProtectedResponse(
          { error: 'User ID is required' },
          { status: 400 },
          session.csrfToken
        )
      }

      const userRepository = getUserRepository()

      // Check if user exists
      const existingUser = await userRepository.findById(id)
      if (!existingUser) {
        return createCSRFProtectedResponse(
          { error: 'User not found' },
          { status: 404 },
          session.csrfToken
        )
      }

      // Prevent users from deleting themselves
      if (existingUser.id === session.userId) {
        return createCSRFProtectedResponse(
          { error: 'Cannot delete your own account' },
          { status: 403 },
          session.csrfToken
        )
      }

      // Prevent deletion of the last admin user
      if (existingUser.role === 'admin') {
        const allUsers = await userRepository.findMany()
        const adminCount = allUsers.filter(u => u.role === 'admin' && u.isActive).length

        if (adminCount <= 1) {
          return createCSRFProtectedResponse(
            { error: 'Cannot delete the last admin user' },
            { status: 403 },
            session.csrfToken
          )
        }
      }

      // Delete user (or mark as inactive)
      const deleted = await userRepository.delete(id)

      if (!deleted) {
        return createCSRFProtectedResponse(
          { error: 'Failed to delete user' },
          { status: 500 },
          session.csrfToken
        )
      }

      return createCSRFProtectedResponse(
        { message: 'User deleted successfully' },
        { status: 200 },
        session.csrfToken
      )
    } catch (error) {
      console.error('Error deleting user:', error)
      return applySecurityHeaders(NextResponse.json(
        { error: 'Failed to delete user' },
        { status: 500 }
      ))
    }
  },
  {
    requiredPermissions: Permission.REMOVE_USER,
    requireCSRF: true,
  }
)