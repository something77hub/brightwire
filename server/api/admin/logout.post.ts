export default defineEventHandler(async (event) => {
  // Clear the auth cookie
  setCookie(event, 'bw_admin_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })
  
  return { success: true }
})
