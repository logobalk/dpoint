'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Icon } from '@/components/ui/Icon'
import { useAuth } from '@/contexts/AuthContext'


export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    // Basic validation
    if (!email || !password) {
      setError('Please fill in all required fields.')
      setIsLoading(false)
      return
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address.')
      setIsLoading(false)
      return
    }

    try {
      const result = await login(email, password)
      
      if (result.success) {
        router.push('/dashboard')
      } else {
        setError(result.error || 'Login failed')
      }
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex gradient-auth-bg">
      {/* Left Side - Branding & Visual */}
      <div className="hidden lg:flex lg:w-1/2 gradient-auth-brand relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>

        {/* Decorative Elements */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-xl animate-float"></div>
        <div className="absolute bottom-40 right-20 w-24 h-24 bg-white/10 rounded-full blur-lg animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-white/5 rounded-full blur-md animate-float" style={{ animationDelay: '2s' }}></div>

        {/* Content - Centered */}
        <div className="relative z-10 flex flex-col justify-center items-center w-full text-white px-12">
          {/* Logo - Centered */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Image
                src="/logo.png"
                alt="SCB Tech X Logo"
                width={48}
                height={48}
                className="rounded-lg"
              />
            </div>
            <h1 className="text-4xl font-bold">SCB Tech X</h1>
            <p className="text-blue-100 mt-2">Web Starter Kit</p>
          </div>

          {/* Features List */}
          <div className="space-y-6 max-w-md">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Icon name="rocket" size="lg" />
              </div>
              <div>
                <h3 className="font-semibold">Modern Architecture</h3>
                <p className="text-blue-100 text-sm">Built with Next.js and TypeScript</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Icon name="palette" size="lg" />
              </div>
              <div>
                <h3 className="font-semibold">Design System</h3>
                <p className="text-blue-100 text-sm">Consistent UI components and tokens</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Icon name="shield" size="lg" />
              </div>
              <div>
                <h3 className="font-semibold">Secure Authentication</h3>
                <p className="text-blue-100 text-sm">JWT-based authentication system</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 lg:px-8">
        <div className="w-full max-w-md">

          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex items-center justify-center mx-auto mb-4">
              <Image
                src="/logo.png"
                alt="SCB Tech X Logo"
                width={64}
                height={64}
                className="rounded-2xl"
              />
            </div>
            <h1 className="text-2xl font-bold gradient-text">SCB Tech X</h1>
          </div>

          {/* Login Form */}
          <div className="glass-card rounded-3xl p-8">
            
            {/* Form Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h2>
              <p className="text-gray-600">Sign in to your account</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Email/Password Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Icon name="envelope" className="text-gray-400" size="md" />
                  </div>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="pl-10"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Icon name="lock" className="text-gray-400" size="md" />
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    className="pl-10 pr-12"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <Icon
                      name={showPassword ? "eye-slash" : "eye"}
                      className="text-gray-400 hover:text-gray-600"
                      size="md"
                    />
                  </button>
                </div>
              </div>

              {/* Sign In Button */}
              <Button 
                type="submit" 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Icon name="spinner" className="-ml-1 mr-3 text-white" size="md" spin />
                    Signing in...
                  </>
                ) : (
                  <>
                    <Icon name="sign-in" className="mr-2" size="md" />
                    Sign in to your account
                  </>
                )}
              </Button>
            </form>


          </div>
        </div>
      </div>
    </div>
  )
}
