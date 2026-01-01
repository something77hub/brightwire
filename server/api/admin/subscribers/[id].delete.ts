import { requireAdminAuth } from '~/server/utils/admin-auth'
import { getDb } from '~/server/utils/db'
import { mailerliteFetch } from '~/server/utils/mailerlite'

export default defineEventHandler(async (event) => {
  requireAdminAuth(event)
  
  const id = getRouterParam(event, 'id')
  
  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Subscriber ID is required'
    })
  }
  
  if (!process.env.MAILERLITE_API_KEY) {
    throw createError({
      statusCode: 400,
      message: 'MailerLite API key not configured'
    })
  }
  
  try {
    // Delete from MailerLite
    const response = await mailerliteFetch(
      `https://connect.mailerlite.com/api/subscribers/${id}`,
      { method: 'DELETE' }
    )
    
    if (!response.ok && response.status !== 204) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.message || 'Failed to delete subscriber')
    }
    
    // Also remove from local DB if exists
    try {
      const db = await getDb()
      await db.collection('subscribers').deleteOne({ mailerliteId: id })
    } catch (e) {
      // Ignore DB errors
    }
    
    return {
      success: true,
      message: 'Subscriber deleted successfully'
    }
  } catch (error: any) {
    console.error('Failed to delete subscriber:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to delete subscriber'
    })
  }
})
