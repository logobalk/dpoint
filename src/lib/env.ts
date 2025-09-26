/**
 * Environment variable validation and configuration
 * This module ensures all required environment variables are present and valid
 */

interface EnvironmentConfig {
  JWT_SECRET: string
  NODE_ENV: string
  NEXT_PUBLIC_BASE_URL?: string
  // Rate limiting configuration
  RATE_LIMIT_MAX_REQUESTS: number
  RATE_LIMIT_WINDOW_MS: number
  RATE_LIMIT_SKIP_SUCCESSFUL_REQUESTS: boolean
  // Security configuration
  SECURITY_HEADERS_ENABLED: boolean
}

/**
 * Required environment variables that must be present
 */
const requiredEnvVars = ['JWT_SECRET'] as const

/**
 * Optional environment variables with their default values
 */
const optionalEnvVars = {
  NODE_ENV: 'development',
  NEXT_PUBLIC_BASE_URL: 'http://localhost:3000',
  // Rate limiting defaults (5 requests per minute for auth endpoints)
  RATE_LIMIT_MAX_REQUESTS: '5',
  RATE_LIMIT_WINDOW_MS: '60000', // 1 minute
  RATE_LIMIT_SKIP_SUCCESSFUL_REQUESTS: 'true',
  // Security defaults
  SECURITY_HEADERS_ENABLED: 'true'
} as const

/**
 * Validates that all required environment variables are present
 * @throws {Error} If any required environment variable is missing
 */
function validateRequiredEnvVars(): void {
  const missingVars: string[] = []

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missingVars.push(envVar)
    }
  }

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}\n` +
      'Please ensure these variables are set in your .env.local file or environment.'
    )
  }
}

/**
 * Validates JWT_SECRET meets security requirements
 * @param secret - The JWT secret to validate
 * @throws {Error} If the JWT secret doesn't meet security requirements
 */
function validateJWTSecret(secret: string): void {
  if (secret.length < 32) {
    throw new Error(
      'JWT_SECRET must be at least 32 characters long for security. ' +
      'Please generate a secure random string.'
    )
  }

  // Check if it's the default/example secret
  if (secret.includes('your-secret-key') || secret.includes('change-this')) {
    throw new Error(
      'JWT_SECRET appears to be a placeholder value. ' +
      'Please set a secure, randomly generated secret.'
    )
  }
}

/**
 * Gets and validates the environment configuration
 * @returns {EnvironmentConfig} Validated environment configuration
 * @throws {Error} If validation fails
 */
export function getEnvironmentConfig(): EnvironmentConfig {
  // Validate required environment variables
  validateRequiredEnvVars()

  const jwtSecret = process.env.JWT_SECRET!

  // Validate JWT secret security requirements
  validateJWTSecret(jwtSecret)

  return {
    JWT_SECRET: jwtSecret,
    NODE_ENV: process.env.NODE_ENV || optionalEnvVars.NODE_ENV,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || optionalEnvVars.NEXT_PUBLIC_BASE_URL,
    // Rate limiting configuration
    RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || optionalEnvVars.RATE_LIMIT_MAX_REQUESTS, 10),
    RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || optionalEnvVars.RATE_LIMIT_WINDOW_MS, 10),
    RATE_LIMIT_SKIP_SUCCESSFUL_REQUESTS: (process.env.RATE_LIMIT_SKIP_SUCCESSFUL_REQUESTS || optionalEnvVars.RATE_LIMIT_SKIP_SUCCESSFUL_REQUESTS) === 'true',
    // Security configuration
    SECURITY_HEADERS_ENABLED: (process.env.SECURITY_HEADERS_ENABLED || optionalEnvVars.SECURITY_HEADERS_ENABLED) === 'true'
  }
}

/**
 * Cached environment configuration
 * This is initialized once and reused to avoid repeated validation
 */
let cachedConfig: EnvironmentConfig | null = null

/**
 * Gets the validated environment configuration (cached)
 * @returns {EnvironmentConfig} Validated environment configuration
 */
export function getEnv(): EnvironmentConfig {
  if (!cachedConfig || process.env.NODE_ENV === 'test') {
    cachedConfig = getEnvironmentConfig()
  }
  return cachedConfig
}

/**
 * Clear the cached configuration (useful for testing)
 */
export function clearEnvCache(): void {
  cachedConfig = null
}

/**
 * Type-safe environment variable access
 */
export const env = {
  get JWT_SECRET() {
    return getEnv().JWT_SECRET
  },
  get NODE_ENV() {
    return getEnv().NODE_ENV
  },
  get NEXT_PUBLIC_BASE_URL() {
    return getEnv().NEXT_PUBLIC_BASE_URL
  },
  get RATE_LIMIT_MAX_REQUESTS() {
    return getEnv().RATE_LIMIT_MAX_REQUESTS
  },
  get RATE_LIMIT_WINDOW_MS() {
    return getEnv().RATE_LIMIT_WINDOW_MS
  },
  get RATE_LIMIT_SKIP_SUCCESSFUL_REQUESTS() {
    return getEnv().RATE_LIMIT_SKIP_SUCCESSFUL_REQUESTS
  },
  get SECURITY_HEADERS_ENABLED() {
    return getEnv().SECURITY_HEADERS_ENABLED
  },
  get isProduction() {
    return getEnv().NODE_ENV === 'production'
  },
  get isDevelopment() {
    return getEnv().NODE_ENV === 'development'
  }
}