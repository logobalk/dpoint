/**
 * Authentication service implementation
 * Handles password hashing, verification, and user authentication
 */

import bcrypt from 'bcryptjs'
import { AuthService, User, UserRepository } from './interfaces'

/**
 * Password validation rules
 */
const PASSWORD_RULES = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  specialChars: '!@#$%^&*()_+-=[]{}|;:,.<>?',
}

export class AuthServiceImpl implements AuthService {
  private readonly saltRounds = 12
  private userRepository: UserRepository

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository
  }

  /**
   * Hash a plain text password using bcrypt
   */
  async hashPassword(password: string): Promise<string> {
    try {
      return await bcrypt.hash(password, this.saltRounds)
    } catch (error) {
      console.error('Password hashing failed:', error)
      throw new Error('Failed to hash password')
    }
  }

  /**
   * Verify a plain text password against a bcrypt hash
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hash)
    } catch (error) {
      console.error('Password verification failed:', error)
      return false
    }
  }

  /**
   * Authenticate a user with email and password
   */
  async authenticate(email: string, password: string): Promise<User | null> {
    try {
      // Input validation
      if (!email || !password) {
        return null
      }

      // Normalize email to lowercase
      const normalizedEmail = email.toLowerCase().trim()

      // Find user by email
      const user = await this.userRepository.findByEmail(normalizedEmail)
      
      if (!user) {
        // User not found - still perform password hashing to prevent timing attacks
        await bcrypt.hash(password, this.saltRounds)
        return null
      }

      // Check if user is active
      if (!user.isActive) {
        return null
      }

      // Verify password
      const isPasswordValid = await this.verifyPassword(password, user.passwordHash)
      
      if (!isPasswordValid) {
        return null
      }

      return user
    } catch (error) {
      console.error('Authentication failed:', error)
      return null
    }
  }

  /**
   * Validate password strength according to security requirements
   */
  validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!password) {
      errors.push('Password is required')
      return { isValid: false, errors }
    }

    // Check minimum length
    if (password.length < PASSWORD_RULES.minLength) {
      errors.push(`Password must be at least ${PASSWORD_RULES.minLength} characters long`)
    }

    // Check for uppercase letters
    if (PASSWORD_RULES.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter')
    }

    // Check for lowercase letters
    if (PASSWORD_RULES.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter')
    }

    // Check for numbers
    if (PASSWORD_RULES.requireNumbers && !/\d/.test(password)) {
      errors.push('Password must contain at least one number')
    }

    // Check for special characters
    if (PASSWORD_RULES.requireSpecialChars) {
      const specialCharsRegex = new RegExp(`[${PASSWORD_RULES.specialChars.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]`)
      if (!specialCharsRegex.test(password)) {
        errors.push('Password must contain at least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)')
      }
    }

    // Check for common weak patterns
    if (/^(.)\1+$/.test(password)) {
      errors.push('Password cannot be all the same character')
    }

    if (/^(012|123|234|345|456|567|678|789|890|abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i.test(password)) {
      errors.push('Password cannot contain sequential characters')
    }

    // Check for common weak passwords
    const commonWeakPasswords = [
      'password', '12345678', 'qwerty', 'abc123', 'password123',
      'admin', 'letmein', 'welcome', 'monkey', '1234567890'
    ]
    
    if (commonWeakPasswords.some(weak => password.toLowerCase().includes(weak))) {
      errors.push('Password contains common weak patterns')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Generate a secure random password (utility function)
   */
  generateSecurePassword(length: number = 16): string {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const lowercase = 'abcdefghijklmnopqrstuvwxyz'
    const numbers = '0123456789'
    const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?'
    
    const allChars = uppercase + lowercase + numbers + specialChars
    
    let password = ''
    
    // Ensure at least one character from each required category
    password += uppercase[Math.floor(Math.random() * uppercase.length)]
    password += lowercase[Math.floor(Math.random() * lowercase.length)]
    password += numbers[Math.floor(Math.random() * numbers.length)]
    password += specialChars[Math.floor(Math.random() * specialChars.length)]
    
    // Fill the rest randomly
    for (let i = 4; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)]
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('')
  }
}

/**
 * Utility function to create auth service instance
 */
export function createAuthService(userRepository: UserRepository): AuthService {
  return new AuthServiceImpl(userRepository)
}
