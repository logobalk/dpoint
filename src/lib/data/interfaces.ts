/**
 * Data layer interfaces and types
 * This module defines the contracts for data access that can be implemented
 * by different data sources (JSON, database, API, etc.)
 */

export interface User {
  id: string
  email: string
  name: string
  role: 'user' | 'admin'
  roleId: string // For RBAC system
  passwordHash: string
  createdAt: Date
  updatedAt: Date
  isActive: boolean
}

export interface CreateUserData {
  email: string
  name: string
  role: 'user' | 'admin'
  roleId?: string // Optional, defaults to role value
  password: string
  isActive?: boolean // Optional, defaults to true
}

export interface UpdateUserData {
  name?: string
  role?: 'user' | 'admin'
  roleId?: string // For RBAC system
  password?: string
  isActive?: boolean
}

export interface UserFilter {
  email?: string
  role?: 'user' | 'admin'
  isActive?: boolean
}

/**
 * Repository interface for user data operations
 * This abstraction allows switching between different data sources
 */
export interface UserRepository {
  /**
   * Find a user by their unique identifier
   */
  findById(id: string): Promise<User | null>

  /**
   * Find a user by their email address
   */
  findByEmail(email: string): Promise<User | null>

  /**
   * Find multiple users based on filter criteria
   */
  findMany(filter?: UserFilter): Promise<User[]>

  /**
   * Create a new user
   */
  create(userData: CreateUserData): Promise<User>

  /**
   * Update an existing user
   */
  update(id: string, userData: UpdateUserData): Promise<User | null>

  /**
   * Delete a user (soft delete - set isActive to false)
   */
  delete(id: string): Promise<boolean>

  /**
   * Check if a user exists with the given email
   */
  existsByEmail(email: string): Promise<boolean>
}

/**
 * Authentication service interface
 * Handles password hashing, verification, and user authentication
 */
export interface AuthService {
  /**
   * Hash a plain text password
   */
  hashPassword(password: string): Promise<string>

  /**
   * Verify a plain text password against a hash
   */
  verifyPassword(password: string, hash: string): Promise<boolean>

  /**
   * Authenticate a user with email and password
   */
  authenticate(email: string, password: string): Promise<User | null>

  /**
   * Validate password strength
   */
  validatePassword(password: string): { isValid: boolean; errors: string[] }
}

/**
 * Data source configuration
 */
export interface DataSourceConfig {
  type: 'json' | 'database' | 'api'
  connectionString?: string
  filePath?: string
  options?: Record<string, unknown>
}

/**
 * Public user data (without sensitive information)
 */
export interface PublicUser {
  id: string
  email: string
  name: string
  role: 'user' | 'admin'
  createdAt: Date
  isActive: boolean
}

/**
 * Convert User to PublicUser (remove sensitive data)
 */
export function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt,
    isActive: user.isActive,
  }
}

/**
 * Session payload for JWT tokens
 */
export interface SessionPayload {
  userId: string
  email: string
  name: string
  role: 'user' | 'admin'
  expiresAt: Date
  [key: string]: unknown // Add index signature for JWT compatibility
}
