import { requireAdminAuth } from '~/server/utils/admin-auth'
import { getDb } from '~/server/utils/db'
import { mailerliteFetch, rateLimitDelay } from '~/server/utils/mailerlite'

export default defineEventHandler(async (event) => {
  requireAdminAuth(event)
  
  const body = await readBody(event)
  const { ids } = body // Array of subscriber IDs
  
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    throw createError({
      statusCode: 400,
      message: 'Subscriber IDs are required'
    })
  }
  
  if (!process.env.MAILERLITE_API_KEY) {
    throw createError({
      statusCode: 400,
      message: 'MailerLite API key not configured'
    })
  }
  
  const results = {
    deleted: 0,
    failed: 0,
    errors: [] as string[]
  }
  
  const BATCH_SIZE = 50
  
  // Process deletions in batches
  for (let i = 0; i < ids.length; i += BATCH_SIZE) {
    const batch = ids.slice(i, i + BATCH_SIZE)
    
    // Build batch request for deletions
    const batchRequests = batch.map(id => ({
      method: 'DELETE',
      path: `api/subscribers/${id}`,
    }))
    
    try {
      const response = await mailerliteFetch(
        'https://connect.mailerlite.com/api/batch',
        {
          method: 'POST',
          body: JSON.stringify({ requests: batchRequests }),
        }
      )
      
      const data = await response.json()
      
      // Process batch responses
      if (data.responses && Array.isArray(data.responses)) {
        data.responses.forEach((resp: any, idx: number) => {
          const id = batch[idx]
          
          if (resp.code === 200 || resp.code === 204) {
            results.deleted++
            
            // Remove from local DB (async, don't wait)
            getDb().then(db => {
              db.collection('subscribers').deleteOne({ mailerliteId: id }).catch(() => {})
            }).catch(() => {})
            
          } else {
            results.failed++
            results.errors.push(`${id}: ${resp.body?.message || `Error ${resp.code}`}`)
          }
        })
      }
    } catch (error: any) {
      // If batch fails, mark all as failed
      batch.forEach(id => {
        results.failed++
        results.errors.push(`${id}: ${error.message}`)
      })
    }
    
    // Delay between batches
    if (i + BATCH_SIZE < ids.length) {
      await rateLimitDelay()
    }
  }
  
  return {
    success: true,
    deleted: results.deleted,
    failed: results.failed,
    total: ids.length,
    errors: results.errors.slice(0, 5) // Only return first 5 errors
  }
})
