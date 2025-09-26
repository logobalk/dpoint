import React from 'react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarImage, AvatarFallback } from './Avatar';

interface HeaderProps {
  title: string;
  subtitle?: string;
  leftIcon?: React.ReactNode;
  rightContent?: React.ReactNode;
  onLeftIconClick?: () => void;
  className?: string;
  variant?: 'default' | 'gradient';
  showAvatar?: boolean;
  avatarSrc?: string;
  avatarFallback?: string;
  showNotification?: boolean;
  notificationCount?: number;
  onNotificationClick?: () => void;
  onAvatarClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  leftIcon,
  rightContent,
  onLeftIconClick,
  className,
  variant = 'gradient',
  showAvatar = true,
  avatarSrc,
  avatarFallback,
  showNotification = true,
  notificationCount,
  onNotificationClick,
  onAvatarClick,
}) => {
  const headerClasses = cn(
    'px-6 pt-12 pb-6 text-white relative',
    variant === 'gradient' ? 'gradient-bg' : 'bg-white text-gray-800',
    className
  );

  const textColor = variant === 'gradient' ? 'text-white' : 'text-gray-800';
  const subtitleColor = variant === 'gradient' ? 'text-white/80' : 'text-gray-500';

  return (
    <div className={headerClasses}>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          {leftIcon && (
            <button
              onClick={onLeftIconClick}
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center transition-colors',
                variant === 'gradient' 
                  ? 'bg-white/20 hover:bg-white/30' 
                  : 'bg-gray-100 hover:bg-gray-200'
              )}
            >
              {leftIcon}
            </button>
          )}
          <div>
            <h1 className={cn('text-xl font-bold', textColor)}>{title}</h1>
            {subtitle && (
              <p className={cn('text-sm', subtitleColor)}>{subtitle}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {rightContent}
          
          {showNotification && (
            <button
              onClick={onNotificationClick}
              className={cn(
                'relative w-8 h-8 rounded-full flex items-center justify-center transition-colors',
                variant === 'gradient' 
                  ? 'bg-white/20 hover:bg-white/30' 
                  : 'bg-gray-100 hover:bg-gray-200'
              )}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-5 5v-5zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                />
              </svg>
              {notificationCount && notificationCount > 0 && (
                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {notificationCount > 99 ? '99+' : notificationCount}
                </div>
              )}
            </button>
          )}
          
          {showAvatar && (
            <button onClick={onAvatarClick}>
              <Avatar size="sm" className={cn(
                'border-2 transition-colors',
                variant === 'gradient' ? 'border-white/30' : 'border-gray-200'
              )}>
                <AvatarImage src={avatarSrc} />
                <AvatarFallback>{avatarFallback || 'U'}</AvatarFallback>
              </Avatar>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export { Header };
