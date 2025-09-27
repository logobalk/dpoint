'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Icon } from '@/components/ui/Icon'
import Navbar from '@/components/Navbar'

export default function DashboardPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  // Redirect to login if user is not authenticated after loading
  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/login')
      } else if (user.role === 'admin') {
        router.push('/dashboard/admin')
      } else {
        router.push('/dashboard/employee')
      }
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-auth-bg flex items-center justify-center">
        <div className="glass-card rounded-2xl p-8 max-w-sm mx-4 text-center">
          <div className="w-16 h-16 gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Icon name="spinner" className="text-white" size="xl" spin />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading...</h3>
          <p className="text-gray-600 text-sm">Please wait while we load your D-WALLET</p>
        </div>
      </div>
    )
  }

  // Don't render dashboard if user is not authenticated
  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen gradient-auth-bg">
      <Navbar />

      {/* Main Dashboard Content */}
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8">

        {/* Welcome Section */}
        <section className="mb-8">
          <div className="text-center">
            {/* <h1 className="text-6xl font-bold gradient-text mb-4">
              Hello World
            </h1> */}
            {/* <p className="text-xl text-gray-600 mb-8">
              Welcome to D-WALLET, {user?.name || user?.email}!
            </p> */}
          </div>
        </section>

        {/* Dashboard Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">

          {/* Welcome Card */}
          <div className="glass-card rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
            <p className="text-xl text-gray-600 mb-8">
              Welcome to D-WALLET, {user?.name || user?.email}!
            </p>
          </div>

          {/* Design System Card */}
          {/* <div className="glass-card rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Icon name="palette" className="text-white" size="lg" />
              </div>
              <span className="text-blue-500 text-sm font-medium">Ready</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Design System</h3>
            <p className="text-gray-600 text-sm mb-4">
              Consistent design tokens and components are implemented.
            </p>
            <div className="flex items-center text-xs text-gray-500">
              <Icon name="code" className="text-blue-500 mr-1" size="sm" />
              <span>Tailwind + Custom Tokens</span>
            </div>
          </div> */}

          {/* Next.js Card */}
          {/* <div className="glass-card rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <Icon name="cog" className="text-white" size="lg" />
              </div>
              <span className="text-purple-500 text-sm font-medium">v15.5.2</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Next.js App</h3>
            <p className="text-gray-600 text-sm mb-4">
              Built with the latest Next.js App Router and TypeScript.
            </p>
            <div className="flex items-center text-xs text-gray-500">
              <Icon name="check-circle" className="text-purple-500 mr-1" size="sm" />
              <span>App Router + TypeScript</span>
            </div>
          </div> */}
        </section>

        {/* Getting Started Section */}
        {/* <section className="glass-card rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Getting Started</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">What&apos;s Included</h3>
              <ul className="space-y-3">
                <li className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <Icon name="check" className="text-green-600" size="sm" />
                  </div>
                  <span className="text-gray-700">JWT Authentication System</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <Icon name="check" className="text-green-600" size="sm" />
                  </div>
                  <span className="text-gray-700">Protected Routes & Middleware</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <Icon name="check" className="text-green-600" size="sm" />
                  </div>
                  <span className="text-gray-700">Design System & Components</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <Icon name="check" className="text-green-600" size="sm" />
                  </div>
                  <span className="text-gray-700">Responsive Layout</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Next Steps</h3>
              <ul className="space-y-3">
                <li className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-blue-600 text-sm font-medium">1</span>
                  </div>
                  <span className="text-gray-700">Customize the design tokens in <code className="bg-gray-100 px-2 py-1 rounded text-sm">globals.css</code></span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-blue-600 text-sm font-medium">2</span>
                  </div>
                  <span className="text-gray-700">Replace the mock authentication with your backend API</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-blue-600 text-sm font-medium">3</span>
                  </div>
                  <span className="text-gray-700">Add your application-specific pages and components</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-blue-600 text-sm font-medium">4</span>
                  </div>
                  <span className="text-gray-700">Configure environment variables for production</span>
                </li>
              </ul>
            </div>
          </div>
        </section> */}
      </main>
    </div>
  )
}
