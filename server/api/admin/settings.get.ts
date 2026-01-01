
import { MongoClient } from 'mongodb'
import { requireAdminAuth } from '~/server/utils/admin-auth'

export default defineEventHandler(async (event) => {
  await requireAdminAuth(event)

  const config = useRuntimeConfig()
  const client = new MongoClient(config.mongodbUri)

  try {
    await client.connect()
    const db = client.db('brightwire')
    const settings = db.collection('settings')

    // Get fetch interval, default to 60 minutes
    const intervalDoc = await settings.findOne({ key: 'fetch_interval_minutes' })
    const fetchInterval = intervalDoc?.value || 60

    return {
      fetchInterval
    }
  } catch (e: any) {
    throw createError({ statusCode: 500, message: e.message })
  } finally {
    await client.close()
  }
})
