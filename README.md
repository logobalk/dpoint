# SCB Tech X - Web Starter Kit

A modern Next.js web application starter kit with authentication, design system, and best practices built-in. This starter kit provides a solid foundation for building scalable web applications with a consistent design system and secure authentication.

## ✨ Features

- **🔐 JWT Authentication System** - Secure authentication with Jose library
- **🎨 Design System** - Centralized design tokens and consistent UI components
- **🛡️ Protected Routes** - Middleware-based route protection
- **📱 Responsive Design** - Mobile-first responsive layout
- **🎭 Modern UI** - Glass morphism effects and gradient backgrounds
- **⚡ Next.js 15** - Latest Next.js with App Router and TypeScript
- **🧪 Testing Setup** - Jest and React Testing Library configured
- **🎯 TypeScript** - Full TypeScript support with strict configuration

## 🚀 Quick Start

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd techx-web-starter
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local and set a secure JWT_SECRET
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

5. **Login with demo credentials:**
   - Email: any valid email address
   - Password: `demo123`

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/auth/          # Authentication API routes
│   ├── dashboard/         # Protected dashboard page
│   ├── login/            # Login page
│   └── layout.tsx        # Root layout with AuthProvider
├── components/           # Reusable UI components
│   ├── ui/              # Base UI components (Button, Input, etc.)
│   └── Navbar.tsx       # Navigation component
├── contexts/            # React contexts
│   └── AuthContext.tsx  # Authentication context
├── lib/                # Utility functions
│   ├── auth.ts         # Authentication utilities
│   └── utils.ts        # General utilities and design tokens
└── __tests__/          # Test files
```

## 🎨 Design System

The starter kit includes a comprehensive design system with:

- **Color Palette**: Primary and secondary color scales
- **Typography**: Inter font family with consistent sizing
- **Components**: Pre-built UI components with variants
- **Icons**: FontAwesome icons with centralized Icon component
- **Gradients**: Beautiful gradient combinations
- **Glass Effects**: Modern glass morphism styling

### Design Tokens

All design tokens are centralized in `src/app/globals.css` and `src/lib/utils.ts`:

```css
/* Example design tokens */
--primary-500: #3b82f6;
--gradient-primary: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%);
--glass-bg: rgba(255, 255, 255, 0.8);
```

## 🔐 Authentication

The authentication system includes:

- **JWT-based authentication** using Jose library
- **Secure session management** with HTTP-only cookies
- **Protected routes** with middleware
- **Automatic redirects** for authenticated/unauthenticated users
- **Context-based state management** for client-side auth state

### Demo Credentials

For development and testing:
- **Email**: Any valid email format (e.g., `user@example.com`)
- **Password**: `demo123`

## 🧪 Testing

Run tests with:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 🛠️ Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm test            # Run tests
npm run test:watch  # Run tests in watch mode
npm run test:coverage # Run tests with coverage
```

## 🔧 Customization

### 1. Update Design Tokens

Modify the design system in `src/app/globals.css`:

```css
:root {
  --primary-500: #your-color;
  --gradient-primary: your-gradient;
}
```

### 2. Using Icons

The app uses FontAwesome icons through a centralized Icon component:

```tsx
import { Icon } from '@/components/ui/Icon'

// Basic usage
<Icon name="check" />

// With size and styling
<Icon name="spinner" size="lg" className="text-blue-500" spin />

// Available icons: check, spinner, envelope, lock, eye, eye-slash,
// chevron-down, sign-in, sign-out, user, shield, palette, rocket,
// code, cog, check-circle, list
```

### 3. Replace Mock Authentication

Update `src/lib/auth.ts` to integrate with your backend:

```typescript
export async function authenticate(email: string, password: string) {
  // Replace with your API call
  const response = await fetch('/api/your-auth-endpoint', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  return response.ok ? await response.json() : null;
}
```

### 3. Add Environment Variables

Create a `.env.local` file (or copy from `.env.local.example`):

```env
# REQUIRED: JWT Secret for authentication
# Generate with: openssl rand -base64 32
JWT_SECRET=your-super-secure-jwt-secret-key-at-least-32-characters-long

# OPTIONAL: Application base URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

**Security Note:** The JWT_SECRET must be at least 32 characters long and should be a cryptographically secure random string. The application will fail to start if this requirement is not met.

### 4. Customize Components

All UI components are in `src/components/ui/` and can be customized:

```typescript
// Example: Customize Button component
<Button variant="outline" size="lg">
  Custom Button
</Button>
```

## 📦 Built With

- **[Next.js 15](https://nextjs.org/)** - React framework with App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Jose](https://github.com/panva/jose)** - JWT library
- **[Radix UI](https://www.radix-ui.com/)** - Headless UI components
- **[Jest](https://jestjs.io/)** - Testing framework
- **[React Testing Library](https://testing-library.com/)** - Testing utilities

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Set environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

The app can be deployed to any platform that supports Next.js:

```bash
npm run build
npm run start
```

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

If you have any questions or need help, please open an issue in the repository.

---

**Happy coding! 🎉**
