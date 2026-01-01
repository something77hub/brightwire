import { MongoClient } from 'mongodb'
import { requireAdminAuth } from '~/server/utils/admin-auth'
import type { Advertisement } from '~/types'

export default defineEventHandler(async (event) => {
  requireAdminAuth(event)
  
  const body = await readBody(event)
  
  // Validation
  const errors: string[] = []
  
  if (!body.name?.trim()) errors.push('Ad name is required')
  if (!body.advertiser?.trim()) errors.push('Advertiser name is required')
  if (!body.type) errors.push('Ad type is required')
  if (!body.placement) errors.push('Placement is required')
  if (!body.linkUrl?.trim()) errors.push('Link URL is required')
  if (!body.contactName?.trim()) errors.push('Contact name is required')
  if (!body.contactEmail?.trim()) errors.push('Contact email is required')
  if (!body.startDate) errors.push('Start date is required')
  if (!body.endDate) errors.push('End date is required')
  
  // Validate URL format
  if (body.linkUrl && !isValidUrl(body.linkUrl)) {
    errors.push('Link URL must be a valid URL')
  }
  if (body.imageUrl && !isValidUrl(body.imageUrl)) {
    errors.push('Image URL must be a valid URL')
  }
  
  // Validate email format
  if (body.contactEmail && !isValidEmail(body.contactEmail)) {
    errors.push('Contact email must be a valid email')
  }
  
  // Validate dates
  const startDate = new Date(body.startDate)
  const endDate = new Date(body.endDate)
  if (endDate < startDate) {
    errors.push('End date must be after start date')
  }
  
  // Validate pricing
  if (body.priceAmount && body.priceAmount < 0) {
    errors.push('Price amount cannot be negative')
  }
  if (body.budget && body.budget < 0) {
    errors.push('Budget cannot be negative')
  }
  
  if (errors.length > 0) {
    throw createError({ 
      statusCode: 400, 
      message: errors.join(', ')
    })
  }
  
  const config = useRuntimeConfig()
  const client = new MongoClient(config.mongodbUri)
  
  try {
    await client.connect()
    const db = client.db('brightwire')
    const ads = db.collection('advertisements')
    
    const ad: Omit<Advertisement, '_id'> = {
      name: body.name.trim(),
      advertiser: body.advertiser.trim(),
      type: body.type,
      placement: body.placement,
      status: body.status || 'draft',
      
      headline: body.headline?.trim() || '',
      description: body.description?.trim() || '',
      imageUrl: body.imageUrl?.trim() || '',
      linkUrl: body.linkUrl.trim(),
      ctaText: body.ctaText?.trim() || 'Learn More',
      
      articleSlug: body.articleSlug?.trim() || undefined,
      sponsoredCategory: body.sponsoredCategory || undefined,
      sponsorText: body.sponsorText?.trim() || undefined,
      
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
      
      targetCategories: body.targetCategories || [],
      
      priceType: body.priceType || 'fixed',
      priceAmount: parseFloat(body.priceAmount) || 0,
      budget: body.budget ? parseFloat(body.budget) : undefined,
      spent: 0,
      
      impressions: 0,
      clicks: 0,
      
      contactName: body.contactName.trim(),
      contactEmail: body.contactEmail.trim().toLowerCase(),
      
      createdAt: new Date(),
      updatedAt: new Date(),
      notes: body.notes?.trim() || '',
    }
    
    const result = await ads.insertOne(ad)
    
    return { 
      success: true, 
      id: result.insertedId,
      message: 'Advertisement created successfully'
    }
  } finally {
    await client.close()
  }
})

function isValidUrl(string: string): boolean {
  try {
    new URL(string)
    return true
  } catch {
    return false
  }
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}
