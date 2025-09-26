# D-Point Design System Documentation

## Overview

The D-Point design system provides a comprehensive set of design tokens, components, and guidelines for building consistent user interfaces across the D-Point peer recognition platform.

## Design Tokens

### Colors

#### Primary Colors
- **Primary 50**: `#f0f4ff` - Lightest primary shade
- **Primary 100**: `#e0e7ff` - Very light primary
- **Primary 200**: `#c7d2fe` - Light primary
- **Primary 300**: `#a5b4fc` - Medium light primary
- **Primary 400**: `#818cf8` - Medium primary
- **Primary 500**: `#6366f1` - Base primary color
- **Primary 600**: `#4f46e5` - Medium dark primary
- **Primary 700**: `#4338ca` - Dark primary
- **Primary 800**: `#3730a3` - Very dark primary
- **Primary 900**: `#312e81` - Darkest primary

#### Secondary Colors
- **Secondary 50**: `#faf5ff` - Lightest secondary shade
- **Secondary 100**: `#f3e8ff` - Very light secondary
- **Secondary 200**: `#e9d5ff` - Light secondary
- **Secondary 300**: `#d8b4fe` - Medium light secondary
- **Secondary 400**: `#c084fc` - Medium secondary
- **Secondary 500**: `#a855f7` - Base secondary color
- **Secondary 600**: `#9333ea` - Medium dark secondary
- **Secondary 700**: `#7c3aed` - Dark secondary
- **Secondary 800**: `#6b21a8` - Very dark secondary
- **Secondary 900**: `#581c87` - Darkest secondary

#### Accent Colors
- **Accent 50**: `#fdf4ff` - Lightest accent shade
- **Accent 100**: `#fae8ff` - Very light accent
- **Accent 200**: `#f5d0fe` - Light accent
- **Accent 300**: `#f0abfc` - Medium light accent
- **Accent 400**: `#e879f9` - Medium accent
- **Accent 500**: `#d946ef` - Base accent color
- **Accent 600**: `#c026d3` - Medium dark accent
- **Accent 700**: `#a21caf` - Dark accent
- **Accent 800**: `#86198f` - Very dark accent
- **Accent 900**: `#701a75` - Darkest accent

### Gradients

#### Primary Gradient
```css
background: linear-gradient(135deg, #6B46C1 0%, #8B5CF6 50%, #A78BFA 100%);
```

#### Glass Effect Gradient
```css
background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%);
```

### Typography

#### Font Family
- **Primary**: Inter, system-ui, sans-serif
- **Monospace**: 'Fira Code', 'Courier New', monospace

#### Font Sizes
- **xs**: 0.75rem (12px)
- **sm**: 0.875rem (14px)
- **base**: 1rem (16px)
- **lg**: 1.125rem (18px)
- **xl**: 1.25rem (20px)
- **2xl**: 1.5rem (24px)
- **3xl**: 1.875rem (30px)
- **4xl**: 2.25rem (36px)

#### Font Weights
- **normal**: 400
- **medium**: 500
- **semibold**: 600
- **bold**: 700

### Spacing

#### Scale
- **1**: 0.25rem (4px)
- **2**: 0.5rem (8px)
- **3**: 0.75rem (12px)
- **4**: 1rem (16px)
- **5**: 1.25rem (20px)
- **6**: 1.5rem (24px)
- **8**: 2rem (32px)
- **10**: 2.5rem (40px)
- **12**: 3rem (48px)
- **16**: 4rem (64px)
- **20**: 5rem (80px)
- **24**: 6rem (96px)

### Shadows

#### Card Shadow
```css
box-shadow: 0 4px 20px rgba(107, 70, 193, 0.15);
```

#### Glass Shadow
```css
box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);
```

#### Elevation Shadows
- **sm**: `0 1px 2px 0 rgba(0, 0, 0, 0.05)`
- **md**: `0 4px 6px -1px rgba(0, 0, 0, 0.1)`
- **lg**: `0 10px 15px -3px rgba(0, 0, 0, 0.1)`
- **xl**: `0 20px 25px -5px rgba(0, 0, 0, 0.1)`

### Border Radius

- **sm**: 0.375rem (6px)
- **md**: 0.5rem (8px)
- **lg**: 0.75rem (12px)
- **xl**: 1rem (16px)
- **2xl**: 1.5rem (24px)
- **full**: 9999px

## Component Library

### Button

#### Variants
- **primary**: Main action button with gradient background
- **secondary**: Secondary action with white background
- **outline**: Outlined button with transparent background
- **ghost**: Minimal button with hover effects
- **success**: Green gradient for positive actions
- **warning**: Orange gradient for caution actions
- **error**: Red gradient for destructive actions
- **link**: Text-only button with underline

#### Sizes
- **sm**: Small button (32px height)
- **md**: Medium button (40px height)
- **lg**: Large button (56px height)
- **icon**: Square icon button (40x40px)

#### Usage
```tsx
import { Button } from '@/components/ui/Button';

<Button variant="primary" size="lg" fullWidth>
  Send Coins
</Button>
```

### Card

#### Variants
- **default**: Standard white card with shadow
- **glass**: Semi-transparent card with backdrop blur
- **gradient**: Card with gradient background
- **outline**: Card with border only
- **elevated**: Card with enhanced shadow

#### Padding Options
- **none**: No padding
- **sm**: Small padding (12px)
- **md**: Medium padding (16px)
- **lg**: Large padding (24px)
- **xl**: Extra large padding (32px)

#### Usage
```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

<Card variant="glass" padding="lg" hover="lift">
  <CardHeader>
    <CardTitle>Wallet Balance</CardTitle>
  </CardHeader>
  <CardContent>
    <p>1,247 Points</p>
  </CardContent>
</Card>
```

### Avatar

#### Sizes
- **sm**: 32px
- **md**: 40px
- **lg**: 48px
- **xl**: 64px
- **2xl**: 80px

#### Usage
```tsx
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/Avatar';

<Avatar size="lg">
  <AvatarImage src="/avatar.jpg" />
  <AvatarFallback>AT</AvatarFallback>
</Avatar>
```

### Badge

#### Variants
- **default**: Primary colored badge
- **secondary**: Gray colored badge
- **success**: Green colored badge
- **warning**: Yellow colored badge
- **error**: Red colored badge
- **outline**: Outlined badge
- **gradient**: Gradient background badge

#### Usage
```tsx
import { Badge } from '@/components/ui/Badge';

<Badge variant="success" size="sm">
  Active
</Badge>
```

### Input

#### Features
- Built-in validation states
- Icon support (left and right)
- Error and helper text
- Multiple sizes
- Full width option

#### Usage
```tsx
import { Input } from '@/components/ui/Input';

<Input
  type="email"
  placeholder="Enter your email"
  leftIcon={<i className="fa-solid fa-envelope"></i>}
  error="Please enter a valid email"
/>
```

## Layout Components

### Header

#### Features
- Gradient background support
- Avatar integration
- Notification badge
- Back navigation
- Customizable content

#### Usage
```tsx
import { Header } from '@/components/ui/Header';

<Header
  title="D-Point"
  subtitle="Recognition Platform"
  variant="gradient"
  showAvatar={true}
  showNotification={true}
  notificationCount={3}
/>
```

### Bottom Navigation

#### Features
- Mobile-optimized
- Badge support
- Active state management
- Icon integration

#### Usage
```tsx
import { BottomNavigation } from '@/components/ui/BottomNavigation';

const navigationItems = [
  { id: 'home', label: 'Home', icon: <i className="fa-solid fa-house"></i> },
  { id: 'give', label: 'Give', icon: <i className="fa-solid fa-paper-plane"></i> },
];

<BottomNavigation
  items={navigationItems}
  activeItem="home"
  onItemClick={handleNavigation}
/>
```

### Floating Action Button

#### Features
- Fixed positioning options
- Multiple sizes
- Gradient support
- Hover animations

#### Usage
```tsx
import { FloatingActionButton } from '@/components/ui/FloatingActionButton';

<FloatingActionButton
  icon={<i className="fa-solid fa-plus"></i>}
  position="bottom-right"
  onClick={handleAction}
/>
```

## Utility Classes

### Background Gradients
- `.gradient-bg`: Primary gradient background
- `.gradient-auth-bg`: Authentication page gradient
- `.gradient-text`: Gradient text effect

### Shadows
- `.card-shadow`: Standard card shadow
- `.glass-shadow`: Glass effect shadow

### Animations
- `.hover:scale-105`: Slight scale on hover
- `.transition-all`: Smooth transitions
- `.animate-pulse`: Pulsing animation
- `.animate-spin`: Spinning animation

## Best Practices

### Color Usage
1. Use primary colors for main actions and branding
2. Use secondary colors for supporting elements
3. Use accent colors sparingly for highlights
4. Maintain sufficient contrast ratios (4.5:1 minimum)

### Typography
1. Use consistent font sizes from the scale
2. Maintain proper line heights (1.4-1.6)
3. Use font weights purposefully
4. Ensure readability on all backgrounds

### Spacing
1. Use consistent spacing from the scale
2. Maintain visual hierarchy with spacing
3. Use white space effectively
4. Ensure touch targets are at least 44px

### Components
1. Use semantic HTML elements
2. Ensure keyboard accessibility
3. Provide proper ARIA labels
4. Test with screen readers

### Mobile Responsiveness
1. Design mobile-first
2. Use appropriate touch targets
3. Optimize for thumb navigation
4. Test on various screen sizes

## Implementation Notes

### CSS Variables
All design tokens are available as CSS custom properties:
```css
:root {
  --color-primary-500: #6366f1;
  --color-secondary-500: #a855f7;
  --gradient-primary: linear-gradient(135deg, #6B46C1 0%, #8B5CF6 50%, #A78BFA 100%);
  --shadow-card: 0 4px 20px rgba(107, 70, 193, 0.15);
}
```

### Tailwind Integration
Design tokens are integrated with Tailwind CSS configuration for seamless usage:
```javascript
// tailwind.config.ts
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: designTokens.colors.primary,
        secondary: designTokens.colors.secondary,
      },
    },
  },
};
```

### TypeScript Support
All components include full TypeScript definitions for better development experience and type safety.
