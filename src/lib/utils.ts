import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Design token utilities
export const designTokens = {
  colors: {
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
    },
    secondary: {
      50: '#fdf4ff',
      100: '#fae8ff',
      200: '#f5d0fe',
      300: '#f0abfc',
      400: '#e879f9',
      500: '#d946ef',
      600: '#c026d3',
      700: '#a21caf',
      800: '#86198f',
      900: '#701a75',
    }
  },
  gradients: {
    primary: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%)',
    authBg: 'linear-gradient(135deg, #dbeafe 0%, #fae8ff 50%, #fce7f3 100%)',
    authBrand: 'linear-gradient(135deg, #2563eb 0%, #8b5cf6 50%, #ec4899 100%)',
    text: 'linear-gradient(135deg, #2563eb 0%, #8b5cf6 100%)',
  },
  shadows: {
    glass: '0 8px 32px rgba(31, 38, 135, 0.37)',
    card: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  }
}

// Common component class combinations
export const componentStyles = {
  glassCard: 'bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-xl',
  gradientButton: 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium transition-all duration-200 transform hover:scale-[1.02]',
  inputField: 'block w-full px-3 py-3 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200',
  navButton: 'px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer',
  iconContainer: 'w-12 h-12 rounded-xl flex items-center justify-center',
}
