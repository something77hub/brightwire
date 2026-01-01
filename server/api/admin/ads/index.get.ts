import { MongoClient } from 'mongodb'
import { requireAdminAuth } from '~/server/utils/admin-auth'

export default defineEventHandler(async (event) => {
  requireAdminAuth(event)
  
  const query = getQuery(event)
  const status = query.status as string | undefined
  const type = query.type as string | undefined
  
  const config = useRuntimeConfig()
  const client = new MongoClient(config.mongodbUri)
  
  try {
    await client.connect()
    const db = client.db('brightwire')
    const ads = db.collection('advertisements')
    
    // Build filter
    const filter: Record<string, any> = {}
    if (status) filter.status = status
    if (type) filter.type = type
    
    const results = await ads
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray()
    
    // Calculate stats
    const stats = {
      total: results.length,
      active: results.filter(a => a.status === 'active').length,
      totalImpressions: results.reduce((sum, a) => sum + (a.impressions || 0), 0),
      totalClicks: results.reduce((sum, a) => sum + (a.clicks || 0), 0),
      totalRevenue: results.reduce((sum, a) => sum + (a.spent || 0), 0),
    }
    
    return { ads: results, stats }
  } finally {
    await client.close()
  }
})
