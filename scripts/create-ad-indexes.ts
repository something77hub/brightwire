import { MongoClient } from 'mongodb'

// Run this once to create indexes for the advertisements collection
// Can be run via: npx tsx scripts/create-ad-indexes.ts

async function createIndexes() {
  const mongodbUri = process.env.MONGODB_URI
  if (!mongodbUri) {
    console.error('MONGODB_URI not set')
    process.exit(1)
  }

  const client = new MongoClient(mongodbUri)

  try {
    await client.connect()
    const db = client.db('brightwire')
    const ads = db.collection('advertisements')

    console.log('Creating indexes for advertisements collection...')

    // Index for fetching active ads by placement
    await ads.createIndex(
      { status: 1, placement: 1, startDate: 1, endDate: 1 },
      { name: 'active_ads_by_placement' }
    )

    // Index for category sponsors
    await ads.createIndex(
      { status: 1, placement: 1, sponsoredCategory: 1 },
      { name: 'category_sponsors' }
    )

    // Index for expiring ads
    await ads.createIndex(
      { status: 1, endDate: 1 },
      { name: 'ads_by_expiry' }
    )

    // Index for budget tracking
    await ads.createIndex(
      { status: 1, budget: 1, spent: 1 },
      { name: 'ads_by_budget' }
    )

    // Index for admin listing
    await ads.createIndex(
      { createdAt: -1 },
      { name: 'ads_by_created' }
    )

    console.log('✅ All indexes created successfully')

    // List all indexes
    const indexes = await ads.indexes()
    console.log('\nCurrent indexes:')
    indexes.forEach(idx => console.log(`  - ${idx.name}`))

  } catch (error) {
    console.error('Error creating indexes:', error)
  } finally {
    await client.close()
  }
}

createIndexes()
