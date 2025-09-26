import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faChevronDown,
  faSignOutAlt,
  faCheck,
  faList,
  faLock,
  faEnvelope,
  faEye,
  faEyeSlash,
  faSpinner,
  faSignInAlt,
  faCode,
  faCog,
  faCheckCircle,
  faUser,
  faShield,
  faPalette,
  faRocket
} from '@fortawesome/free-solid-svg-icons'
import { cn } from '@/lib/utils'

// Icon name mapping to FontAwesome icons
const iconMap = {
  // Navigation & UI
  'chevron-down': faChevronDown,
  'sign-out': faSignOutAlt,
  'sign-in': faSignInAlt,
  'user': faUser,
  
  // Form & Input
  'envelope': faEnvelope,
  'lock': faLock,
  'eye': faEye,
  'eye-slash': faEyeSlash,
  
  // Status & Feedback
  'check': faCheck,
  'check-circle': faCheckCircle,
  'spinner': faSpinner,
  
  // Features & Content
  'list': faList,
  'code': faCode,
  'cog': faCog,
  'shield': faShield,
  'palette': faPalette,
  'rocket': faRocket,
} as const

export type IconName = keyof typeof iconMap

export interface IconProps {
  name: IconName
  className?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  spin?: boolean
  color?: string
}

const sizeClasses = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4', 
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8',
  '2xl': 'w-12 h-12'
}

export const Icon: React.FC<IconProps> = ({ 
  name, 
  className, 
  size = 'md', 
  spin = false,
  color,
  ...props 
}) => {
  const icon = iconMap[name]
  
  if (!icon) {
    console.warn(`Icon "${name}" not found in iconMap`)
    return null
  }

  return (
    <FontAwesomeIcon
      icon={icon}
      className={cn(sizeClasses[size], className)}
      spin={spin}
      color={color}
      {...props}
    />
  )
}

export default Icon
