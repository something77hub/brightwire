import { MongoClient } from 'mongodb'
import { requireAdminAuth } from '~/server/utils/admin-auth'

export default defineEventHandler(async (event) => {
  requireAdminAuth(event)
  
  const config = useRuntimeConfig()
  const body = await readBody(event)
  
  const client = new MongoClient(config.mongodbUri)
  
  try {
    await client.connect()
    const db = client.db('brightwire')
    const settings = db.collection('settings')
    
    await settings.updateOne(
      { _id: 'site-settings' as any },
      { 
        $set: {
          ...body,
          updatedAt: new Date(),
        }
      },
      { upsert: true }
    )
    
    return { success: true }
  } finally {
    await client.close()
  }
})
