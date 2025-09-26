// Mock implementation of jose library for testing

interface JWTPayload {
  [key: string]: unknown
  exp?: number
}

interface JWTHeader {
  alg: string
  [key: string]: unknown
}

export class SignJWT {
  private payload: JWTPayload = {}
  private header: JWTHeader = { alg: 'HS256' }

  constructor(payload: JWTPayload) {
    this.payload = payload
  }

  setProtectedHeader(header: JWTHeader) {
    this.header = header
    return this
  }

  setIssuedAt() {
    return this
  }

  setExpirationTime(exp: number) {
    this.payload.exp = exp
    return this
  }

  async sign(): Promise<string> {
    // Create a simple mock JWT token
    const header = Buffer.from(JSON.stringify(this.header)).toString('base64url')
    const payload = Buffer.from(JSON.stringify(this.payload)).toString('base64url')
    const signature = 'mock-signature'
    return `${header}.${payload}.${signature}`
  }
}

interface JWTVerifyResult {
  payload: JWTPayload
  protectedHeader: JWTHeader
}

export async function jwtVerify(
  token: string
): Promise<JWTVerifyResult> {
  if (!token || token === 'invalid-token' || token === 'malformed.token.here') {
    throw new Error('Invalid token')
  }

  try {
    // Parse the mock JWT token
    const parts = token.split('.')
    if (parts.length !== 3) {
      throw new Error('Invalid token format')
    }

    // Check for tampered signature (if token ends with 'tampered123')
    if (token.endsWith('tampered123')) {
      throw new Error('Invalid signature')
    }

    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString()) as JWTPayload

    // Check if token is expired
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      throw new Error('Token expired')
    }

    return {
      payload,
      protectedHeader: { alg: 'HS256' },
    }
  } catch {
    throw new Error('Invalid token')
  }
}
