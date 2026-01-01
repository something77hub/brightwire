import { requireAdminAuth } from '~/server/utils/admin-auth'
import { getDb } from '~/server/utils/db'
import { mailerliteFetch, rateLimitDelay } from '~/server/utils/mailerlite'

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default defineEventHandler(async (event) => {
  requireAdminAuth(event)
  
  const body = await readBody(event)
  const { emails } = body // Can be string (text) or array
  
  if (!emails) {
    throw createError({
      statusCode: 400,
      message: 'Emails are required'
    })
  }
  
  const groupId = process.env.MAILERLITE_GROUP_ID
  
  if (!process.env.MAILERLITE_API_KEY) {
    throw createError({
      statusCode: 400,
      message: 'MailerLite API key not configured'
    })
  }
  
  // Parse emails - handle both string and array
  let emailList: string[] = []
  
  if (typeof emails === 'string') {
    // Split by newlines, commas, semicolons, or spaces
    emailList = emails
      .split(/[\n,;\s]+/)
      .map(e => e.toLowerCase().trim())
      .filter(e => e.length > 0)
  } else if (Array.isArray(emails)) {
    emailList = emails.map(e => e.toLowerCase().trim())
  }
  
  // Validate and dedupe
  const validEmails: string[] = []
  const invalidEmails: string[] = []
  const seen = new Set<string>()
  
  for (const email of emailList) {
    if (seen.has(email)) continue
    seen.add(email)
    
    if (emailRegex.test(email)) {
      validEmails.push(email)
    } else {
      invalidEmails.push(email)
    }
  }
  
  if (validEmails.length === 0) {
    throw createError({
      statusCode: 400,
      message: 'No valid emails found'
    })
  }
  
  // Add subscribers using batch endpoint (max 50 per batch)
  const results = {
    added: [] as string[],
    existing: [] as string[],
    failed: [] as { email: string; error: string }[],
  }
  
  const BATCH_SIZE = 50
  
  for (let i = 0; i < validEmails.length; i += BATCH_SIZE) {
    const batch = validEmails.slice(i, i + BATCH_SIZE)
    
    // Build batch request
    const batchRequests = batch.map(email => ({
      method: 'POST',
      path: 'api/subscribers',
      body: {
        email,
        groups: groupId ? [groupId] : [],
        status: 'active',
      }
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
          const email = batch[idx]
          
          if (resp.code === 200 || resp.code === 201) {
            results.added.push(email)
            
            // Save to local DB (async, don't wait)
            getDb().then(db => {
              db.collection('subscribers').updateOne(
                { email },
                {
                  $set: {
                    email,
                    subscribedAt: new Date(),
                    source: 'admin-bulk',
                    mailerliteId: resp.body?.data?.id,
                  }
                },
                { upsert: true }
              ).catch(() => {})
            }).catch(() => {})
            
          } else if (resp.code === 409 || resp.body?.message?.includes('already')) {
            results.existing.push(email)
          } else {
            results.failed.push({ email, error: resp.body?.message || `Error ${resp.code}` })
          }
        })
      }
    } catch (error: any) {
      // If batch fails, mark all emails in batch as failed
      batch.forEach(email => {
        results.failed.push({ email, error: error.message })
      })
    }
    
    // Delay between batches to respect rate limits
    if (i + BATCH_SIZE < validEmails.length) {
      await rateLimitDelay()
    }
  }
  
  return {
    success: true,
    total: validEmails.length,
    added: results.added.length,
    existing: results.existing.length,
    failed: results.failed.length,
    invalid: invalidEmails.length,
    details: {
      added: results.added,
      existing: results.existing,
      failed: results.failed,
      invalid: invalidEmails,
    }
  }
})
