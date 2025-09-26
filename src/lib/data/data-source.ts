/**
 * Data source factory and configuration
 * This module provides a centralized way to create and configure data repositories
 */

import { UserRepository, AuthService, DataSourceConfig } from './interfaces'
import { JsonUserRepository } from './json-user-repository'
import { createAuthService } from './auth-service'

/**
 * Data source factory class
 * Manages the creation and lifecycle of data repositories
 */
class DataSourceFactory {
  private userRepository: UserRepository | null = null
  private authService: AuthService | null = null
  private config: DataSourceConfig | null = null

  /**
   * Initialize the data source with configuration
   */
  initialize(config: DataSourceConfig): void {
    this.config = config
    this.userRepository = null // Reset to force recreation
    this.authService = null
  }

  /**
   * Get the user repository instance
   */
  getUserRepository(): UserRepository {
    if (!this.userRepository) {
      this.userRepository = this.createUserRepository()
    }
    return this.userRepository
  }

  /**
   * Get the authentication service instance
   */
  getAuthService(): AuthService {
    if (!this.authService) {
      this.authService = createAuthService(this.getUserRepository())
    }
    return this.authService
  }

  /**
   * Create user repository based on configuration
   */
  private createUserRepository(): UserRepository {
    const config = this.getConfig()

    switch (config.type) {
      case 'json':
        return new JsonUserRepository(config.filePath)
      
      case 'database':
        // Future implementation for database
        throw new Error('Database repository not yet implemented')
      
      case 'api':
        // Future implementation for API-based repository
        throw new Error('API repository not yet implemented')
      
      default:
        throw new Error(`Unsupported data source type: ${config.type}`)
    }
  }

  /**
   * Get current configuration or default
   */
  private getConfig(): DataSourceConfig {
    if (this.config) {
      return this.config
    }

    // Default configuration for JSON file storage
    return {
      type: 'json',
      filePath: process.env.USER_DATA_FILE || 'data/users.json',
    }
  }

  /**
   * Reset all instances (useful for testing)
   */
  reset(): void {
    this.userRepository = null
    this.authService = null
    this.config = null
  }

  /**
   * Health check for the data source
   */
  async healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; message: string }> {
    try {
      const userRepo = this.getUserRepository()
      
      // Try to perform a simple operation
      await userRepo.findMany({ isActive: true })
      
      return {
        status: 'healthy',
        message: 'Data source is operational'
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        message: `Data source error: ${error}`
      }
    }
  }
}

// Singleton instance
const dataSourceFactory = new DataSourceFactory()

/**
 * Get the singleton data source factory instance
 */
export function getDataSource(): DataSourceFactory {
  return dataSourceFactory
}

/**
 * Convenience functions for common operations
 */
export function getUserRepository(): UserRepository {
  return getDataSource().getUserRepository()
}

export function getAuthService(): AuthService {
  return getDataSource().getAuthService()
}

/**
 * Initialize data source with custom configuration
 */
export function initializeDataSource(config: DataSourceConfig): void {
  getDataSource().initialize(config)
}

/**
 * Default initialization for the application
 */
export function initializeDefaultDataSource(): void {
  const config: DataSourceConfig = {
    type: 'json',
    filePath: process.env.USER_DATA_FILE || 'data/users.json',
  }
  
  initializeDataSource(config)
}

// Auto-initialize with default configuration
initializeDefaultDataSource()
