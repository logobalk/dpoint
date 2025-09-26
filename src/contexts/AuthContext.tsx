'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@/lib/auth'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [csrfToken, setCsrfToken] = useState<string | null>(null)

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const userData = await response.json()
        const csrfTokenFromHeader = response.headers.get('X-CSRF-Token')
        setUser(userData)
        setCsrfToken(csrfTokenFromHeader)
      } else {
        // If auth check fails, clear user state
        setUser(null)
        setCsrfToken(null)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      // If auth check fails, clear user state
      setUser(null)
      setCsrfToken(null)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        setUser(data.user)
        setCsrfToken(data.csrfToken) // Store CSRF token from login response
        return { success: true }
      } else {
        return { success: false, error: data.error || 'Login failed' }
      }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: 'Network error occurred' }
    }
  }

  const logout = async () => {
    try {
      // Include CSRF token in logout request
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }

      if (csrfToken) {
        headers['X-CSRF-Token'] = csrfToken
      }

      await fetch('/api/auth/logout', {
        method: 'POST',
        headers,
      })

      // Clear user state and CSRF token
      setUser(null)
      setCsrfToken(null)
      window.location.href = '/login'
    } catch (error) {
      console.error('Logout error:', error)
      // Force logout even if API call fails
      setUser(null)
      setCsrfToken(null)
      window.location.href = '/login'
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
