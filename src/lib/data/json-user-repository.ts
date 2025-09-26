/**
 * JSON file-based user repository implementation
 * This implementation stores user data in a JSON file and provides
 * an abstraction layer that can be easily replaced with a database
 */

import fs from 'fs/promises'
import path from 'path'
import { User, UserRepository, CreateUserData, UpdateUserData, UserFilter } from './interfaces'
import { createAuthService } from './auth-service'

interface JsonUserData {
  users: User[]
  lastUpdated: string
}

export class JsonUserRepository implements UserRepository {
  private readonly filePath: string
  private cache: JsonUserData | null = null
  private readonly authService = createAuthService(this)

  constructor(filePath?: string) {
    this.filePath = filePath || path.join(process.cwd(), 'data', 'users.json')
  }

  /**
   * Load users from JSON file with caching
   */
  private async loadUsers(): Promise<JsonUserData> {
    try {
      // Return cached data if available and recent (within 5 minutes)
      if (this.cache) {
        const cacheAge = Date.now() - new Date(this.cache.lastUpdated).getTime()
        if (cacheAge < 5 * 60 * 1000) { // 5 minutes
          return this.cache
        }
      }

      const fileContent = await fs.readFile(this.filePath, 'utf-8')
      const data: JsonUserData = JSON.parse(fileContent)
      
      // Convert date strings back to Date objects
      data.users = data.users.map(user => ({
        ...user,
        createdAt: new Date(user.createdAt),
        updatedAt: new Date(user.updatedAt),
      }))

      this.cache = data
      return data
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        // File doesn't exist, return empty data
        const emptyData: JsonUserData = {
          users: [],
          lastUpdated: new Date().toISOString(),
        }
        await this.saveUsers(emptyData)
        return emptyData
      }
      throw new Error(`Failed to load users: ${error}`)
    }
  }

  /**
   * Save users to JSON file
   */
  private async saveUsers(data: JsonUserData): Promise<void> {
    try {
      // Ensure directory exists
      const dir = path.dirname(this.filePath)
      await fs.mkdir(dir, { recursive: true })

      // Update timestamp
      data.lastUpdated = new Date().toISOString()

      // Save to file with pretty formatting
      await fs.writeFile(this.filePath, JSON.stringify(data, null, 2), 'utf-8')
      
      // Update cache
      this.cache = data
    } catch (error) {
      throw new Error(`Failed to save users: ${error}`)
    }
  }

  /**
   * Find a user by their unique identifier
   */
  async findById(id: string): Promise<User | null> {
    const data = await this.loadUsers()
    return data.users.find(user => user.id === id) || null
  }

  /**
   * Find a user by their email address
   */
  async findByEmail(email: string): Promise<User | null> {
    const data = await this.loadUsers()
    const normalizedEmail = email.toLowerCase().trim()
    return data.users.find(user => user.email.toLowerCase() === normalizedEmail) || null
  }

  /**
   * Find multiple users based on filter criteria
   */
  async findMany(filter?: UserFilter): Promise<User[]> {
    const data = await this.loadUsers()
    
    if (!filter) {
      return data.users
    }

    return data.users.filter(user => {
      if (filter.email && user.email.toLowerCase() !== filter.email.toLowerCase()) {
        return false
      }
      if (filter.role && user.role !== filter.role) {
        return false
      }
      if (filter.isActive !== undefined && user.isActive !== filter.isActive) {
        return false
      }
      return true
    })
  }

  /**
   * Create a new user
   */
  async create(userData: CreateUserData): Promise<User> {
    const data = await this.loadUsers()

    // Check if user already exists
    const existingUser = await this.findByEmail(userData.email)
    if (existingUser) {
      throw new Error('User with this email already exists')
    }

    // Validate password
    const passwordValidation = this.authService.validatePassword(userData.password)
    if (!passwordValidation.isValid) {
      throw new Error(`Password validation failed: ${passwordValidation.errors.join(', ')}`)
    }

    // Hash password
    const passwordHash = await this.authService.hashPassword(userData.password)

    // Create new user
    const newUser: User = {
      id: this.generateId(),
      email: userData.email.toLowerCase().trim(),
      name: userData.name.trim(),
      role: userData.role,
      roleId: userData.roleId || userData.role, // Default to role if roleId not provided
      passwordHash,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: userData.isActive !== undefined ? userData.isActive : true,
    }

    data.users.push(newUser)
    await this.saveUsers(data)

    return newUser
  }

  /**
   * Update an existing user
   */
  async update(id: string, userData: UpdateUserData): Promise<User | null> {
    const data = await this.loadUsers()
    const userIndex = data.users.findIndex(user => user.id === id)

    if (userIndex === -1) {
      return null
    }

    const user = data.users[userIndex]

    // Update fields
    if (userData.name !== undefined) {
      user.name = userData.name.trim()
    }
    if (userData.role !== undefined) {
      user.role = userData.role
    }
    if (userData.roleId !== undefined) {
      user.roleId = userData.roleId
    }
    if (userData.isActive !== undefined) {
      user.isActive = userData.isActive
    }
    if (userData.password !== undefined) {
      // Validate new password
      const passwordValidation = this.authService.validatePassword(userData.password)
      if (!passwordValidation.isValid) {
        throw new Error(`Password validation failed: ${passwordValidation.errors.join(', ')}`)
      }
      user.passwordHash = await this.authService.hashPassword(userData.password)
    }

    user.updatedAt = new Date()

    await this.saveUsers(data)
    return user
  }

  /**
   * Delete a user (soft delete - set isActive to false)
   */
  async delete(id: string): Promise<boolean> {
    const user = await this.update(id, { isActive: false })
    return user !== null
  }

  /**
   * Check if a user exists with the given email
   */
  async existsByEmail(email: string): Promise<boolean> {
    const user = await this.findByEmail(email)
    return user !== null
  }

  /**
   * Generate a unique ID for new users
   */
  private generateId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
  }

  /**
   * Clear cache (useful for testing)
   */
  clearCache(): void {
    this.cache = null
  }
}

/**
 * Factory function to create a JSON user repository
 */
export function createJsonUserRepository(filePath?: string): UserRepository {
  return new JsonUserRepository(filePath)
}
