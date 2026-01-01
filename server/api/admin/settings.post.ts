
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

    // 1. Save Fetch Interval (Keep separate as it's a system config)
    if (body.fetchInterval) {
      await settings.updateOne(
        { key: 'fetch_interval_minutes' },
        { $set: { value: Number(body.fetchInterval), updatedAt: new Date() } },
        { upsert: true }
      )
    }

    // 2. Save Site Settings (Single Doc)
    // We construct the update object dynamically to allow partial updates if needed,
    // but the UI sends everything.
    const updateData = {
      siteName: body.siteName,
      siteDescription: body.siteDescription,
      siteUrl: body.siteUrl,
      contactEmail: body.contactEmail,
      newsletterSuccessMessage: body.newsletterSuccessMessage,

      // Social
      socialTwitter: body.socialTwitter,
      socialFacebook: body.socialFacebook,
      socialInstagram: body.socialInstagram,
      socialLinkedin: body.socialLinkedin,
      socialYoutube: body.socialYoutube,
      socialTiktok: body.socialTiktok,

      updatedAt: new Date()
    }

    await settings.updateOne(
      { _id: 'site-settings' as any },
      { $set: updateData },
      { upsert: true }
    )

    return { success: true, message: 'Settings saved' }
  } catch (e: any) {
    throw createError({ statusCode: 500, message: e.message })
  } finally {
    await client.close()
  }
})
