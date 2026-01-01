import { requireAdminAuth } from '~/server/utils/admin-auth'
import { getDb } from '~/server/utils/db'
import { mailerliteFetch, rateLimitDelay } from '~/server/utils/mailerlite'

export default defineEventHandler(async (event) => {
  requireAdminAuth(event)
  
  if (!process.env.MAILERLITE_API_KEY) {
    throw createError({
      statusCode: 400,
      message: 'MailerLite API key not configured'
    })
  }
  
  let deleted = 0
  let failed = 0
  let hasMore = true
  const BATCH_SIZE = 50
  
  // Paginate through all subscribers and delete them in batches
  while (hasMore) {
    try {
      // Fetch a batch of subscribers
      const response = await mailerliteFetch(
        `https://connect.mailerlite.com/api/subscribers?limit=${BATCH_SIZE}`
      )
      
      if (!response.ok) {
        throw new Error('Failed to fetch subscribers')
      }
      
      const data = await response.json()
      const subscribers = data.data || []
      
      if (subscribers.length === 0) {
        hasMore = false
        break
      }
      
      // Build batch delete request
      const batchRequests = subscribers.map((sub: any) => ({
        method: 'DELETE',
        path: `api/subscribers/${sub.id}`,
      }))
      
      const batchResponse = await mailerliteFetch(
        'https://connect.mailerlite.com/api/batch',
        {
          method: 'POST',
          body: JSON.stringify({ requests: batchRequests }),
        }
      )
      
      const batchData = await batchResponse.json()
      
      // Count results
      if (batchData.responses && Array.isArray(batchData.responses)) {
        batchData.responses.forEach((resp: any) => {
          if (resp.code === 200 || resp.code === 204) {
            deleted++
          } else {
            failed++
          }
        })
      }
      
      // Check if there are more pages
      hasMore = data.meta?.next_cursor ? true : false
      
      // Safety limit - don't delete more than 10000 in one request
      if (deleted + failed >= 10000) {
        hasMore = false
      }
      
      // Small delay between batches
      await rateLimitDelay()
      
    } catch (error) {
      console.error('Error during bulk delete:', error)
      hasMore = false
    }
  }
  
  // Clear local DB subscribers
  try {
    const db = await getDb()
    await db.collection('subscribers').deleteMany({})
  } catch (e) {
    // Ignore DB errors
  }
  
  return {
    success: true,
    deleted,
    failed,
    message: `Deleted ${deleted} subscribers${failed > 0 ? `, ${failed} failed` : ''}`
  }
})
