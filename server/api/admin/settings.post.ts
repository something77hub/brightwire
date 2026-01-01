
import { MongoClient } from 'mongodb'
import { requireAdminAuth } from '~/server/utils/admin-auth'

export default defineEventHandler(async (event) => {
  await requireAdminAuth(event)

  const body = await readBody(event)
  const { fetchInterval } = body

  const config = useRuntimeConfig()
  const client = new MongoClient(config.mongodbUri)

  try {
    await client.connect()
    const db = client.db('brightwire')
    const settings = db.collection('settings')

    if (fetchInterval) {
      await settings.updateOne(
        { key: 'fetch_interval_minutes' },
        { $set: { value: Number(fetchInterval), updatedAt: new Date() } },
        { upsert: true }
      )
    }

    return { success: true, message: 'Settings saved' }
  } catch (e: any) {
    throw createError({ statusCode: 500, message: e.message })
  } finally {
    await client.close()
  }
})
