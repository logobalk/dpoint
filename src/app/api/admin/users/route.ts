/**
 * Admin User Management API
 * Secure endpoints for user management with RBAC and CSRF protection
 */

import { NextResponse } from 'next/server'
import { withAuthorization } from '@/lib/middleware'
import { Permission } from '@/lib/permissions'
import { applySecurityHeaders, InputValidator } from '@/lib/security-headers'
import { createCSRFProtectedResponse } from '@/lib/security'
import { getUserRepository, getAuthService } from '@/lib/data/data-source'
import { toPublicUser } from '@/lib/data/interfaces'

/**
 * GET /api/admin/users - List all users
 * Requires VIEW_USERS permission
 */
export const GET = withAuthorization(
  async (_request, session) => {
    try {
      const userRepository = getUserRepository()
      const users = await userRepository.findMany()

      // Convert to public user format (remove sensitive data)
      const publicUsers = users.map(toPublicUser)

      return createCSRFProtectedResponse(
        {
          users: publicUsers,
          total: publicUsers.length,
        },
        { status: 200 },
        session.csrfToken
      )
    } catch (error) {
      console.error('Error fetching users:', error)
      return applySecurityHeaders(NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      ))
    }
  },
  {
    requiredPermissions: Permission.VIEW_USERS,
    requireCSRF: false, // GET requests don't need CSRF
  }
)

/**
 * POST /api/admin/users - Create a new user
 * Requires ADD_USER permission
 */
export const POST = withAuthorization(
  async (request, session) => {
    try {
      const body = await request.json()

      // Validate and sanitize input
      const validation = InputValidator.validateRequestBody(body, [
        'email',
        'name',
        'password',
        'role'
      ])

      if (!validation.valid) {
        return createCSRFProtectedResponse(
          { error: 'Invalid input', details: validation.errors },
          { status: 400 },
          session.csrfToken
        )
      }

      const { email, name, password, role } = validation.sanitized

      // Additional validation
      if (!InputValidator.isValidEmail(email as string)) {
        return createCSRFProtectedResponse(
          { error: 'Invalid email format' },
          { status: 400 },
          session.csrfToken
        )
      }

      // Validate role
      const validRoles = ['user', 'admin']
      if (!validRoles.includes(role as string)) {
        return createCSRFProtectedResponse(
          { error: 'Invalid role. Must be user or admin' },
          { status: 400 },
          session.csrfToken
        )
      }

      const userRepository = getUserRepository()
      const authService = getAuthService()

      // Check if user already exists
      const existingUser = await userRepository.findByEmail(email as string)
      if (existingUser) {
        return createCSRFProtectedResponse(
          { error: 'User with this email already exists' },
          { status: 409 },
          session.csrfToken
        )
      }

      // Hash password and create user
      const hashedPassword = await authService.hashPassword(password as string)

      const newUser = await userRepository.create({
        email: email as string,
        name: name as string,
        password: hashedPassword,
        role: role as 'user' | 'admin',
        roleId: (role as string) || 'user', // Default role ID
        isActive: true,
      })

      if (!newUser) {
        return createCSRFProtectedResponse(
          { error: 'Failed to create user' },
          { status: 500 },
          session.csrfToken
        )
      }

      // Return public user data
      const publicUser = toPublicUser(newUser)

      return createCSRFProtectedResponse(
        {
          message: 'User created successfully',
          user: publicUser,
        },
        { status: 201 },
        session.csrfToken
      )
    } catch (error) {
      console.error('Error creating user:', error)
      return applySecurityHeaders(NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      ))
    }
  },
  {
    requiredPermissions: Permission.ADD_USER,
    requireCSRF: true,
  }
)