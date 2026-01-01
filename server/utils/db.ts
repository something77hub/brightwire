import { MongoClient, Db, Collection } from 'mongodb'
import type { Story } from '~/types'

let client: MongoClient | null = null
let db: Db | null = null

export async function getDb(): Promise<Db> {
  if (db) return db

  const config = useRuntimeConfig()
  const uri = config.mongodbUri

  if (!uri) {
    throw new Error('MONGODB_URI environment variable is not set')
  }

  client = new MongoClient(uri)
  await client.connect()
  db = client.db('brightwire')

  // Create indexes for better query performance
  const stories = db.collection('stories')
  await stories.createIndex({ guid: 1 }, { unique: true })
  await stories.createIndex({ slug: 1 }, { unique: true })
  await stories.createIndex({ publishedAt: -1 })
  await stories.createIndex({ category: 1, publishedAt: -1 })
  await stories.createIndex({ score: -1 })
  await stories.createIndex({ featured: 1, publishedAt: -1 })
  await stories.createIndex({ tags: 1 })
  
  // Text index for search
  await stories.createIndex(
    { title: 'text', summary: 'text', content: 'text', tags: 'text' },
    { weights: { title: 10, summary: 5, tags: 3, content: 1 } }
  )

  console.log('✅ Connected to MongoDB')
  return db
}

export async function getStoriesCollection(): Promise<Collection<Story>> {
  const database = await getDb()
  return database.collection<Story>('stories')
}

export async function closeDb(): Promise<void> {
  if (client) {
    await client.close()
    client = null
    db = null
  }
}
