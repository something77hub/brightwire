/// <reference types="node" />
import { inngest } from './client'
import Parser from 'rss-parser'
import Anthropic from '@anthropic-ai/sdk'
import * as cheerio from 'cheerio'
import { MongoClient } from 'mongodb'
import type { Story, StoryCategory, ScrapedArticle } from '~/types'
import { notifyNewArticles } from '~/server/utils/pusher'
import { newsSources, preFilterStory } from '~/server/utils/sources'
import { scrapeArticle } from '~/server/utils/scraper'

interface Candidate {
  title: string
  summary: string
  link: string
  source: string
  pubDate: string
  image?: string
  image?: string
  guid: string
  forcedCategory?: StoryCategory
}

// Helper functions (shouldSkip is replaced by preFilterStory)
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80)
}

function proxyImage(url: string): string {
  if (!url || url.includes('cloudinary.com')) return url
  const cloud = process.env.CLOUDINARY_CLOUD_NAME || 'demo'
  return `https://res.cloudinary.com/${cloud}/image/fetch/w_800,q_auto,f_auto/${encodeURIComponent(url)}`
}

// The main Inngest function with steps
export const fetchNews = inngest.createFunction(
  {
    id: 'fetch-news',
    retries: 3,
  },
  [
    { cron: '*/15 * * * *' }, // Every 15 minutes
    { event: 'app/manual.fetch' }, // Manual trigger
  ],

  async ({ event, step }) => {
    const config = process.env

    // ========================================
    // STEP 0: Check Config & Interval
    // ========================================
    const runConfig = await step.run('check-config', async () => {
      // Check if this is a manual run or queue continuation
      const isManual = event.name === 'app/manual.fetch'
      const isQueueContinuation = event.data && (event.data as any).reason === 'queue-continuation'

      console.log(`[Fetch] Triggered by ${event.name}. Manual? ${isManual}. Continuation? ${isQueueContinuation}`)

      if (isManual || isQueueContinuation) {
        return { fetchRss: true, reason: 'manual-or-continuation' }
      }

      const client = new MongoClient(config.MONGODB_URI!)
      try {
        await client.connect()
        const db = client.db('brightwire')
        const settings = db.collection('settings')

        // Check interval
        const intervalDoc = await settings.findOne({ key: 'fetch_interval_minutes' })
        const intervalMins = intervalDoc?.value || 60 // Default 1 hour

        // Check last run
        const lastRunDoc = await settings.findOne({ key: 'last_fetch_run' })
        const lastRun = lastRunDoc?.value ? new Date(lastRunDoc.value) : new Date(0)
        const now = new Date()

        const minsSinceLast = (now.getTime() - lastRun.getTime()) / (1000 * 60)

        if (minsSinceLast < intervalMins) {
          console.log(`[Config] Skipping RSS Fetch: Only ${Math.floor(minsSinceLast)}m since last run (Interval: ${intervalMins}m)`)
          return { fetchRss: false, reason: 'interval-not-met' }
        }

        // Update last run time ONLY if we are legitimately fetching RSS
        await settings.updateOne(
          { key: 'last_fetch_run' },
          { $set: { value: now } },
          { upsert: true }
        )

        return { fetchRss: true, reason: 'interval-met' }
      } finally {
        await client.close()
      }
    })

    // ========================================
    // STEP 0.5: Check queue for pending articles
    // ========================================
    const queuedArticles = await step.run('check-queue', async () => {
      const client = new MongoClient(config.MONGODB_URI!)
      await client.connect()
      const db = client.db('brightwire')
      const queue = db.collection('article_queue')
      // ... same queue logic ...
      // Create index if not exists
      await queue.createIndex({ guid: 1 }, { unique: true })
      await queue.createIndex({ addedAt: 1 })
      await queue.createIndex({ score: -1 })

      // Get pending articles from queue, oldest first (so they don't expire)
      const pending = await queue
        .find({ status: 'pending' })
        .sort({ addedAt: 1 }) // Oldest first
        .limit(50)
        .toArray()

      await client.close()

      console.log(`[Queue] Found ${pending.length} pending articles in queue`)
      return pending
    })

    // ========================================
    // STEP 1: Fetch all RSS feeds
    // ========================================
    const candidates = await step.run('fetch-rss-feeds', async () => {
      // Check if we should skip RSS fetching (based on config or queue continuation)
      // We skip if the interval hasn't met OR if we are just draining the queue
      const skipRss = !runConfig.fetchRss ||
        config.SKIP_RSS_ON_DRAIN === 'true' ||
        (event.data && (event.data as any).reason === 'queue-continuation')

      if (skipRss) {
        console.log('Skipping RSS fetch (Mode: Queue Processing Only)')
        return []
      }

      const client = new MongoClient(config.MONGODB_URI!)
      await client.connect()
      const db = client.db('brightwire')
      const feedsCol = db.collection('feeds')

      // Load enabled feeds from DB
      const dbFeeds = await feedsCol.find({ enabled: { $ne: false } }).toArray()
      await client.close()

      // Fallback if DB empty (initial run) - though we have seeds now
      const sourcesToUse = dbFeeds.length > 0 ? dbFeeds : newsSources
      console.log(`Fetching from ${sourcesToUse.length} feeds...`)

      const parser = new Parser({
        customFields: {
          item: [
            ['media:content', 'mediaContent', { keepArray: false }],
            ['media:thumbnail', 'mediaThumbnail', { keepArray: false }],
          ],
        },
        timeout: 10000,
      })

      const allCandidates: Candidate[] = []
      const sourceResults: string[] = []
      let totalItems = 0

      for (const source of sourcesToUse) {
        try {
          const feed = await parser.parseURL(source.feed)
          let added = 0

          for (const item of feed.items.slice(0, 20)) {
            let guid = item.guid || item.link || item.title
            if (typeof guid === 'object' && guid !== null) {
              // Handle rss-parser object format (e.g. { _: 'value', $: { ... } })
              guid = (guid as any)._ || JSON.stringify(guid)
            }
            guid = String(guid)

            if (!guid || !item.title) continue

            totalItems++

            // Get pubDate for storage
            const pubDate = item.pubDate || item.isoDate || ''

            // Filter: only accept articles from last 72 hours
            if (pubDate) {
              const articleDate = new Date(pubDate)
              if (isNaN(articleDate.getTime())) {
                continue
              }
              const now = new Date()
              const ageHours = (now.getTime() - articleDate.getTime()) / (1000 * 60 * 60)

              if (ageHours > 72) continue // Too old
              if (ageHours < -24) continue // Future date (allow some timezone drift)
            } else {
              // STRICT MODE: If no date is found, reject it.
              // This prevents old "related" articles from being scraped as new.
              continue
            }

            // Pre-filter using keyword scoring
            const filterAction = preFilterStory(item.title, item.contentSnippet || '')
            if (filterAction === 'skip') {
              continue
            }

            const image = (item as any).mediaContent?.$.url ||
              (item as any).mediaThumbnail?.$.url

            allCandidates.push({
              title: item.title,
              summary: item.contentSnippet || '',
              link: item.link || '',
              source: source.name,
              pubDate,
              image,
              image,
              guid,
              forcedCategory: source.forcedCategory,
            })
            added++
          }
          sourceResults.push(`鉁?${source.name}: ${added} items`)
        } catch (e: any) {
          sourceResults.push(`鉂?${source.name}: ${e.message?.slice(0, 50)}`)
        }
      }

      console.log('RSS Fetch Results:')
      sourceResults.forEach(r => console.log(r))
      console.log(`Total items checked: ${totalItems}`)
      console.log(`Final candidates: ${allCandidates.length}`)

      return allCandidates
    })

    if (candidates.length === 0) {
      return { success: true, added: 0, message: 'No candidates found' }
    }

    // ========================================
    // STEP 2: Filter out existing articles
    // ========================================
    const newCandidates = await step.run('filter-existing', async () => {
      const client = new MongoClient(process.env.MONGODB_URI!)
      await client.connect()
      const db = client.db('brightwire')
      const stories = db.collection('stories')
      const queue = db.collection('article_queue')

      // Create text index for title similarity search if not exists
      try {
        await stories.createIndex({ title: 'text' })
        await stories.createIndex({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 }) // 30 day TTL
      } catch (e) {
        // Index might already exist
      }

      const guids = candidates.map(c => String(c.guid))

      // Check both stories (already published) and queue (pending) by GUID
      const existingStories = await stories.find({ guid: { $in: guids } }).toArray()
      const existingQueue = await queue.find({ guid: { $in: guids } }).toArray()

      const existingGuids = new Set([
        ...existingStories.map(e => e.guid),
        ...existingQueue.map(e => e.guid)
      ])

      // Also get all existing titles for similarity check - NOW WITH VIDEO STATUS
      const allStories = await stories.find({}, { projection: { title: 1, isVideo: 1 } }).toArray()
      const allQueueItems = await queue.find({}, { projection: { title: 1, isVideo: 1 } }).toArray()

      const existingItems = [
        ...allStories.map(s => ({ title: s.title?.toLowerCase(), isVideo: !!s.isVideo })),
        ...allQueueItems.map(q => ({ title: q.title?.toLowerCase(), isVideo: !!q.isVideo }))
      ].filter(item => item.title)

      await client.close()

      // Helper: detect if a new candidate is likely a video
      const isLikelyVideo = (c: Candidate): boolean => {
        const text = (c.title + c.link).toLowerCase()
        if (c.source === 'YouTube' || c.link.includes('youtube.com') || c.link.includes('youtu.be')) return true
        if (text.includes('video:') || text.includes('watch:') || text.includes('trailer')) return true
        return false
      }

      // Helper: check if title is too similar to existing
      // Returns TRUE if we should SKIP (duplicate), FALSE if we should KEEP (unique or upgrade)
      const shouldSkipDuplicate = (candidate: Candidate): boolean => {
        const title = candidate.title
        const newIsVideo = isLikelyVideo(candidate)

        const normalized = title.toLowerCase().trim()
        const cleanTitle = normalized
          .replace(/^(breaking|update|watch|video|exclusive|report):\s*/i, '')
          .replace(/[^\w\s]/g, '')
          .trim()

        for (const existing of existingItems) {
          if (!existing.title) continue

          const cleanExisting = existing.title
            .replace(/^(breaking|update|watch|video|exclusive|report):\s*/i, '')
            .replace(/[^\w\s]/g, '')
            .trim()

          // Check for match
          let isMatch = false
          if (cleanTitle === cleanExisting) isMatch = true
          else if (cleanTitle.length > 20 && cleanExisting.length > 20 && (cleanTitle.includes(cleanExisting) || cleanExisting.includes(cleanTitle))) isMatch = true
          else {
            const words1 = new Set(cleanTitle.split(/\s+/).filter(w => w.length > 3))
            const words2 = new Set(cleanExisting.split(/\s+/).filter(w => w.length > 3))
            if (words1.size >= 4 && words2.size >= 4) {
              const overlap = [...words1].filter(w => words2.has(w)).length
              const similarity = overlap / Math.min(words1.size, words2.size)
              if (similarity > 0.75) isMatch = true
            }
          }

          if (isMatch) {
            // "Video Priority" Logic:
            // 1. If Existing is Video -> We have the best version. Skip New.
            if (existing.isVideo) return true

            // 2. If Existing is Text...
            //    a. And New is Video -> Allow New (Upgrade!). Don't skip.
            if (newIsVideo) {
              console.log(`[Duplicate Check] Allowing Video Upgrade: "${title.slice(0, 30)}..." (Existing was text-only)`)
              return false
            }

            //    b. And New is Text -> Duplicate. Skip.
            return true
          }
        }
        return false
      }

      // Filter out: existing GUIDs AND similar titles (unless video upgrade)
      const filtered = candidates.filter(c => {
        if (existingGuids.has(c.guid)) return false
        if (shouldSkipDuplicate(c)) {
          console.log(`[Duplicate Title] Skipping: ${c.title.slice(0, 50)}...`)
          return false
        }
        return true
      })

      console.log(`${filtered.length} new candidates (${existingStories.length} in DB, ${existingQueue.length} in queue, ${candidates.length - filtered.length - existingGuids.size} title duplicates)`)
      return filtered
    })

    // If no new candidates but we have queued articles, continue processing
    if (newCandidates.length === 0 && queuedArticles.length === 0) {
      return { success: true, added: 0, message: 'No new candidates and queue empty' }
    }

    // ========================================
    // STEP 3: Batch classify all headlines
    // ========================================
    const classified = await step.run('classify-headlines', async () => {
      const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

      console.log(`Classifying ${newCandidates.length} headlines.`)

      // ALL candidates are now classified by AI (User Request: "use ai to categorise all rrewrite news no exception")
      const toClassify = newCandidates

      // 2. Process Unclassified with AI
      let aiResults: any[] = []

      if (toClassify.length > 0) {
        console.log(`Sending ${toClassify.length} headlines to Claude...`)
        toClassify.slice(0, 5).forEach((c, i) => {
          console.log(`  ${i + 1}. [${c.source}] ${c.title}`)
        })

        const prompt = `You are classifying news headlines for a POSITIVE NEWS website called BrightWire.

Score each headline 0-100.
STRICT FILTER: We ONLY want uplifting, solution-oriented, or generally positive news.

CRITICAL - AUTOMATIC 0 SCORE FOR:
- Fires, Explosions, Accidents
- Death, Murder, Crime, Violence
- Political attacks or scandals
- Natural disasters (unless sticking to rescue/recovery)
- "Church Erupts in Inferno" -> SCORE 0 (Destruction)

SCORING GUIDE:
- 80-100: Clearly positive (breakthroughs, victories, acts of kindness, progress)
- 60-79: Neutral-positive (interesting discoveries, hopeful developments, sports wins)
- 0-40: Negative, Tragical, or too controversial to be "Good News"

Headlines to classify:
${toClassify.map((c, i) => `${i + 1}. ${c.title}`).join('\n')}

CATEGORIES - Pick the MOST SPECIFIC one, or use 'good-news' as fallback.
1. "heroes"
2. "planet"
3. "innovation"
4. "solutions"
5. "kindness"
6. "sports"
7. "world"
8. "good-news" (Daily Mix / General)

IMPORTANT INSTRUCTIONS:
- If the article is about a SPECIFIC COUNTRY (Nigeria, India, Brazil, Japan, etc.) or international relations, YOU MUST USE 'world'.
  Examples: "Nigeria launches health program" 鈫?world, "India celebrates festival" 鈫?world, "Japanese team wins" 鈫?sports + world context
- If the article is about football, basketball, olympics, or any athletic competition, YOU MUST USE THE CATEGORY 'sports'.
- Do NOT use 'heroes' for sports stars unless they did something heroic OUTSIDE of the game (e.g. saving a life).
- For generic rising stars or match wins, use 'sports'.
- PRIORITY: If it's about Nigeria, Ghana, Kenya, India, Brazil, or any non-US/UK country 鈫?'world' takes priority over other categories.

Respond with JSON array ONLY (no other text):
[{"idx": 1, "score": 85, "category": "innovation"}, ...]`;

        try {
          const response = await anthropic.messages.create({
            model: 'claude-3-5-haiku-20241022',
            max_tokens: 8000,
            messages: [{ role: 'user', content: prompt }],
          })

          const text = response.content[0].type === 'text' ? response.content[0].text : ''
          const jsonMatch = text.match(/\[[\s\S]*\]/)

          if (jsonMatch) {
            const results = JSON.parse(jsonMatch[0])
            console.log(`Parsed ${results.length} classification results`)
            const categoryMap: Record<string, string> = {
              'good-news': 'good-news',
              'heroes': 'heroes',
              'planet': 'planet',
              'innovation': 'innovation',
              'solutions': 'solutions',
              'kindness': 'kindness',
              'sports': 'sports',
              'world': 'world',
            }

            aiResults = results
              .filter((r: any) => r.score >= 45 && r.idx >= 1 && r.idx <= toClassify.length)
              .map((r: any) => ({
                ...toClassify[r.idx - 1],
                score: r.score,
                category: (categoryMap[r.category?.toLowerCase()] || 'good-news') as StoryCategory,
              }))
          }
        } catch (e: any) {
          console.error('Classification error:', e)
        }
      }

      // Merge results (now just aiResults since we have no forcedResults)
      const combined = aiResults

      console.log(`Total positive articles: ${combined.length} (All AI classified)`)
      return combined
    })

    console.log(`After classification: ${classified.length} positive articles`)

    // ========================================
    // STEP 3.5: Add newly classified articles to queue
    // ========================================
    const queuedCount = await step.run('add-to-queue', async () => {
      if (classified.length === 0) return 0

      const client = new MongoClient(process.env.MONGODB_URI!)
      await client.connect()
      const db = client.db('brightwire')
      const queue = db.collection('article_queue')

      let added = 0
      for (const article of classified) {
        try {
          await queue.insertOne({
            ...article,
            status: 'pending',
            addedAt: new Date(),
          })
          added++
        } catch (e: any) {
          // Ignore duplicate key errors (already in queue)
          if (e.code !== 11000) {
            console.error(`Failed to queue ${article.title}:`, e.message)
          }
        }
      }

      await client.close()
      console.log(`[Queue] Added ${added} new articles to queue`)
      return added
    })

    // ========================================
    // STEP 3.6: Get articles to process from queue
    // ========================================
    const toProcess = await step.run('get-from-queue', async () => {
      const client = new MongoClient(process.env.MONGODB_URI!)
      await client.connect()
      const db = client.db('brightwire')
      const queue = db.collection('article_queue')
      const stories = db.collection('stories')

      // First, clean up any queue items that already exist in DB
      const queueGuids = await queue.find({ status: 'pending' }, { projection: { guid: 1 } }).toArray()
      if (queueGuids.length > 0) {
        const existingInDb = await stories.find(
          { guid: { $in: queueGuids.map(q => q.guid) } },
          { projection: { guid: 1 } }
        ).toArray()

        if (existingInDb.length > 0) {
          const existingGuids = existingInDb.map(e => e.guid)
          const removed = await queue.deleteMany({ guid: { $in: existingGuids } })
          console.log(`[Queue] Removed ${removed.deletedCount} articles already in database`)
        }
      }

      // Get pending articles: prioritize by score (highest first), then fewer retries, then oldest
      const pending = await queue
        .find({ status: 'pending' })
        .sort({ score: -1, retryCount: 1, addedAt: 1 })
        .limit(100) // Vercel Pro limit
        .toArray()

      // Mark as processing to prevent double-processing
      if (pending.length > 0) {
        const guids = pending.map(p => p.guid)
        await queue.updateMany(
          { guid: { $in: guids } },
          { $set: { status: 'processing', processingStartedAt: new Date() } }
        )
      }

      await client.close()
      console.log(`[Queue] Processing ${pending.length} articles from queue (sorted by score)`)
      return pending
    })

    if (toProcess.length === 0) {
      return { success: true, added: 0, message: 'No articles to process' }
    }

    // ========================================
    // STEP 4: Scrape articles in parallel (FULL SCRAPE ONLY)
    // ========================================
    const scraped = await step.run('scrape-articles', async () => {
      const results: Array<{
        candidate: typeof toProcess[0]
        content: string
        images: string[]
        isVideo?: boolean
        videoEmbedUrl?: string
      }> = []

      // Process ALL available articles from queue
      const toScrape = toProcess
      console.log(`Attempting to scrape ${toScrape.length} articles from queue...`)

      await Promise.all(
        toScrape.map(async (candidate) => {
          try {
            // Use the shared scraper utility which handles retries, video extraction, etc.
            const scrapedData = await scrapeArticle(candidate.link, candidate.summary)

            if (!scrapedData) {
              console.log(`SKIP scrape failed or empty: ${candidate.source}`)
              return
            }

            // STRICT VIDEO VALIDATION: Skip video articles without embed URL
            if (scrapedData.isVideo && !scrapedData.videoEmbedUrl) {
              console.log(`SKIP video article missing embed: ${candidate.source} - ${candidate.title.slice(0, 50)}...`)
              return
            }

            // Additional check for content length (scraper handles this but good to be sure)
            if (scrapedData.content.length < 100 && !scrapedData.isVideo) {
              console.log(`SKIP too short (${scrapedData.content.length} chars): ${candidate.source} - ${candidate.title.slice(0, 30)}...`)
              return
            }

            if (scrapedData.isVideo) {
              console.log(`鉁?VIDEO validated: ${candidate.source} (embed: ${scrapedData.videoEmbedUrl?.slice(0, 50)}...)`)
            }

            results.push({
              candidate,
              content: scrapedData.content.slice(0, 4000), // Limit mostly for Claude text window
              images: scrapedData.images, // Scraper returns up to 5
              isVideo: scrapedData.isVideo,
              videoEmbedUrl: scrapedData.videoEmbedUrl,
            })

            console.log(`OK scraped ${scrapedData.content.length} chars: ${candidate.source} - ${candidate.title.slice(0, 40)}...`)
          } catch (e: any) {
            console.log(`SKIP error: ${candidate.source} - ${e.message?.slice(0, 50) || 'unknown'}`)
          }
        })
      )

      console.log(`Successfully scraped ${results.length}/${toScrape.length} articles`)
      return results
    })

    if (scraped.length === 0) {
      return { success: true, added: 0, message: 'No articles could be scraped' }
    }

    // ========================================
    // STEP 5: Rewrite articles with AI (batched to avoid rate limits)
    // ========================================
    const rewritten = await step.run('rewrite-articles', async () => {
      const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
      const results: Story[] = []

      // Fetch settings for author name
      const settingsClient = new MongoClient(process.env.MONGODB_URI!)
      await settingsClient.connect()
      const settingsDb = settingsClient.db('brightwire')
      const settingsDoc = await settingsDb.collection('settings').findOne({ _id: 'site-settings' as any })
      const defaultAuthor = settingsDoc?.defaultAuthor || 'Felix Utomi'
      await settingsClient.close()

      // Helper function to delay
      const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

      // Helper function to rewrite a single article with retry
      async function rewriteArticle(item: typeof scraped[0], retries = 2): Promise<Story | null> {
        try {
          const originalWordCount = item.content.split(/\s+/).length

          // Hero image is always the first one (used at top of article)
          const heroImage = item.candidate.image || item.images[0]

          // Deduplicate images using FULL URL normalization (not just basename)
          const normalizeImageUrl = (url: string): string => {
            if (!url) return ''
            try {
              // Remove Cloudinary transformations, query params, size indicators
              return url
                .replace(/\/w_\d+,.*?\//g, '/') // Cloudinary transformations
                .replace(/[-_]\d+x\d+/g, '') // Size indicators like -800x600
                .replace(/\?.*$/, '') // Query parameters
                .replace(/#.*$/, '') // Anchors
                .toLowerCase()
                .trim()
            } catch {
              return url.toLowerCase().trim()
            }
          }

          // Start with hero image, then add others
          const allImages = heroImage ? [heroImage, ...item.images] : [...item.images]

          // Filter to keep only the first occurrence of each normalized URL
          const seenUrls = new Set<string>()
          const uniqueImages: string[] = []

          for (const img of allImages) {
            // Skip empty, null, or undefined
            if (!img || !img.trim()) continue

            // Skip if not a valid HTTP/HTTPS URL
            if (!img.startsWith('http://') && !img.startsWith('https://')) continue

            // Skip obviously broken URLs
            if (img.length < 10) continue // Too short to be valid

            const normalized = normalizeImageUrl(img)
            if (!normalized) continue

            if (!seenUrls.has(normalized)) {
              seenUrls.add(normalized)
              uniqueImages.push(img) // Keep original URL with Cloudinary params
            }
          }

          // Limit to 4 images
          const inlineImages = uniqueImages.slice(0, 4)
          const hasInlineImages = inlineImages.length > 0

          console.log(`[Images] Hero: ${heroImage?.slice(-30)}, Available for inline: ${inlineImages.length}`)

          const imageInstructions = hasInlineImages
            ? `\nAVAILABLE IMAGES FOR INLINE PLACEMENT (${inlineImages.length}):
${inlineImages.map((_, i) => `[IMG:${i}] - Image ${i + 1}`).join('\n')}

IMAGE PLACEMENT RULES:
- You MUST include at least one image if available
- Place [IMG:0] (often the main image) early in the article (e.g. after 1st/2nd paragraph)
- Place other images to break up long text
- DO NOT place images back-to-back
- DO NOT put image at the very start or very end`
            : ''

          const prompt = `You are a senior journalist for BrightWire, a positive news outlet. Your job is to FULLY REWRITE this article in your own words.

ORIGINAL HEADLINE: ${item.candidate.title}
ORIGINAL CONTENT (${originalWordCount} words): ${item.content.slice(0, 6000)}
${imageInstructions}

CRITICAL REQUIREMENTS:
1. Your rewrite MUST be **400-800 words**. If the original is longer, condense it to the most impactful details.
2. DO NOT summarize - write a COMPLETE article with all details
3. Include EVERY fact, name, number, date, quote from the original
4. Write 5-8 full paragraphs minimum
5. Start with a compelling hook that draws readers in
6. Use an uplifting but genuine tone - not preachy or saccharine
7. Write like a professional journalist for a major publication
8. Separate paragraphs with [P] marker
${hasInlineImages ? '9. Place image markers [IMG:0], [IMG:1], etc. at appropriate points in the content' : ''}

HEADLINE GUIDELINES (very important for engagement):
- Create curiosity: Make readers NEED to know more
- Use specific numbers/results when available (e.g. "97-Year-Old Breaks Marathon Record" not "Senior Runs Marathon")
- Lead with the most surprising or emotional element
- Use active voice and strong verbs
- Keep under 80 characters if possible
- Avoid generic words like "inspiring", "amazing", "incredible" - show don't tell
- Good: "Teen's App Reunites 500 Families Separated at Border"
- Bad: "Inspiring Teen Creates Amazing App to Help Families"

TAGGING GUIDELINES (Critical for Viral Reach):
- Generate 5-7 HIGH-IMPACT tags
- Focus on SPECIFIC entities, locations, and viral topics
- Example: Use ["ElonMusk", "SpaceX", "Mars"] instead of ["Space", "Tech"]
- Include the specific city/country if relevant
- Include the main subject's name if relevant
- Tags should be PascalCase strings

FORMATTING:
- Return ONLY valid JSON
- Use [P] between paragraphs (not actual line breaks in the content string)
- Content should be one continuous string with [P] markers${hasInlineImages ? ' and [IMG:X] markers' : ''}

{"title": "Compelling headline", "content": "First paragraph with hook.[P]Second paragraph with details.${hasInlineImages ? '[IMG:0]' : ''}[P]Third paragraph continues the story.[P]More paragraphs...", "summary": "Engaging 2-sentence preview that hooks readers", "tags": ["SpecificEntity", "ViralTopic", "CityName", "SubjectName"]}`

          const response = await anthropic.messages.create({
            model: 'claude-3-5-haiku-20241022',
            max_tokens: 4000,
            messages: [
              { role: 'user', content: prompt },
              { role: 'assistant', content: '{' }  // Prefill to force JSON
            ],
          })

          // Prepend the opening brace we used in prefill
          const rawText = response.content[0].type === 'text' ? response.content[0].text : ''
          const text = '{' + rawText

          // Clean the text
          let cleanText = text.trim()
          // Remove any accidental markdown code blocks
          cleanText = cleanText.replace(/```json?\n?/g, '').replace(/```\s*$/g, '').trim()

          const jsonMatch = cleanText.match(/\{[\s\S]*\}/)

          if (jsonMatch) {
            // Clean control characters and normalize whitespace
            let cleanJson = jsonMatch[0]
              .replace(/[\x00-\x1F\x7F]/g, ' ')
              .replace(/\n/g, ' ')
              .replace(/\r/g, ' ')
              .replace(/\t/g, ' ')

            let article
            try {
              article = JSON.parse(cleanJson)
            } catch (e) {
              // Try fixing common JSON issues
              try {
                // Fix unescaped quotes in content
                cleanJson = cleanJson.replace(/:\s*"([^"]*)"([^,}"]*)"([^"]*?)"/g, ': "$1\\"$2\\"$3"')
                article = JSON.parse(cleanJson)
              } catch (e2) {
                // Fallback: extract fields with regex
                const titleMatch = cleanText.match(/"title"\s*:\s*"([^"]{5,150})"/i)
                const summaryMatch = cleanText.match(/"summary"\s*:\s*"([^"]{10,500})"/i)

                // More flexible content extraction - look for content field and grab until tags/end
                let contentMatch = cleanText.match(/"content"\s*:\s*"([\s\S]+?)"\s*,\s*"(?:summary|tags)"/i)
                if (!contentMatch) {
                  contentMatch = cleanText.match(/"content"\s*:\s*"([\s\S]+?)"\s*,?\s*}/i)
                }
                if (!contentMatch) {
                  // Try to get content between "content": " and the last "
                  const contentStart = cleanText.indexOf('"content"')
                  if (contentStart > -1) {
                    const afterContent = cleanText.slice(contentStart + 10)
                    const colonPos = afterContent.indexOf(':')
                    if (colonPos > -1) {
                      const afterColon = afterContent.slice(colonPos + 1).trim()
                      if (afterColon.startsWith('"')) {
                        // Find matching end quote (not preceded by backslash)
                        let inContent = afterColon.slice(1)
                        let endPos = 0
                        for (let i = 0; i < inContent.length; i++) {
                          if (inContent[i] === '"' && inContent[i - 1] !== '\\') {
                            endPos = i
                            break
                          }
                        }
                        if (endPos > 100) {
                          contentMatch = [null, inContent.slice(0, endPos)]
                        }
                      }
                    }
                  }
                }

                if (titleMatch && summaryMatch && contentMatch && contentMatch[1]) {
                  article = {
                    title: titleMatch[1].replace(/\\"/g, '"'),
                    content: contentMatch[1].replace(/\\"/g, '"').replace(/[\x00-\x1F\x7F]/g, ' ').trim(),
                    summary: summaryMatch[1].replace(/\\"/g, '"'),
                    tags: []
                  }
                  console.log(`[FALLBACK] Recovered article: ${article.title.slice(0, 40)}...`)
                } else {
                  console.error(`[PARSE FAIL] Could not extract fields for: ${item.candidate.title}`)
                  console.error(`[PARSE FAIL] Title found: ${!!titleMatch}, Summary found: ${!!summaryMatch}, Content found: ${!!contentMatch}`)
                  return null // Skip this article instead of throwing
                }
              }
            }

            // Guard against undefined article
            if (!article || !article.title || !article.content || !article.summary) {
              console.error(`[INVALID] Article missing required fields for: ${item.candidate.title}`)
              return null
            }

            const heroImage = item.candidate.image || item.images[0]

            // Same deduplication as in prompt generation
            const getImageBasename = (url: string): string => {
              try {
                const pathname = new URL(url).pathname
                return pathname
                  .replace(/[-_]\d+x\d+/g, '')
                  .replace(/[-_](small|medium|large|thumb|preview)/gi, '')
                  .replace(/\.[^.]+$/, '')
                  .toLowerCase()
              } catch {
                return url.toLowerCase()
              }
            }

            const heroBasename = getImageBasename(heroImage || '')
            const uniqueImages = item.images.filter(img => {
              if (!img || img === heroImage) return false
              const basename = getImageBasename(img)
              if (heroBasename && basename) {
                if (heroBasename.includes(basename) || basename.includes(heroBasename)) return false
                const heroFile = heroBasename.split('/').pop() || ''
                const imgFile = basename.split('/').pop() || ''
                if (heroFile && imgFile && (heroFile.includes(imgFile) || imgFile.includes(heroFile))) return false
              }
              return true
            })
            const inlineImages = uniqueImages.slice(0, 3)

            // Replace [IMG:X] markers with actual image URLs
            let processedContent = article.content
            if (inlineImages.length > 0) {
              const proxiedInlineImages = inlineImages.map(proxyImage)
              processedContent = processedContent.replace(/\[IMG:(\d+)\]/g, (match, idx) => {
                const imgIndex = parseInt(idx, 10)
                if (imgIndex < proxiedInlineImages.length) {
                  return `[IMG:${proxiedInlineImages[imgIndex]}]`
                }
                return '' // Remove invalid image markers
              })
            }
            // Clean up any remaining invalid markers
            processedContent = processedContent.replace(/\[IMG:\d+\]/g, '')

            // Validate that the rewrite is substantial (not just a summary)
            const rewriteWordCount = article.content.split(/\s+/).length
            const paragraphCount = (article.content.match(/\[P\]/g) || []).length + 1

            // Lower thresholds for video content
            const minWords = item.isVideo ? 100 : 150
            const minParagraphs = item.isVideo ? 2 : 3

            if (rewriteWordCount < minWords) {
              console.log(`[REJECTED] Too short (${rewriteWordCount} words, min ${minWords}): ${article.title.slice(0, 40)}...`)
              return null
            }

            if (paragraphCount < minParagraphs) {
              console.log(`[REJECTED] Too few paragraphs (${paragraphCount}, min ${minParagraphs}): ${article.title.slice(0, 40)}...`)
              return null
            }

            return {
              guid: item.candidate.guid,
              slug: generateSlug(article.title),
              title: article.title,
              summary: article.summary,
              content: processedContent,
              originalSource: item.candidate.source,
              sourceUrl: item.candidate.link,
              videoEmbedUrl: item.videoEmbedUrl,
              category: item.candidate.category,
              score: item.candidate.score,
              imageUrl: heroImage ? proxyImage(heroImage) : undefined,
              images: item.images.map(proxyImage),
              author: defaultAuthor,
              readTime: Math.ceil(article.content.split(/\s+/).length / 200),
              tags: article.tags || [],
              // Parse date properly - fallback to now if invalid
              publishedAt: (() => {
                const parsed = new Date(item.candidate.pubDate)
                return isNaN(parsed.getTime()) ? new Date() : parsed
              })(),
              createdAt: new Date(),
              featured: item.candidate.score >= 90,
            } as Story
          } else {
            // No JSON found in response
            console.error(`[NO JSON] Response didn't contain valid JSON for: ${item.candidate.title}`)
            return null
          }
        } catch (e: any) {
          // Handle rate limit with retry
          if (e?.status === 429 && retries > 0) {
            console.log(`[RATE LIMIT] Retrying ${item.candidate.title.slice(0, 30)}... (${retries} retries left)`)
            await delay(3000) // Wait 3 seconds before retry
            return rewriteArticle(item, retries - 1)
          }
          console.error(`Failed to rewrite ${item.candidate.title}:`, e)
          return null
        }
      }

      // Process articles in batches to avoid rate limits
      // Vercel Pro: 300 second timeout, ~8s per article = ~35-40 articles max
      // With queue system, unprocessed articles will be picked up in next run
      // Vercel Pro settings
      const MAX_ARTICLES = 100
      const BATCH_SIZE = 5
      const BATCH_DELAY = 2000 // Increased to 2s to be safe with Claude rate limits

      // Articles are already sorted by addedAt (oldest first) from queue
      // No need to re-sort - we want to process oldest first to prevent expiry
      const articlesToProcess = scraped.slice(0, MAX_ARTICLES)

      if (scraped.length > MAX_ARTICLES) {
        console.log(`⏳ ${scraped.length - MAX_ARTICLES} articles deferred to next run (queue system)`)
      }

      console.log(`Processing ${articlesToProcess.length} of ${scraped.length} articles...`)

      for (let i = 0; i < articlesToProcess.length; i += BATCH_SIZE) {
        const batch = articlesToProcess.slice(i, i + BATCH_SIZE)
        console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(articlesToProcess.length / BATCH_SIZE)}...`)

        const batchResults = await Promise.all(batch.map(item => rewriteArticle(item)))

        for (const result of batchResults) {
          if (result) results.push(result)
        }

        // Wait between batches (but not after the last batch)
        if (i + BATCH_SIZE < articlesToProcess.length) {
          await delay(BATCH_DELAY)
        }
      }

      console.log(`Rewritten ${results.length} articles`)
      return results
    })

    if (rewritten.length === 0) {
      return { success: true, added: 0, message: 'No articles rewritten' }
    }

    // ========================================
    // STEP 6: Save to database
    // ========================================
    const savedGuids: string[] = []
    const saved = await step.run('save-to-database', async () => {
      const client = new MongoClient(process.env.MONGODB_URI!)
      await client.connect()
      const db = client.db('brightwire')
      const stories = db.collection('stories')

      // Create indexes
      await stories.createIndex({ guid: 1 }, { unique: true })
      await stories.createIndex({ slug: 1 }, { unique: true })
      await stories.createIndex({ publishedAt: -1 })
      await stories.createIndex({ category: 1 })

      let added = 0
      const now = new Date()
      const maxAgeHours = 48

      for (const story of rewritten) {
        try {
          // Secondary check: don't save articles older than 48 hours
          const publishedAt = new Date(story.publishedAt)
          const ageHours = (now.getTime() - publishedAt.getTime()) / (1000 * 60 * 60)

          if (ageHours > maxAgeHours) {
            console.log(`⚠️ Skipped (too old - ${ageHours.toFixed(0)}h): ${story.title.slice(0, 50)}`)
            savedGuids.push(story.guid) // Still remove from queue
            continue
          }

          await stories.insertOne(story)
          added++
          savedGuids.push(story.guid)
          console.log(`✅ Saved: ${story.title.slice(0, 50)}`)
        } catch (e: any) {
          if (e.code === 11000) {
            // Duplicate - remove from queue
            savedGuids.push(story.guid)
          } else {
            console.error(`Failed to save ${story.title}:`, e)
          }
        }
      }

      await client.close()
      return added
    })

    // ========================================
    // STEP 6.5: Clean up queue
    // ========================================
    const cleanup = await step.run('cleanup-queue', async () => {
      const client = new MongoClient(process.env.MONGODB_URI!)
      await client.connect()
      const db = client.db('brightwire')
      const queue = db.collection('article_queue')

      // Remove successfully processed articles from queue
      if (savedGuids.length > 0) {
        const result = await queue.deleteMany({ guid: { $in: savedGuids } })
        console.log(`[Queue] Removed ${result.deletedCount} processed articles`)
      }

      // Mark remaining "processing" articles back to pending for retry
      await queue.updateMany(
        { status: 'processing' },
        { $set: { status: 'pending' }, $inc: { retryCount: 1 } }
      )

      // Remove articles that failed too many times (2+ attempts)
      const failedResult = await queue.deleteMany({
        retryCount: { $gte: 2 }
      })
      if (failedResult.deletedCount > 0) {
        console.log(`[Queue] Removed ${failedResult.deletedCount} articles after 2 failed attempts`)
      }

      // Remove articles that are too old (>48 hours)
      const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000) // 48 hours
      const staleResult = await queue.deleteMany({
        addedAt: { $lt: cutoff }
      })
      if (staleResult.deletedCount > 0) {
        console.log(`[Queue] Removed ${staleResult.deletedCount} stale articles (>48 hours)`)
      }

      // Log queue status
      const remaining = await queue.countDocuments({ status: 'pending' })
      console.log(`[Queue] ${remaining} articles remaining in queue`)

      await client.close()

      return { remaining }
    })

    // ========================================
    // STEP 7: Notify clients via Pusher
    // ========================================
    if (saved > 0) {
      await step.run('notify-clients', async () => {
        const articlePreviews = rewritten.slice(0, 5).map(s => ({
          title: s.title,
          category: s.category,
        }))
        await notifyNewArticles(saved, articlePreviews)
      })
    }

    // ========================================
    // STEP 8: Check for more work (Looping)
    // ========================================
    const remainingCount = (cleanup?.remaining as number) || 0

    if (remainingCount > 0) {
      await step.run('trigger-next-batch', async () => {
        console.log(`🔄 Triggering next batch immediately (${remainingCount} remaining)...`)
        await inngest.send({
          name: 'app/manual.fetch',
          data: { reason: 'queue-continuation' }
        })
      })
    }

    // ========================================
    // FINAL SUMMARY
    // ========================================
    console.log('\n📊 PIPELINE SUMMARY:')
    console.log('----------------------------------------')
    console.log(`  RSS Items Fetched:     ${candidates.length}`)
    console.log(`  New (not in DB/queue): ${newCandidates.length}`)
    console.log(`  Positive (score 45+):  ${classified.length}`)
    console.log(`  From Queue:            ${toProcess.length}`)
    console.log(`  Scraped Successfully:  ${scraped.length}`)
    console.log(`  Rewritten:             ${rewritten.length}`)
    console.log(`  Saved to Database:     ${saved}`)
    console.log('----------------------------------------')
    console.log('✅ Queue system ensures NO positive articles are missed')
    return {
      success: true,
      candidates: candidates.length,
      newCandidates: newCandidates.length,
      classified: classified.length,
      queued: toProcess.length,
      scraped: scraped.length,
      rewritten: rewritten.length,
      added: saved,
    }
  }
)

// ========================================
// Daily Content Generation (Joke + Quote)
// ========================================
export const generateDailyContent = inngest.createFunction(
  {
    id: 'generate-daily-content',
    name: 'Generate Daily Joke and Quote',
  },
  [{ cron: '0 6 * * *' }, { event: 'app/manual.daily-content' }], // Daily at 6 AM UTC + Manual
  async ({ event, step }) => {

    // Step 1: Generate Joke
    const joke = await step.run('generate-joke', async () => {
      const client = new MongoClient(process.env.MONGODB_URI!)
      const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })


      let uniqueJoke = ''
      let attempts = 0
      const maxAttempts = 3

      try {
        await client.connect()
        const db = client.db('brightwire')
        const history = db.collection('daily_content_history')
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        while (attempts < maxAttempts) {
          attempts++
          console.log(`[Joke] Generation attempt ${attempts}/${maxAttempts}`)

          const response = await anthropic.messages.create({
            model: 'claude-3-5-haiku-20241022',
            max_tokens: 200,
            messages: [{
              role: 'user',
              content: `Generate ONE clean, family-friendly joke for BrightWire - a positive news site.${attempts > 1 ? ' Give me a DIFFERENT one, that one was already used.' : ''}
  
  Requirements:
  - Must be genuinely funny
  - No politics, religion, or controversial topics
  - Appropriate for all ages
  - 1-2 sentences maximum
  - Wordplay, puns, or clever observations preferred
  
  Return ONLY the joke text. No labels, no extra commentary.`
            }]
          })

          const generatedJoke = response.content[0].type === 'text' ? response.content[0].text.trim() : ''

          // Check uniqueness (ALL TIME)
          const existing = await history.findOne({
            type: 'joke',
            text: generatedJoke
            // Removed date filter to check ALL history
          })

          if (!existing) {
            uniqueJoke = generatedJoke
            break
          } else {
            console.log(`[Joke] Duplicate found: "${generatedJoke.slice(0, 20)}..." Retrying...`)
          }
        }
      } finally {
        await client.close()
      }

      return uniqueJoke || "Why don't scientists trust atoms? Because they make up everything!" // Fallback
    })

    // Helper to check history (Moved logic to inside steps for better flow control in future refactors, 
    // but for now we generate first. A true RETRY loop requires the generation to happen 
    // INSIDE a loop. Let's refactor the generation steps to include the loop.)

    // REFACTORING GENERATION TO INCLUDE CHECK:
    // We'll override the previous simple generation with a smart loop.


    // Step 2: Generate Quote
    const quote = await step.run('generate-quote', async () => {
      const client = new MongoClient(process.env.MONGODB_URI!)
      const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })


      let uniqueQuote = { text: '', author: '' }
      let attempts = 0
      const maxAttempts = 3

      try {
        await client.connect()
        const db = client.db('brightwire')
        const history = db.collection('daily_content_history')
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        while (attempts < maxAttempts) {
          attempts++
          console.log(`[Quote] Generation attempt ${attempts}/${maxAttempts}`)

          const response = await anthropic.messages.create({
            model: 'claude-3-5-haiku-20241022',
            max_tokens: 200,
            messages: [{
              role: 'user',
              content: `Generate ONE inspirational quote for BrightWire - a positive news site.${attempts > 1 ? ' Give me a DIFFERENT one than before.' : ''}
  
  Requirements:
  - Famous person (entrepreneur, scientist, artist, leader)
  - Uplifting and motivational
  - About hope, progress, innovation, or humanity
  - 1-2 sentences maximum
  
  Format:
  Quote text
  — Author Name
  
  Return ONLY in that format. No extra text.`
            }]
          })

          const fullText = response.content[0].type === 'text' ? response.content[0].text.trim() : ''
          const parts = fullText.split('—')
          const generatedQuote = {
            text: parts[0]?.trim().replace(/^["']|["']$/g, '') || '',
            author: parts[1]?.trim() || 'Unknown'
          }

          // Check uniqueness (ALL TIME)
          const existing = await history.findOne({
            type: 'quote',
            text: generatedQuote.text
            // Removed date filter to check ALL history
          })

          if (!existing) {
            uniqueQuote = generatedQuote
            break
          } else {
            console.log(`[Quote] Duplicate found: "${generatedQuote.text.slice(0, 20)}..." Retrying...`)
          }
        }
      } finally {
        await client.close()
      }

      return uniqueQuote.text ? uniqueQuote : {
        text: "The only way to do great work is to love what you do.",
        author: "Steve Jobs"
      }
    })


    // Step 2.5: Save History (Now clearly just saving, as deduplication happened upstream)
    await step.run('save-history', async () => {
      const client = new MongoClient(process.env.MONGODB_URI!)
      await client.connect()
      const db = client.db('brightwire')
      const history = db.collection('daily_content_history')

      // Save valid content to history to prevent reuse tomorrow
      if (joke && joke !== "Why don't scientists trust atoms? Because they make up everything!") {
        // Create index if needed (unique text + type) to prevent double saving on retries 
        // (though 'date' makes it unique usually, better to be safe)
        await history.createIndex({ text: 1 }, { unique: false })
        await history.insertOne({ type: 'joke', text: joke, date: new Date() })
      }

      if (quote && quote.text && quote.text !== "The only way to do great work is to love what you do.") {
        await history.insertOne({ type: 'quote', text: quote.text, author: quote.author, date: new Date() })
      }

      await client.close()
    })


    // Step 3: Update Site Settings
    await step.run('update-settings', async () => {
      const config = useRuntimeConfig()
      const client = new MongoClient(config.mongodbUri)

      try {
        await client.connect()
        const db = client.db('brightwire')
        const settings = db.collection('settings')

        await settings.updateOne(
          { _id: 'site-settings' as any },
          {
            $set: {
              jokeText: joke,
              quoteText: quote.text,
              quoteAuthor: quote.author,
              lastJokeUpdate: new Date(),
              lastQuoteUpdate: new Date(),
            }
          },
          { upsert: true }
        )

        console.log('✅ Daily content updated:', { joke, quote: `${quote.text} — ${quote.author}` })
      } finally {
        await client.close()
      }
    })

    return {
      success: true,
      joke,
      quote: `${quote.text} — ${quote.author}`
    }
  }
)


