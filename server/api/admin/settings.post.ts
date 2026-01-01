
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

    // List of keys to save and their types
    const keys = [
      { key: 'fetch_interval_minutes', val: Number(body.fetchInterval) },
      { key: 'siteName', val: body.siteName },
      { key: 'siteDescription', val: body.siteDescription },
      { key: 'siteUrl', val: body.siteUrl },
      { key: 'newsletterSuccessMessage', val: body.newsletterSuccessMessage },
      { key: 'social', val: body.social },
      { key: 'contactEmail', val: body.contactEmail }
    ]

    for (const item of keys) {
      if (item.val !== undefined) {
        await settings.updateOne(
          { key: item.key },
          { $set: { value: item.val, updatedAt: new Date() } },
          { upsert: true }
        )
      }
    }

    return { success: true, message: 'Settings saved' }
  } catch (e: any) {
    throw createError({ statusCode: 500, message: e.message })
  } finally {
    await client.close()
  }
})
