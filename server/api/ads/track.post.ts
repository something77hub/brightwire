import { MongoClient, ObjectId } from 'mongodb'

// Simple in-memory rate limiting (resets on server restart)
const trackingCache = new Map<string, number>()
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const MAX_TRACKS_PER_WINDOW = 10 // Max 10 tracks per IP per minute

// POST /api/ads/track
// Track impressions and clicks for ads
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { adId, action } = body // action: 'impression' | 'click'
  
  if (!adId || !action) {
    return { success: false, error: 'Missing parameters' }
  }
  
  if (!['impression', 'click'].includes(action)) {
    return { success: false, error: 'Invalid action' }
  }
  
  // Validate ObjectId format
  if (!ObjectId.isValid(adId)) {
    return { success: false, error: 'Invalid ad ID' }
  }
  
  // Simple rate limiting by IP
  const clientIP = getRequestHeader(event, 'x-forwarded-for') || 
                   getRequestHeader(event, 'x-real-ip') || 
                   'unknown'
  const cacheKey = `${clientIP}-${adId}`
  const now = Date.now()
  const lastTrack = trackingCache.get(cacheKey) || 0
  
  // Only rate limit impressions (clicks should always be tracked)
  if (action === 'impression') {
    if (now - lastTrack < RATE_LIMIT_WINDOW) {
      return { success: true } // Silently ignore duplicate impressions
    }
    trackingCache.set(cacheKey, now)
  }
  
  // Clean old cache entries periodically
  if (Math.random() < 0.01) { // 1% chance to clean
    const cutoff = now - RATE_LIMIT_WINDOW
    for (const [key, time] of trackingCache) {
      if (time < cutoff) trackingCache.delete(key)
    }
  }
  
  const config = useRuntimeConfig()
  const client = new MongoClient(config.mongodbUri)
  
  try {
    await client.connect()
    const db = client.db('brightwire')
    const ads = db.collection('advertisements')
    
    // First get the ad to check its pricing type
    const ad = await ads.findOne({ _id: new ObjectId(adId) })
    if (!ad) {
      return { success: false, error: 'Ad not found' }
    }
    
    // Skip if ad is not active
    if (ad.status !== 'active') {
      return { success: true }
    }
    
    // Increment the appropriate counter
    const field = action === 'click' ? 'clicks' : 'impressions'
    const updateOps: any = {
      $inc: { [field]: 1 },
      $set: { updatedAt: new Date() },
    }
    
    // Calculate spend based on pricing type
    if (action === 'impression' && ad.priceType === 'cpm') {
      // CPM = cost per 1000 impressions
      const costPerImpression = (ad.priceAmount || 0) / 1000
      updateOps.$inc.spent = costPerImpression
    } else if (action === 'click' && ad.priceType === 'cpc') {
      // CPC = cost per click
      updateOps.$inc.spent = ad.priceAmount || 0
    }
    
    await ads.updateOne(
      { _id: new ObjectId(adId) },
      updateOps
    )
    
    // Check if budget exceeded and auto-pause
    if (ad.budget && ad.priceType !== 'fixed') {
      const currentSpent = (ad.spent || 0) + (updateOps.$inc.spent || 0)
      if (currentSpent >= ad.budget) {
        await ads.updateOne(
          { _id: new ObjectId(adId) },
          { $set: { status: 'paused', pauseReason: 'Budget depleted' } }
        )
      }
    }
    
    return { success: true }
  } catch (error) {
    console.error('Ad tracking error:', error)
    return { success: false }
  } finally {
    await client.close()
  }
})
