'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
    <div className="min-h-screen flex bg-gray-50">
      {/* Left Side - Branding & Visual */}
      <div className="hidden lg:flex lg:w-1/2 gradient-bg relative overflow-hidden">
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
              <i className="fa-solid fa-wallet text-white text-3xl"></i>
            </div>
            <h1 className="text-4xl font-bold">D-Wallet</h1>
            <p className="text-white/80 mt-2">Digital Wallet Platform</p>
          </div>

          {/* Features List */}
          <div className="space-y-6 max-w-md">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <i className="fa-solid fa-heart text-white text-lg"></i>
              </div>
              <div>
                <h3 className="font-semibold">Digital Transfers</h3>
                <p className="text-white/80 text-sm">Send digital currency to colleagues</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <i className="fa-solid fa-gift text-white text-lg"></i>
              </div>
              <div>
                <h3 className="font-semibold">Reward System</h3>
                <p className="text-white/80 text-sm">Redeem wallet points for amazing rewards</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <i className="fa-solid fa-chart-line text-white text-lg"></i>
              </div>
              <div>
                <h3 className="font-semibold">Wallet Analytics</h3>
                <p className="text-white/80 text-sm">Track transactions and wallet performance</p>
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
            <div className="w-16 h-16 gradient-bg rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fa-solid fa-wallet text-white text-2xl"></i>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">D-Wallet</h1>
            <p className="text-gray-600 text-sm">Recognition Platform</p>
          </div>

          {/* Login Form */}
          <div className="bg-white card-shadow rounded-3xl p-8">

            {/* Form Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h2>
              <p className="text-gray-600">Sign in to your account</p>
            </div>

            {/* Demo Credentials */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <h3 className="text-sm font-semibold text-blue-800 mb-2">Demo Credentials</h3>
              <div className="space-y-2 text-xs text-blue-700">
                <div>
                  <strong>Employee:</strong> employee@dwallet.demo / Employee123!
                </div>
                <div>
                  <strong>Admin:</strong> admin@dwallet.demo / Admin123!
                </div>
              </div>
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
