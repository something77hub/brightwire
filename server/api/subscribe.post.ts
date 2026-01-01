import { getDb } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email } = body

  if (!email || !email.includes('@')) {
    throw createError({
      statusCode: 400,
      message: 'Valid email is required',
    })
  }

  const normalizedEmail = email.toLowerCase().trim()
  const apiKey = process.env.MAILERLITE_API_KEY
  const groupId = process.env.MAILERLITE_GROUP_ID
  const emailableApiKey = process.env.EMAILABLE_API_KEY

  // Step 1: Check if email already exists in our database
  try {
    const db = await getDb()
    const subscribers = db.collection('subscribers')
    
    const existing = await subscribers.findOne({ email: normalizedEmail })
    if (existing) {
      return {
        success: true,
        message: 'You\'re already subscribed! Check your inbox for our latest updates.',
      }
    }
  } catch (dbError) {
    console.error('[Newsletter] DB check failed:', dbError)
    // Continue - Mailerlite will also catch duplicates
  }

  // Step 2: Verify email with Emailable (if configured and working)
  if (emailableApiKey) {
    try {
      const verifyUrl = `https://api.emailable.com/v1/verify?email=${encodeURIComponent(normalizedEmail)}&api_key=${emailableApiKey}`
      const verifyResponse = await fetch(verifyUrl)
      
      if (!verifyResponse.ok) {
        // API failed - log but continue (don't block subscription)
        console.error(`[Newsletter] Emailable API error: ${verifyResponse.status} - continuing without verification`)
      } else {
        const verifyData = await verifyResponse.json()
        console.log(`[Newsletter] Emailable response for ${normalizedEmail}:`, JSON.stringify(verifyData))
        
        // Get the state - Emailable returns: deliverable, undeliverable, risky, unknown
        const state = verifyData.state
        
        // Block undeliverable emails
        if (state === 'undeliverable') {
          console.log(`[Newsletter] Rejected ${normalizedEmail} - state: ${state}`)
          throw createError({
            statusCode: 400,
            message: 'This email address does not exist. Please check and try again.',
          })
        }
        
        // Reject disposable/temporary emails even if deliverable
        if (verifyData.disposable === true) {
          console.log(`[Newsletter] Rejected disposable email: ${normalizedEmail}`)
          throw createError({
            statusCode: 400,
            message: 'Disposable email addresses are not allowed. Please use a permanent email.',
          })
        }
        
        // Allow risky/unknown - they might still work
        if (state === 'risky' || state === 'unknown') {
          console.log(`[Newsletter] Allowing ${state} email: ${normalizedEmail}`)
        }
        
        console.log(`[Newsletter] Email verified: ${normalizedEmail} (${state})`)
      }
    } catch (error: any) {
      // If it's our validation error, rethrow it
      if (error.statusCode) throw error
      
      // If Emailable API completely fails, log and continue
      console.error('[Newsletter] Emailable verification failed:', error.message, '- continuing without verification')
    }
  }

  // Step 3: Add to Mailerlite
  if (!apiKey) {
    console.log(`[Newsletter] New subscriber (Mailerlite not configured): ${normalizedEmail}`)
    return {
      success: true,
      message: 'Thanks for subscribing! You\'ll receive our daily good news soon.',
    }
  }

  try {
    const response = await fetch(
      'https://connect.mailerlite.com/api/subscribers',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          email: normalizedEmail,
          groups: groupId ? [groupId] : [],
          status: 'active',
        }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      console.error('Mailerlite error:', data)
      
      // Handle already subscribed case
      if (response.status === 409 || data?.message?.includes('already')) {
        return {
          success: true,
          message: 'You\'re already subscribed! Check your inbox for our latest updates.',
        }
      }
      
      throw new Error(data?.message || 'Subscription failed')
    }

    // Step 4: Save to our database for duplicate tracking
    try {
      const db = await getDb()
      const subscribers = db.collection('subscribers')
      
      await subscribers.insertOne({
        email: normalizedEmail,
        subscribedAt: new Date(),
        source: 'website',
        mailerliteId: data.data?.id,
      })
    } catch (dbError) {
      console.error('[Newsletter] Failed to save subscriber to DB:', dbError)
      // Don't fail - they're already in Mailerlite
    }

    console.log(`[Newsletter] ✅ New subscriber: ${normalizedEmail}`)

    return {
      success: true,
      message: 'Welcome aboard! You\'ll receive our daily good news soon.',
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('Newsletter subscription error:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to subscribe. Please try again.',
    })
  }
})
