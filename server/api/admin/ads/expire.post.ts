import { MongoClient } from 'mongodb'
import { requireAdminAuth } from '~/server/utils/admin-auth'

// POST /api/admin/ads/expire
// Expires ads that have passed their end date or exceeded budget
export default defineEventHandler(async (event) => {
  requireAdminAuth(event)
  
  const config = useRuntimeConfig()
  const client = new MongoClient(config.mongodbUri)
  
  try {
    await client.connect()
    const db = client.db('brightwire')
    const ads = db.collection('advertisements')
    
    const now = new Date()
    
    // Expire ads past end date
    const expiredByDate = await ads.updateMany(
      {
        status: 'active',
        endDate: { $lt: now },
      },
      {
        $set: { 
          status: 'expired',
          updatedAt: now,
        },
      }
    )
    
    // Pause ads that exceeded budget (for CPM/CPC ads)
    const expiredByBudget = await ads.updateMany(
      {
        status: 'active',
        budget: { $exists: true, $ne: null },
        $expr: { $gte: ['$spent', '$budget'] },
      },
      {
        $set: { 
          status: 'paused',
          pauseReason: 'Budget depleted',
          updatedAt: now,
        },
      }
    )
    
    return {
      success: true,
      expiredByDate: expiredByDate.modifiedCount,
      pausedByBudget: expiredByBudget.modifiedCount,
      message: `Expired ${expiredByDate.modifiedCount} ads, paused ${expiredByBudget.modifiedCount} over budget`,
    }
  } finally {
    await client.close()
  }
})
