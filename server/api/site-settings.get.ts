import { MongoClient } from 'mongodb'

// Public endpoint - no auth required
// Returns only public site settings (no sensitive data)
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const client = new MongoClient(config.mongodbUri)
  
  try {
    await client.connect()
    const db = client.db('brightwire')
    const settings = db.collection('settings')
    
    const doc = await settings.findOne({ _id: 'site-settings' as any })
    
    // Return only public settings
    return {
      siteName: doc?.siteName || 'BrightWire',
      siteDescription: doc?.siteDescription || 'Your daily dose of positive news',
      siteUrl: doc?.siteUrl || config.public.siteUrl || 'https://brightwire.news',
      contactEmail: doc?.contactEmail || 'contact@brightwire.news',
      socialTwitter: doc?.socialTwitter || '',
      socialInstagram: doc?.socialInstagram || '',
      socialFacebook: doc?.socialFacebook || '',
      socialLinkedin: doc?.socialLinkedin || '',
      socialYoutube: doc?.socialYoutube || '',
      socialTiktok: doc?.socialTiktok || '',
    }
  } catch (error) {
    // Return defaults if DB fails
    return {
      siteName: 'BrightWire',
      siteDescription: 'Your daily dose of positive news',
      siteUrl: config.public.siteUrl || 'https://brightwire.news',
      contactEmail: 'contact@brightwire.news',
      socialTwitter: '',
      socialInstagram: '',
      socialFacebook: '',
      socialLinkedin: '',
      socialYoutube: '',
      socialTiktok: '',
    }
  } finally {
    await client.close()
  }
})
