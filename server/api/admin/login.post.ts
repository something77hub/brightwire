export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)
  
  if (!config.adminSecret) {
    throw createError({
      statusCode: 500,
      message: 'ADMIN_SECRET not configured in environment variables',
    })
  }
  
  if (body.password !== config.adminSecret) {
    throw createError({
      statusCode: 401,
      message: 'Invalid password',
    })
  }
  
  // Set auth cookie (httpOnly for security)
  setCookie(event, 'bw_admin_token', config.adminSecret, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })
  
  return { success: true }
})
