# Integration Tests

This directory contains comprehensive integration tests for the application, organized by feature area.

## Test Structure

### Directory Organization

- **`auth/`** - Authentication-related tests
  - `api-endpoints.integration.test.ts` - Authentication API endpoints
  - `flow.integration.test.ts` - End-to-end authentication flows
  - `utils.integration.test.ts` - Authentication utility functions
- **`middleware/`** - Middleware tests
  - `auth-middleware.integration.test.ts` - Authentication middleware and route protection
- **`__mocks__/`** - Mock implementations for testing
  - `jose.ts` - JWT library mock
- **`setup.ts`** - Global test setup and configuration

### Test Coverage

The tests cover:

1. **API Endpoints**
   - Login with valid/invalid credentials
   - Session validation
   - Logout functionality
   - Error handling and edge cases

2. **Middleware**
   - Protected route access control
   - Authentication redirects
   - Public route accessibility
   - Token validation in middleware

3. **Authentication Flow**
   - Complete login → session check → logout flow
   - Session expiry handling
   - Concurrent operations
   - Security considerations

4. **Utility Functions**
   - JWT token creation and verification
   - Authentication status checking
   - Redirect helpers
   - Edge cases and error scenarios

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Run tests with coverage
```bash
npm run test:coverage
```

### Run tests by category
```bash
# Run all authentication tests
npm test tests/auth

# Run all middleware tests
npm test tests/middleware
```

### Run specific test file
```bash
npm test tests/auth/api-endpoints.integration.test.ts
npm test tests/middleware/auth-middleware.integration.test.ts
```

### Run tests matching a pattern
```bash
npm test -- --testNamePattern="login"
```

## Test Environment

- **Environment**: Jest with jsdom
- **Mocking**: Next.js cookies and server components are mocked
- **JWT Secret**: Uses test-specific JWT secret
- **Base URL**: Set to `http://localhost:3000` for tests

## Key Testing Patterns

### 1. API Route Testing
```typescript
const request = new NextRequest('http://localhost:3000/api/auth/login', {
  method: 'POST',
  body: JSON.stringify({ email, password }),
  headers: { 'Content-Type': 'application/json' },
})

const response = await loginPOST(request)
const data = await response.json()
```

### 2. Middleware Testing
```typescript
const request = new NextRequest('http://localhost:3000/dashboard', {
  method: 'GET',
  headers: { Cookie: `session=${token}` },
})

const response = await middleware(request)
```

### 3. Session Token Testing
```typescript
const sessionPayload: SessionPayload = {
  userId: '1',
  email: 'test@example.com',
  name: 'Test User',
  role: 'user',
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
}
const token = await createToken(sessionPayload)
const verified = await verifyToken(token)
```

## Mock Strategy

The tests use comprehensive mocking for:

- **Next.js cookies**: Mocked to capture cookie operations
- **Console methods**: Suppressed during tests to reduce noise
- **Environment variables**: Set to test-appropriate values
- **NextResponse.redirect**: Mocked to capture redirect behavior

## Security Testing

The tests include security-focused scenarios:

- Invalid token handling
- Expired token rejection
- Malformed request handling
- Sensitive information exposure prevention
- Concurrent operation safety

## Performance Testing

Basic performance tests are included for:

- Concurrent token operations
- Rapid authentication checks
- Multiple session validations

## Debugging Tests

To debug failing tests:

1. Check the console output for specific error messages
2. Use `--verbose` flag for detailed test output
3. Add `console.log` statements in test files (they won't be suppressed)
4. Use Jest's `--detectOpenHandles` to find hanging operations

## Adding New Tests

When adding new authentication features:

1. Add corresponding tests to the appropriate test file
2. Follow the existing patterns for mocking and assertions
3. Include both success and failure scenarios
4. Test edge cases and error conditions
5. Update this README if new test patterns are introduced

## Test Data

The tests use consistent test data:

- **Demo password**: `demo123` (matches the mock authentication)
- **Test emails**: Various formats including special characters
- **User roles**: `user`, `admin`, `super-admin`
- **Token expiry**: Typically 7 days for valid tokens, past dates for expired tokens
