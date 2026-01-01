import type { H3Event } from 'h3'

export function requireAdminAuth(event: H3Event) {
  const config = useRuntimeConfig()
  
  if (!config.adminSecret) {
    throw createError({
      statusCode: 500,
      message: 'ADMIN_SECRET not configured',
    })
  }
  
  // Check cookie
  const token = getCookie(event, 'bw_admin_token')
  
  // Also check Authorization header for API calls
  const authHeader = getHeader(event, 'authorization')
  const headerToken = authHeader?.replace('Bearer ', '')
  
  if (token !== config.adminSecret && headerToken !== config.adminSecret) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized - Please login at /admin/login',
    })
  }
  
  return true
}
