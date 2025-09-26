import { NextRequest, NextResponse } from 'next/server'
import { applySecurityHeaders } from '@/lib/security-headers'
import { withAuthorization } from '@/lib/middleware'
import { createCSRFProtectedResponse } from '@/lib/security'
import { getMemoryStats, performMemoryCheck, forceCleanupAll } from '@/lib/security/session-security'
import { Permission } from '@/lib/permissions'

/**
 * GET /api/admin/system/memory - Get memory usage statistics
 * Requires ADMIN_API_ACCESS permission
 */
export const GET = withAuthorization(
  async (_request: NextRequest, session) => {
    try {
      const memoryStats = getMemoryStats()
      
      // Add Node.js memory usage if available
      const nodeMemory = process.memoryUsage()
      
      return createCSRFProtectedResponse(
        {
          sessionMemory: memoryStats,
          nodeMemory: {
            rss: `${(nodeMemory.rss / 1024 / 1024).toFixed(1)} MB`,
            heapTotal: `${(nodeMemory.heapTotal / 1024 / 1024).toFixed(1)} MB`,
            heapUsed: `${(nodeMemory.heapUsed / 1024 / 1024).toFixed(1)} MB`,
            external: `${(nodeMemory.external / 1024 / 1024).toFixed(1)} MB`,
          },
          timestamp: new Date().toISOString(),
        },
        { status: 200 },
        session.csrfToken
      )
    } catch (error) {
      console.error('Error fetching memory stats:', error)
      return applySecurityHeaders(NextResponse.json(
        { error: 'Failed to fetch memory statistics' },
        { status: 500 }
      ))
    }
  },
  {
    requiredPermissions: Permission.ADMIN_API_ACCESS,
    requireCSRF: false, // GET requests don't need CSRF
  }
)

/**
 * POST /api/admin/system/memory - Perform memory cleanup
 * Requires ADMIN_API_ACCESS permission
 */
export const POST = withAuthorization(
  async (request: NextRequest, session) => {
    try {
      const body = await request.json()
      const { action } = body

      let result: { message: string; action: string } = { message: '', action: '' }

      switch (action) {
        case 'cleanup':
          performMemoryCheck()
          result = { message: 'Memory cleanup performed', action: 'cleanup' }
          break
          
        case 'force-cleanup':
          forceCleanupAll()
          result = { message: 'Force cleanup performed - all session data cleared', action: 'force-cleanup' }
          break
          
        default:
          return createCSRFProtectedResponse(
            { error: 'Invalid action. Use "cleanup" or "force-cleanup"' },
            { status: 400 },
            session.csrfToken
          )
      }

      const memoryStats = getMemoryStats()
      
      return createCSRFProtectedResponse(
        {
          ...result,
          memoryStats,
          timestamp: new Date().toISOString(),
        },
        { status: 200 },
        session.csrfToken
      )
    } catch (error) {
      console.error('Error performing memory cleanup:', error)
      return applySecurityHeaders(NextResponse.json(
        { error: 'Failed to perform memory cleanup' },
        { status: 500 }
      ))
    }
  },
  {
    requiredPermissions: Permission.ADMIN_API_ACCESS,
    requireCSRF: true,
  }
)
