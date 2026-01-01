import { requireAdminAuth } from '~/server/utils/admin-auth'

export default defineEventHandler(async (event) => {
  try {
    requireAdminAuth(event)
    return { authenticated: true }
  } catch {
    return { authenticated: false }
  }
})
