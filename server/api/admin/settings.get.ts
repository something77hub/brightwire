
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

    // Get all settings
    const allSettings = await settings.find({}).toArray()

    // Convert array of key/value pairs to object
    // { key: 'siteName', value: '...' } -> { siteName: '...' }
    const settingsMap = allSettings.reduce((acc, item) => {
      acc[item.key] = item.value
      return acc
    }, {} as Record<string, any>)

    return {
      fetchInterval: settingsMap.fetch_interval_minutes || 60,
      siteName: settingsMap.siteName || 'BrightWire',
      siteDescription: settingsMap.siteDescription || 'Good news daily - positive journalism that inspires.',
      siteUrl: settingsMap.siteUrl || '',
      newsletterSuccessMessage: settingsMap.newsletterSuccessMessage || "You're in! 🎉",
      social: settingsMap.social || {
        twitter: '',
        facebook: '',
        instagram: '',
        linkedin: ''
      },
      contactEmail: settingsMap.contactEmail || ''
    }
  } catch (e: any) {
    throw createError({ statusCode: 500, message: e.message })
  } finally {
    await client.close()
  }
})
