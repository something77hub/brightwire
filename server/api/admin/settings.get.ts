import { MongoClient } from 'mongodb'
import { requireAdminAuth } from '~/server/utils/admin-auth'

export default defineEventHandler(async (event) => {
  requireAdminAuth(event)
  
  const config = useRuntimeConfig()
  const client = new MongoClient(config.mongodbUri)
  
  try {
    await client.connect()
    const db = client.db('brightwire')
    const settings = db.collection('settings')
    
    const doc = await settings.findOne({ _id: 'site-settings' as any })
    
    return doc || {
      siteName: 'BrightWire',
      siteUrl: process.env.SITE_URL || 'https://brightwire.news',
      siteDescription: 'Your daily dose of positive news',
      defaultAuthor: 'Felix Utomi',
      contactEmail: 'contact@brightwire.news',
      socialTwitter: '',
      socialInstagram: '',
      socialFacebook: '',
      socialLinkedin: '',
      socialYoutube: '',
      socialTiktok: '',
      metaTitle: 'BrightWire - Good News Daily',
      metaDescription: 'Your daily source for positive, uplifting news stories from around the world.',
      ogImage: '',
    }
  } finally {
    await client.close()
  }
})
