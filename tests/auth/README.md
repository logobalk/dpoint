# Authentication Tests

This directory contains all authentication-related integration tests.

## Test Files

### `api-endpoints.integration.test.ts`
Tests for authentication API endpoints:
- `/api/auth/login` - Login functionality
- `/api/auth/me` - Session validation
- `/api/auth/logout` - Logout functionality
- Error handling and edge cases

### `flow.integration.test.ts`
End-to-end authentication flow tests:
- Complete login → session check → logout flow
- Session expiry handling
- Concurrent operations
- Security considerations

### `utils.integration.test.ts`
Tests for authentication utility functions:
- JWT token creation and verification
- Authentication status checking
- Redirect helpers
- Edge cases and error scenarios

## Running Auth Tests

```bash
# Run all auth tests
npm test tests/auth

# Run specific auth test file
npm test tests/auth/api-endpoints.integration.test.ts
npm test tests/auth/flow.integration.test.ts
npm test tests/auth/utils.integration.test.ts

# Run tests matching a pattern
npm test -- --testNamePattern="login" tests/auth
```

## Test Coverage

The authentication tests cover:

1. **API Endpoints**
   - Valid/invalid credentials
   - Session management
   - Error responses
   - Security headers

2. **Authentication Flow**
   - User login process
   - Session persistence
   - Logout cleanup
   - Token refresh

3. **Utility Functions**
   - Token operations
   - Authentication checks
   - Redirect logic
   - Error handling
