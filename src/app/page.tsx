'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Icon } from '@/components/ui/Icon'

export default function Home() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        router.push('/dashboard')
      } else {
        router.push('/login')
      }
    }
  }, [user, isLoading, router])

  // Show loading while determining redirect
  return (
    <div className="min-h-screen gradient-auth-bg flex items-center justify-center">
      <div className="glass-card rounded-2xl p-8 max-w-sm mx-4 text-center">
        <div className="w-16 h-16 gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
          <Icon name="spinner" className="text-white" size="xl" spin />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading...</h3>
        <p className="text-gray-600 text-sm">Redirecting you to the right place</p>
      </div>
    </div>
  )
}
