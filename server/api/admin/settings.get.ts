
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
    // Get main settings doc
    const doc = await settings.findOne({ _id: 'site-settings' as any }) || {}

    // Get independent fetch interval setting (or could merge into doc later)
    const intervalDoc = await settings.findOne({ key: 'fetch_interval_minutes' })

    return {
      // Config
      fetchInterval: intervalDoc?.value || 60,

      // General
      siteName: doc.siteName || 'BrightWire',
      siteDescription: doc.siteDescription || 'Good news daily - positive journalism that inspires.',
      siteUrl: doc.siteUrl || '',
      contactEmail: doc.contactEmail || '',
      newsletterSuccessMessage: doc.newsletterSuccessMessage || "You're in! 🎉",

      // Social (Flat structure to match site-settings.get.ts)
      socialTwitter: doc.socialTwitter || '',
      socialFacebook: doc.socialFacebook || '',
      socialInstagram: doc.socialInstagram || '',
      socialLinkedin: doc.socialLinkedin || '',
      socialYoutube: doc.socialYoutube || '',
      socialTiktok: doc.socialTiktok || ''
    }
  } catch (e: any) {
    throw createError({ statusCode: 500, message: e.message })
  } finally {
    await client.close()
  }
})
