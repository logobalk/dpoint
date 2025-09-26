/**
 * Script to set up initial users with hashed passwords
 * This script creates the initial user data file with secure password hashes
 */

import bcrypt from 'bcryptjs'
import fs from 'fs/promises'
import path from 'path'

interface User {
  id: string
  email: string
  name: string
  role: 'user' | 'admin'
  passwordHash: string
  createdAt: Date
  updatedAt: Date
  isActive: boolean
}

interface JsonUserData {
  users: User[]
  lastUpdated: string
}

async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return await bcrypt.hash(password, saltRounds)
}

async function setupUsers() {
  console.log('🔐 Setting up initial users with secure password hashes...')

  try {
    // Create the users with hashed passwords
    const now = new Date()
    
    const users: User[] = [
      {
        id: 'user_standard_001',
        email: 'user@scbtechx.io',
        name: 'Standard User',
        role: 'user',
        passwordHash: await hashPassword('TechX1234!'),
        createdAt: now,
        updatedAt: now,
        isActive: true,
      },
      {
        id: 'user_admin_001',
        email: 'admin@scbtechx.io',
        name: 'Admin User',
        role: 'admin',
        passwordHash: await hashPassword('TechX1234!'),
        createdAt: now,
        updatedAt: now,
        isActive: true,
      },
    ]

    const userData: JsonUserData = {
      users,
      lastUpdated: now.toISOString(),
    }

    // Ensure data directory exists
    const dataDir = path.join(process.cwd(), 'data')
    await fs.mkdir(dataDir, { recursive: true })

    // Write users to JSON file
    const filePath = path.join(dataDir, 'users.json')
    await fs.writeFile(filePath, JSON.stringify(userData, null, 2), 'utf-8')

    console.log('✅ Users created successfully!')
    console.log('📁 File location:', filePath)
    console.log('\n👥 Created users:')
    console.log('   📧 user@scbtechx.io (Standard User) - Password: TechX1234!')
    console.log('   📧 admin@scbtechx.io (Admin User) - Password: TechX1234!')
    console.log('\n🔒 Passwords are securely hashed with bcrypt (12 rounds)')
    
  } catch (error) {
    console.error('❌ Failed to setup users:', error)
    process.exit(1)
  }
}

// Run the setup if this script is executed directly
if (require.main === module) {
  setupUsers()
}

export { setupUsers }
