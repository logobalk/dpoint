# Middleware Tests

This directory contains all middleware-related integration tests.

## Test Files

### `auth-middleware.integration.test.ts`
Tests for authentication middleware:
- Protected route access control
- Authentication redirects
- Public route accessibility
- Token validation in middleware
- Route protection logic

## Running Middleware Tests

```bash
# Run all middleware tests
npm test tests/middleware

# Run specific middleware test file
npm test tests/middleware/auth-middleware.integration.test.ts

# Run tests matching a pattern
npm test -- --testNamePattern="middleware" tests/middleware
```

## Test Coverage

The middleware tests cover:

1. **Route Protection**
   - Protected route access
   - Unauthorized redirects
   - Public route access
   - Authentication checks

2. **Token Validation**
   - Valid token handling
   - Invalid token rejection
   - Expired token handling
   - Missing token scenarios

3. **Redirect Logic**
   - Login redirects
   - Dashboard redirects
   - URL preservation
   - Error handling
