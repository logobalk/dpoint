/**
 * Enhanced Session Security
 * Provides advanced security features to prevent MITM attacks and session hijacking
 */

import { NextRequest } from 'next/server'
import { SignJWT, jwtVerify } from 'jose'
import { env } from '../env'

const key = new TextEncoder().encode(env.JWT_SECRET)

/**
 * Enhanced session payload with security bindings
 */
export interface SecureSessionPayload {
  userId: string
  email: string
  name: string
  role: string
  roleId: string
  permissions: string[]
  expiresAt: Date
  // Security bindings
  ipAddress: string
  userAgent: string
  sessionId: string
  csrfToken: string
  // Session metadata
  createdAt: Date
  lastActivity: Date
  loginMethod: 'password' | 'sso' | 'api'
  [key: string]: unknown // JWT compatibility
}

/**
 * Session validation result
 */
export interface SessionValidationResult {
  valid: boolean
  session?: SecureSessionPayload
  reason?: string
  requiresReauth?: boolean
  suspicious?: boolean
}

/**
 * Security event types
 */
export enum SecurityEventType {
  SESSION_CREATED = 'session_created',
  SESSION_VALIDATED = 'session_validated',
  SESSION_INVALIDATED = 'session_invalidated',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  IP_MISMATCH = 'ip_mismatch',
  USER_AGENT_MISMATCH = 'user_agent_mismatch',
  CSRF_TOKEN_MISMATCH = 'csrf_token_mismatch',
  SESSION_EXPIRED = 'session_expired',
  CONCURRENT_SESSION = 'concurrent_session',
}

/**
 * Security event log entry
 */
export interface SecurityEvent {
  id: string
  type: SecurityEventType
  userId: string
  sessionId: string
  ipAddress: string
  userAgent: string
  timestamp: Date
  details: Record<string, unknown>
  severity: 'low' | 'medium' | 'high' | 'critical'
}

// In-memory storage for active sessions and security events
// In production, use Redis or database
const activeSessions = new Map<string, SecureSessionPayload>()
const securityEvents: SecurityEvent[] = []
const suspiciousIPs = new Map<string, Date>() // Store IP with timestamp for cleanup

/**
 * Generate a secure session ID
 */
export function generateSessionId(): string {
  return `sess_${Date.now()}_${Math.random().toString(36).substring(2, 18)}`
}

/**
 * Generate a CSRF token
 */
export function generateCSRFToken(): string {
  return `csrf_${Date.now()}_${Math.random().toString(36).substring(2, 18)}`
}

/**
 * Extract client information from request
 */
export function extractClientInfo(request: NextRequest): {
  ipAddress: string
  userAgent: string
} {
  // Get IP address (handle various proxy headers)
  const ipAddress =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    request.headers.get('cf-connecting-ip') ||
    '127.0.0.1'

  const userAgent = request.headers.get('user-agent') || 'Unknown'

  return { ipAddress, userAgent }
}

/**
 * Create a secure JWT token with enhanced security
 */
export async function createSecureToken(payload: SecureSessionPayload): Promise<string> {
  const { expiresAt, createdAt, lastActivity, ...jwtPayload } = payload

  return await new SignJWT({
    ...jwtPayload,
    // Convert dates to timestamps for JWT
    exp: Math.floor(expiresAt.getTime() / 1000),
    iat: Math.floor(createdAt.getTime() / 1000),
    lastActivity: Math.floor(lastActivity.getTime() / 1000),
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(Math.floor(expiresAt.getTime() / 1000))
    .sign(key)
}

/**
 * Verify and validate a secure JWT token
 */
export async function verifySecureToken(
  token: string,
  request: NextRequest
): Promise<SessionValidationResult> {
  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ['HS256'],
    })

    // Reconstruct session payload
    const session: SecureSessionPayload = {
      userId: payload.userId as string,
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as string,
      roleId: payload.roleId as string,
      permissions: payload.permissions as string[],
      expiresAt: new Date((payload.exp as number) * 1000),
      ipAddress: payload.ipAddress as string,
      userAgent: payload.userAgent as string,
      sessionId: payload.sessionId as string,
      csrfToken: payload.csrfToken as string,
      createdAt: new Date((payload.iat as number) * 1000),
      lastActivity: new Date((payload.lastActivity as number) * 1000),
      loginMethod: payload.loginMethod as 'password' | 'sso' | 'api',
    }

    // Validate session security
    return await validateSessionSecurity(session, request)
  } catch {
    return {
      valid: false,
      reason: 'Invalid or expired token',
    }
  }
}

/**
 * Validate session security (IP binding, user agent, etc.)
 */
export async function validateSessionSecurity(
  session: SecureSessionPayload,
  request: NextRequest
): Promise<SessionValidationResult> {
  const { ipAddress, userAgent } = extractClientInfo(request)
  const now = new Date()

  // Check if session is expired
  if (session.expiresAt < now) {
    await logSecurityEvent({
      type: SecurityEventType.SESSION_EXPIRED,
      userId: session.userId,
      sessionId: session.sessionId,
      ipAddress,
      userAgent,
      severity: 'low',
      details: { originalExpiry: session.expiresAt },
    })

    return {
      valid: false,
      reason: 'Session expired',
      requiresReauth: true,
    }
  }

  // Check IP address binding (allow some flexibility for mobile users)
  if (!isIPAddressValid(session.ipAddress, ipAddress)) {
    await logSecurityEvent({
      type: SecurityEventType.IP_MISMATCH,
      userId: session.userId,
      sessionId: session.sessionId,
      ipAddress,
      userAgent,
      severity: 'high',
      details: {
        originalIP: session.ipAddress,
        currentIP: ipAddress,
      },
    })

    return {
      valid: false,
      reason: 'IP address mismatch detected',
      requiresReauth: true,
      suspicious: true,
    }
  }

  // Check user agent (allow minor variations)
  if (!isUserAgentValid(session.userAgent, userAgent)) {
    await logSecurityEvent({
      type: SecurityEventType.USER_AGENT_MISMATCH,
      userId: session.userId,
      sessionId: session.sessionId,
      ipAddress,
      userAgent,
      severity: 'medium',
      details: {
        originalUserAgent: session.userAgent,
        currentUserAgent: userAgent,
      },
    })

    return {
      valid: false,
      reason: 'User agent mismatch detected',
      requiresReauth: true,
      suspicious: true,
    }
  }

  // Check for suspicious IP
  if (suspiciousIPs.has(ipAddress)) {
    await logSecurityEvent({
      type: SecurityEventType.SUSPICIOUS_ACTIVITY,
      userId: session.userId,
      sessionId: session.sessionId,
      ipAddress,
      userAgent,
      severity: 'critical',
      details: { reason: 'IP marked as suspicious' },
    })

    return {
      valid: false,
      reason: 'Access from suspicious IP address',
      requiresReauth: true,
      suspicious: true,
    }
  }

  // Update last activity
  session.lastActivity = now
  activeSessions.set(session.sessionId, session)

  await logSecurityEvent({
    type: SecurityEventType.SESSION_VALIDATED,
    userId: session.userId,
    sessionId: session.sessionId,
    ipAddress,
    userAgent,
    severity: 'low',
    details: {},
  })

  return {
    valid: true,
    session,
  }
}

/**
 * Check if IP address is valid (allows for reasonable changes)
 */
function isIPAddressValid(originalIP: string, currentIP: string): boolean {
  // Exact match
  if (originalIP === currentIP) return true

  // Allow localhost variations
  const localhostIPs = ['127.0.0.1', '::1', 'localhost']
  if (localhostIPs.includes(originalIP) && localhostIPs.includes(currentIP)) {
    return true
  }

  // Allow same subnet for IPv4 (e.g., 192.168.1.x)
  const originalParts = originalIP.split('.')
  const currentParts = currentIP.split('.')

  if (originalParts.length === 4 && currentParts.length === 4) {
    // Same first 3 octets (same subnet)
    return originalParts.slice(0, 3).join('.') === currentParts.slice(0, 3).join('.')
  }

  return false
}

/**
 * Check if user agent is valid (allows for minor variations)
 */
function isUserAgentValid(originalUA: string, currentUA: string): boolean {
  // Exact match
  if (originalUA === currentUA) return true

  // Extract browser and major version
  const extractBrowserInfo = (ua: string) => {
    const match = ua.match(/(Chrome|Firefox|Safari|Edge)\/(\d+)/)
    return match ? `${match[1]}/${match[2]}` : ua
  }

  const originalBrowser = extractBrowserInfo(originalUA)
  const currentBrowser = extractBrowserInfo(currentUA)

  return originalBrowser === currentBrowser
}

/**
 * Log a security event
 */
export async function logSecurityEvent(
  eventData: Omit<SecurityEvent, 'id' | 'timestamp'>
): Promise<void> {
  const event: SecurityEvent = {
    ...eventData,
    id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
    timestamp: new Date(),
  }

  securityEvents.push(event)

  // Keep only last 1000 events in memory
  if (securityEvents.length > 1000) {
    securityEvents.splice(0, securityEvents.length - 1000)
  }

  // Mark IP as suspicious if multiple high-severity events
  if (event.severity === 'high' || event.severity === 'critical') {
    const recentEvents = securityEvents.filter(
      e => e.ipAddress === event.ipAddress &&
           e.timestamp > new Date(Date.now() - 60 * 60 * 1000) && // Last hour
           (e.severity === 'high' || e.severity === 'critical')
    )

    if (recentEvents.length >= 3) {
      suspiciousIPs.set(event.ipAddress, new Date())
    }
  }

  // In production, send to monitoring system
  console.warn('Security Event:', event)
}

/**
 * Create a secure session
 */
export async function createSecureSession(
  userData: {
    userId: string
    email: string
    name: string
    role: string
    roleId: string
    permissions: string[]
  },
  request: NextRequest,
  loginMethod: 'password' | 'sso' | 'api' = 'password'
): Promise<{ session: SecureSessionPayload; token: string }> {
  const { ipAddress, userAgent } = extractClientInfo(request)
  const now = new Date()
  const sessionId = generateSessionId()
  const csrfToken = generateCSRFToken()

  const session: SecureSessionPayload = {
    ...userData,
    expiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days
    ipAddress,
    userAgent,
    sessionId,
    csrfToken,
    createdAt: now,
    lastActivity: now,
    loginMethod,
  }

  // Store active session
  activeSessions.set(sessionId, session)

  // Create JWT token
  const token = await createSecureToken(session)

  // Log session creation
  await logSecurityEvent({
    type: SecurityEventType.SESSION_CREATED,
    userId: userData.userId,
    sessionId,
    ipAddress,
    userAgent,
    severity: 'low',
    details: { loginMethod },
  })

  return { session, token }
}

/**
 * Invalidate a session
 */
export async function invalidateSession(
  sessionId: string,
  reason: string = 'User logout'
): Promise<void> {
  const session = activeSessions.get(sessionId)
  if (session) {
    activeSessions.delete(sessionId)

    await logSecurityEvent({
      type: SecurityEventType.SESSION_INVALIDATED,
      userId: session.userId,
      sessionId,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      severity: 'low',
      details: { reason },
    })
  }
}

/**
 * Force cleanup of all data structures to prevent memory leaks
 */
export function forceCleanupAll(): void {
  const sessionCount = activeSessions.size
  const eventCount = securityEvents.length
  const ipCount = suspiciousIPs.size

  activeSessions.clear()
  securityEvents.length = 0
  suspiciousIPs.clear()

  console.log(`Force cleanup completed: ${sessionCount} sessions, ${eventCount} events, ${ipCount} suspicious IPs cleared`)
}

/**
 * Invalidate all sessions for a user
 */
export async function invalidateAllUserSessions(
  userId: string,
  reason: string = 'Security measure'
): Promise<void> {
  const userSessions = Array.from(activeSessions.values()).filter(
    session => session.userId === userId
  )

  for (const session of userSessions) {
    await invalidateSession(session.sessionId, reason)
  }
}

/**
 * Get active sessions for a user
 */
export function getUserActiveSessions(userId: string): SecureSessionPayload[] {
  return Array.from(activeSessions.values()).filter(
    session => session.userId === userId
  )
}

/**
 * Get security events for a user
 */
export function getUserSecurityEvents(
  userId: string,
  limit: number = 50
): SecurityEvent[] {
  return securityEvents
    .filter(event => event.userId === userId)
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, limit)
}

/**
 * Validate CSRF token
 */
export function validateCSRFToken(
  sessionCSRFToken: string,
  requestCSRFToken: string
): boolean {
  return sessionCSRFToken === requestCSRFToken
}

/**
 * Clean up expired sessions and old data to prevent memory leaks
 */
export function cleanupExpiredSessions(): void {
  const now = new Date()
  const expiredSessions: string[] = []
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  // Clean up expired sessions
  for (const [sessionId, session] of activeSessions.entries()) {
    if (session.expiresAt < now) {
      expiredSessions.push(sessionId)
    }
  }

  for (const sessionId of expiredSessions) {
    activeSessions.delete(sessionId)
  }

  // Clean up old security events (keep only last 7 days)
  const validEvents = securityEvents.filter(event => event.timestamp > oneWeekAgo)
  securityEvents.length = 0
  securityEvents.push(...validEvents)

  // Clean up old suspicious IPs (remove after 24 hours)
  const expiredIPs: string[] = []
  for (const [ip, timestamp] of suspiciousIPs.entries()) {
    if (timestamp < oneDayAgo) {
      expiredIPs.push(ip)
    }
  }

  for (const ip of expiredIPs) {
    suspiciousIPs.delete(ip)
  }

  // Log cleanup statistics
  console.log(`Session cleanup completed: ${expiredSessions.length} sessions, ${securityEvents.length} events, ${suspiciousIPs.size} suspicious IPs`)
}

// Clean up expired sessions every 5 minutes (only in production)
let cleanupInterval: NodeJS.Timeout | null = null
let memoryCheckInterval: NodeJS.Timeout | null = null

export function startSessionCleanup(): void {
  if (process.env.NODE_ENV !== 'test' && !cleanupInterval) {
    cleanupInterval = setInterval(cleanupExpiredSessions, 5 * 60 * 1000)

    // Additional memory monitoring every 30 minutes
    memoryCheckInterval = setInterval(performMemoryCheck, 30 * 60 * 1000)
  }
}

export function stopSessionCleanup(): void {
  if (cleanupInterval) {
    clearInterval(cleanupInterval)
    cleanupInterval = null
  }

  if (memoryCheckInterval) {
    clearInterval(memoryCheckInterval)
    memoryCheckInterval = null
  }
}

/**
 * Perform aggressive memory cleanup if memory usage is high
 */
export function performMemoryCheck(): void {
  const sessionCount = activeSessions.size
  const eventCount = securityEvents.length
  const suspiciousIPCount = suspiciousIPs.size

  // If we have too many sessions or events, perform aggressive cleanup
  if (sessionCount > 10000 || eventCount > 5000 || suspiciousIPCount > 1000) {
    console.warn(`High memory usage detected: ${sessionCount} sessions, ${eventCount} events, ${suspiciousIPCount} suspicious IPs`)

    // Aggressive cleanup
    const now = new Date()
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
    const sixHoursAgo = new Date(now.getTime() - 6 * 60 * 60 * 1000)

    // Remove sessions older than 1 hour if they haven't been active
    const inactiveSessions: string[] = []
    for (const [sessionId, session] of activeSessions.entries()) {
      if (session.lastActivity < oneHourAgo) {
        inactiveSessions.push(sessionId)
      }
    }

    for (const sessionId of inactiveSessions) {
      activeSessions.delete(sessionId)
    }

    // Keep only last 6 hours of security events
    const recentEvents = securityEvents.filter(event => event.timestamp > sixHoursAgo)
    securityEvents.length = 0
    securityEvents.push(...recentEvents)

    // Clear suspicious IPs older than 6 hours
    const recentSuspiciousIPs = new Map<string, Date>()
    for (const [ip, timestamp] of suspiciousIPs.entries()) {
      if (timestamp > sixHoursAgo) {
        recentSuspiciousIPs.set(ip, timestamp)
      }
    }
    suspiciousIPs.clear()
    for (const [ip, timestamp] of recentSuspiciousIPs.entries()) {
      suspiciousIPs.set(ip, timestamp)
    }

    console.log(`Aggressive cleanup completed: ${inactiveSessions.length} inactive sessions removed`)
  }
}

/**
 * Get memory usage statistics
 */
export function getMemoryStats(): {
  activeSessions: number
  securityEvents: number
  suspiciousIPs: number
  estimatedMemoryUsage: string
} {
  const sessionCount = activeSessions.size
  const eventCount = securityEvents.length
  const suspiciousIPCount = suspiciousIPs.size

  // Rough estimation of memory usage
  const sessionMemory = sessionCount * 1024 // ~1KB per session
  const eventMemory = eventCount * 512 // ~512B per event
  const ipMemory = suspiciousIPCount * 64 // ~64B per IP
  const totalMemory = sessionMemory + eventMemory + ipMemory

  const formatBytes = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return {
    activeSessions: sessionCount,
    securityEvents: eventCount,
    suspiciousIPs: suspiciousIPCount,
    estimatedMemoryUsage: formatBytes(totalMemory)
  }
}

// Start cleanup automatically in non-test environments
if (process.env.NODE_ENV !== 'test') {
  startSessionCleanup()
}