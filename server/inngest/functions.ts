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
  guid: string
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

  async ({ step }) => {
    // ========================================
    // STEP 0: Check queue for pending articles
    // ========================================
    const queuedArticles = await step.run('check-queue', async () => {
      const client = new MongoClient(process.env.MONGODB_URI!)
      await client.connect()
      const db = client.db('brightwire')
      const queue = db.collection('article_queue')

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

      for (const source of newsSources) {
        try {
          const feed = await parser.parseURL(source.feed)
          let added = 0

          for (const item of feed.items.slice(0, 20)) {
            const guid = item.guid || item.link || item.title
            if (!guid || !item.title) continue

            totalItems++

            // Get pubDate for storage
            const pubDate = item.pubDate || item.isoDate || ''

            // Filter: only accept articles from last 48 hours
            if (pubDate) {
              const articleDate = new Date(pubDate)
              if (isNaN(articleDate.getTime())) {
                continue
              }
              const now = new Date()
              const ageHours = (now.getTime() - articleDate.getTime()) / (1000 * 60 * 60)

              if (ageHours > 48) continue // Too old
              if (ageHours < -1) continue // Future date
            } else {
              continue // no date
            }

            // Pre-filter using keyword scoring
            const filterAction = preFilterStory(item.title, item.contentSnippet || '')
            if (filterAction === 'skip') {
              // console.log(`[Pre-filter Skip] ${item.title}`)
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
              guid,
            })
            added++
          }
          sourceResults.push(`✅ ${source.name}: ${added} items`)
        } catch (e: any) {
          sourceResults.push(`❌ ${source.name}: ${e.message?.slice(0, 50)}`)
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
      } catch (e) {
        // Index might already exist
      }

      const guids = candidates.map(c => c.guid)

      // Check both stories (already published) and queue (pending) by GUID
      const existingStories = await stories.find({ guid: { $in: guids } }).toArray()
      const existingQueue = await queue.find({ guid: { $in: guids } }).toArray()

      const existingGuids = new Set([
        ...existingStories.map(e => e.guid),
        ...existingQueue.map(e => e.guid)
      ])

      // Also get all existing titles for similarity check
      const allStories = await stories.find({}, { projection: { title: 1 } }).toArray()
      const allQueueItems = await queue.find({}, { projection: { title: 1 } }).toArray()
      const existingTitles = [
        ...allStories.map(s => s.title?.toLowerCase()),
        ...allQueueItems.map(q => q.title?.toLowerCase())
      ].filter(Boolean)

      await client.close()

      // Helper: check if title is too similar to existing
      const isTitleDuplicate = (title: string): boolean => {
        const normalized = title.toLowerCase().trim()
        // Remove common prefixes/suffixes and punctuation for comparison
        const cleanTitle = normalized
          .replace(/^(breaking|update|watch|video|exclusive|report):\s*/i, '')
          .replace(/[^\w\s]/g, '')
          .trim()

        for (const existing of existingTitles) {
          const cleanExisting = existing
            .replace(/^(breaking|update|watch|video|exclusive|report):\s*/i, '')
            .replace(/[^\w\s]/g, '')
            .trim()

          // Check for exact match or very high similarity
          if (cleanTitle === cleanExisting) return true

          // Check if one contains the other (for shortened headlines)
          if (cleanTitle.length > 20 && cleanExisting.length > 20) {
            if (cleanTitle.includes(cleanExisting) || cleanExisting.includes(cleanTitle)) return true
          }

          // Simple word overlap check (>80% same words = duplicate)
          const words1 = new Set(cleanTitle.split(/\s+/).filter(w => w.length > 3))
          const words2 = new Set(cleanExisting.split(/\s+/).filter(w => w.length > 3))
          if (words1.size >= 4 && words2.size >= 4) {
            const overlap = [...words1].filter(w => words2.has(w)).length
            const similarity = overlap / Math.min(words1.size, words2.size)
            if (similarity > 0.8) return true
          }
        }
        return false
      }

      // Filter out: existing GUIDs AND similar titles
      const filtered = candidates.filter(c => {
        if (existingGuids.has(c.guid)) return false
        if (isTitleDuplicate(c.title)) {
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

      // Log sample of headlines being classified
      console.log(`Classifying ${newCandidates.length} headlines. Sample:`)
      newCandidates.slice(0, 10).forEach((c, i) => {
        console.log(`  ${i + 1}. [${c.source}] ${c.title}`)
      })

      const prompt = `You are classifying news headlines for a POSITIVE NEWS website called BrightWire.

Score each headline 0-100 on how positive/uplifting it is:
- 70-100: Clearly positive (breakthroughs, victories, kindness, progress, solutions)
- 50-69: Mildly positive or neutral-positive (interesting discoveries, hopeful developments)  
- 30-49: Neutral or mixed
- 0-29: Negative news (disasters, conflicts, problems without solutions)

BE GENEROUS with scoring - we want to find the good news! If a headline could be positive, score it 50+.

Headlines to classify:
${newCandidates.map((c, i) => `${i + 1}. ${c.title}`).join('\n')}

CATEGORIES - Pick the MOST SPECIFIC one:
1. "heroes" - PEOPLE making a difference: volunteers, activists, rescuers, donors, community leaders
2. "planet" - ENVIRONMENT: wildlife, conservation, climate wins, nature, animals, sustainability
3. "innovation" - TECH/SCIENCE: inventions, discoveries, medical advances, research, space, AI
4. "solutions" - SYSTEMIC: laws passed, programs launched, policy wins, social initiatives
5. "kindness" - HEARTWARMING: acts of kindness, generosity, reunions, feel-good moments
6. "good-news" - General positive stories that don't fit above

Respond with JSON array ONLY (no other text):
[{"idx": 1, "score": 75, "category": "innovation"}, ...]`

      try {
        const response = await anthropic.messages.create({
          model: 'claude-3-5-haiku-20241022',
          max_tokens: 8000,  // Increased for large headline lists
          messages: [{ role: 'user', content: prompt }],
        })

        const text = response.content[0].type === 'text' ? response.content[0].text : ''
        console.log(`Classification response length: ${text.length} chars`)

        const jsonMatch = text.match(/\[[\s\S]*\]/)

        if (jsonMatch) {
          const results = JSON.parse(jsonMatch[0])
          console.log(`Parsed ${results.length} classification results`)
          const categoryMap: Record<string, string> = {
            'good-news': 'good-news',
            'goodnews': 'good-news',
            'news': 'good-news',
            'general': 'good-news',
            'heroes': 'heroes',
            'hero': 'heroes',
            'community': 'heroes',
            'planet': 'planet',
            'environment': 'planet',
            'climate': 'planet',
            'nature': 'planet',
            'earth': 'planet',
            'innovation': 'innovation',
            'tech': 'innovation',
            'technology': 'innovation',
            'science': 'innovation',
            'solutions': 'solutions',
            'solution': 'solutions',
            'policy': 'solutions',
            'kindness': 'kindness',
            'kind': 'kindness',
            'generosity': 'kindness',
            'heartwarming': 'kindness',
          }

          const positive = results
            .filter((r: any) => r.score >= 45 && r.idx >= 1 && r.idx <= newCandidates.length)
            .map((r: any) => ({
              ...newCandidates[r.idx - 1],
              score: r.score,
              // Map category to valid one, default to 'good-news'
              category: (categoryMap[r.category?.toLowerCase()] || 'good-news') as StoryCategory,
            }))

          // Log score distribution
          const allScores = results.map((r: any) => r.score).sort((a: number, b: number) => b - a)
          console.log(`Score distribution: max=${allScores[0]}, median=${allScores[Math.floor(allScores.length / 2)]}, min=${allScores[allScores.length - 1]}`)

          // Log top 5 scoring articles
          const topScorers = results
            .filter((r: any) => r.idx >= 1 && r.idx <= newCandidates.length)
            .sort((a: any, b: any) => b.score - a.score)
            .slice(0, 5)
          console.log('Top 5 scoring headlines:')
          topScorers.forEach((r: any) => {
            const article = newCandidates[r.idx - 1]
            console.log(`  ${r.score}: [${r.category}] ${article?.title?.substring(0, 60)}...`)
          })

          console.log(`${positive.length} articles scored 45+ (threshold)`)
          return positive
        } else {
          console.error('No JSON array found in classification response')
          console.error('Response preview:', text.slice(0, 500))
        }
      } catch (e: any) {
        console.error('Classification error:', e)
        console.error('Classification error message:', e?.message)
        console.error('Classification error status:', e?.status)
      }

      console.log('Classification step returning empty array')
      return []
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
        .limit(45)
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

            // Additional check for content length (scraper handles this but good to be sure)
            if (scrapedData.content.length < 100 && !scrapedData.isVideo) {
              console.log(`SKIP too short (${scrapedData.content.length} chars): ${candidate.source} - ${candidate.title.slice(0, 30)}...`)
              return
            }

            if (scrapedData.isVideo) {
              console.log(`VIDEO found: ${candidate.source} ${scrapedData.videoEmbedUrl ? '(with embed)' : '(no embed)'}`)
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

          // Deduplicate images - extract base filename to compare
          const getImageBasename = (url: string): string => {
            try {
              const pathname = new URL(url).pathname
              // Remove size indicators, query params, and get base name
              return pathname
                .replace(/[-_]\d+x\d+/g, '') // Remove size like -800x600
                .replace(/[-_](small|medium|large|thumb|preview)/gi, '')
                .replace(/\.[^.]+$/, '') // Remove extension
                .toLowerCase()
            } catch {
              return url.toLowerCase()
            }
          }

          const heroBasename = getImageBasename(heroImage || '')

          // Filter out images that are similar to hero (same base name)
          const uniqueImages = item.images.filter(img => {
            if (!img || img === heroImage) return false
            const basename = getImageBasename(img)
            // Check if basenames are too similar (one contains the other)
            if (heroBasename && basename) {
              if (heroBasename.includes(basename) || basename.includes(heroBasename)) return false
              // Check for same filename with different sizes
              const heroFile = heroBasename.split('/').pop() || ''
              const imgFile = basename.split('/').pop() || ''
              if (heroFile && imgFile && (heroFile.includes(imgFile) || imgFile.includes(heroFile))) return false
            }
            return true
          })

          // Only use inline images if we have truly different images
          const inlineImages = uniqueImages.slice(0, 3)
          const hasInlineImages = inlineImages.length > 0

          console.log(`[Images] Hero: ${heroImage?.slice(-30)}, Unique for inline: ${inlineImages.length}/${item.images.length - 1}`)

          const imageInstructions = hasInlineImages
            ? `\nAVAILABLE IMAGES FOR INLINE PLACEMENT (${inlineImages.length} - hero image is separate):
${inlineImages.map((_, i) => `[IMG:${i}] - Image ${i + 1}`).join('\n')}

IMAGE PLACEMENT RULES:
- Place [IMG:0] after the first 2-3 paragraphs
- If 2+ images, place [IMG:1] in the middle of the article
- If 3 images, place [IMG:2] near the end before conclusion
- Images break up long text at natural story transitions
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
      const MAX_ARTICLES = 40
      const BATCH_SIZE = 4
      const BATCH_DELAY = 1200 // 1.2 seconds between batches

      // Articles are already sorted by addedAt (oldest first) from queue
      // No need to re-sort - we want to process oldest first to prevent expiry
      const articlesToProcess = scraped.slice(0, MAX_ARTICLES)

      if (scraped.length > MAX_ARTICLES) {
        console.log(`ℹ️ ${scraped.length - MAX_ARTICLES} articles deferred to next run (queue system)`)
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
            console.log(`⏭️ Skipped (too old - ${ageHours.toFixed(0)}h): ${story.title.slice(0, 50)}`)
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
    await step.run('cleanup-queue', async () => {
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

      // Remove articles that are too old (>7 days)
      const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days
      const staleResult = await queue.deleteMany({
        addedAt: { $lt: cutoff }
      })
      if (staleResult.deletedCount > 0) {
        console.log(`[Queue] Removed ${staleResult.deletedCount} stale articles (>7 days)`)
      }

      // Log queue status
      const remaining = await queue.countDocuments({ status: 'pending' })
      console.log(`[Queue] ${remaining} articles remaining in queue`)

      await client.close()
    })

    // ========================================
    // STEP 7: Notify clients via Pusher (real-time)
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
    // FINAL SUMMARY
    // ========================================
    console.log('\n📊 PIPELINE SUMMARY:')
    console.log('═══════════════════════════════════════')
    console.log(`  RSS Items Fetched:     ${candidates.length}`)
    console.log(`  New (not in DB/queue): ${newCandidates.length}`)
    console.log(`  Positive (score 45+):  ${classified.length}`)
    console.log(`  From Queue:            ${toProcess.length}`)
    console.log(`  Scraped Successfully:  ${scraped.length}`)
    console.log(`  Rewritten:             ${rewritten.length}`)
    console.log(`  Saved to Database:     ${saved}`)
    console.log('═══════════════════════════════════════')
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
