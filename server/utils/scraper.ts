import * as cheerio from 'cheerio'
import type { ScrapedArticle } from '~/types'

/**
 * Article Scraper
 * 
 * Extracts full article content from various news sources.
 * Uses source-specific selectors when available, falls back to generic extraction.
 * Enhanced with video support and robustness.
 */

// Timeout for fetch requests
const FETCH_TIMEOUT = 20000

// ... (existing code)



// Sites known to block scrapers
const SCRAPE_BLOCKED_DOMAINS = [
  'npr.org',
  'nytimes.com',
  'wsj.com',
  'washingtonpost.com',
  'bloomberg.com',
  'ft.com',
  'economist.com',
  'theatlantic.com',
]

// Video URL patterns - Expanded platform support
const VIDEO_PATTERNS = [
  // YouTube
  '/video/', '/videos/', 'video=', '/watch/', 'youtube.com', 'youtu.be',
  // Vimeo
  'vimeo.com',
  // Dailymotion
  'dailymotion.com', 'dai.ly',
  // Rumble
  'rumble.com',
  // Odysee / LBRY
  'odysee.com', 'lbry.tv',
  // Streamable
  'streamable.com',
  // Facebook Video
  'facebook.com/watch', 'fb.watch',
  // Twitter/X Video
  'twitter.com/i/status', 'x.com/i/status',
  // Generic
  '/clip/', '/clips/', '/embed/'
]

// Source-specific selectors
const SOURCE_SELECTORS: Record<string, {
  content: string[]
  remove: string[]
  images: string
}> = {
  'bbc.com': {
    content: ['article[data-component="text-block"]', '.ssrcss-11r1m41-RichTextComponentWrapper', 'article .story-body__inner'],
    remove: ['.ssrcss-1if1bj2-Figure', 'figure', '.media-landscape'],
    images: 'article img[src]',
  },
  'theguardian.com': {
    content: ['.article-body-commercial-selector', '.dcr-1cas496', '[data-gu-name="body"]'],
    remove: ['.ad-slot', '.submeta', 'aside', 'figure figcaption'],
    images: '.article-body-commercial-selector img[src], [data-gu-name="body"] img[src]',
  },
  'npr.org': {
    content: ['#storytext', '.storytext', '.story-text'],
    remove: ['.bucket', '.ad', '.related-content'],
    images: '#storytext img[src], .storytext img[src]',
  },
  'positive.news': {
    content: ['.entry-content', '.post-content', 'article .content'],
    remove: ['.sharedaddy', '.jp-relatedposts', '.ad'],
    images: '.entry-content img[src]',
  },
  'goodnewsnetwork.org': {
    content: ['.entry-content', '.post-content'],
    remove: ['.ad', '.related', '.sharedaddy'],
    images: '.entry-content img[src]',
  },
  'reasonstobecheerful.world': {
    content: ['.entry-content', '.post-content', 'article'],
    remove: ['.ad', '.related', '.share'],
    images: '.entry-content img[src]',
  },
  'sciencedaily.com': {
    content: ['#story_text', '.story-text', '#text'],
    remove: ['.ad', '.related'],
    images: '#story_text img[src]',
  },
  'punchng.com': {
    content: ['.entry-content', 'article'],
    remove: ['.related-posts', '.share-buttons', '.ad'],
    images: '.entry-content img[src]',
  },
  'vanguardngr.com': {
    content: ['.entry-content', 'article'],
    remove: ['.related-articles', '.ad'],
    images: '.entry-content img[src]',
  },
  'thecable.ng': {
    content: ['.article-content', '.entry-content'],
    remove: ['.related-posts', '.ad'],
    images: '.article-content img[src]',
  },
  'premiumtimesng.com': {
    content: ['.entry-content', 'article'],
    remove: ['.related-posts', '.ad'],
    images: '.entry-content img[src]',
  },
  'space.com': {
    content: ['#article-body'],
    remove: ['aside', '.ad-unit', '.advertisement', '#top-leaderboard', '.newsletter-signup', '.exit-intent', '.utility-bar', '#viafoura-comments', '.taboola-container'],
    images: '#article-body img[src]',
  },
  'carbonbrief.org': {
    content: ['.innerArt'],
    remove: ['.article-aside', '.shareArtInner', '.pum', '.artTop', '.greyBar'],
    images: '.innerArt img[src]',
  },
  'sunnyskyz.com': {
    content: ['.storytext'],
    remove: ['#rightcol', '#disqus_thread', '.ad-leader', '.sharethis-inline-share-buttons', '#footer'],
    images: '.storytext img[src]',
  },
  'medicalxpress.com': {
    content: ['.article-main'],
    remove: ['.ads', '.article-main__support', '.article-main__more', '.article-main__note', '.d-print-block'],
    images: '.article-main img[src]',
  },
}

// Generic selectors
const GENERIC_SELECTORS = {
  content: [
    'article',
    '[role="main"]',
    '.post-content',
    '.entry-content',
    '.article-content',
    '.story-content',
    '.article-body',
    '.story-body',
    'main',
    '.content',
  ],
  remove: [
    'script', 'style', 'noscript', 'iframe',
    'nav', 'header', 'footer', 'aside',
    '.ad', '.ads', '.advertisement',
    '.social', '.share', '.sharing',
    '.related', '.recommended',
    '.comments', '#comments',
    '.newsletter', '.subscribe',
    '.sidebar', '.widget',
    'form',
    // Remove promotional images (Google News, App Store badges, etc.)
    'img[src*="google-news"]', 'img[src*="googleplay"]', 'img[src*="play.google"]',
    'img[src*="appstore"]', 'img[src*="apps.apple"]',
    'img[src*="badge"]', 'img[src*="download"]',
    'img[alt*="Google News"]', 'img[alt*="App Store"]', 'img[alt*="Play Store"]',
  ],
  images: 'article img[src], main img[src], .content img[src]',
}

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return ''
  }
}

export function isBlockedDomain(url: string): boolean {
  const domain = getDomain(url)
  return SCRAPE_BLOCKED_DOMAINS.some(blocked => domain.includes(blocked))
}

function cleanText(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n/g, '\n\n')
    .trim()
}

function extractParagraphs($: cheerio.CheerioAPI, element: cheerio.Cheerio<any>): string[] {
  const paragraphs: string[] = []

  element.find('p').each((_, el) => {
    const text = $(el).text().trim()
    if (text && text.length > 20) {
      paragraphs.push(text)
    }
  })

  if (paragraphs.length === 0) {
    const text = element.text().trim()
    if (text) {
      const splits = text.split(/\n\s*\n/)
      for (const split of splits) {
        const cleaned = cleanText(split)
        if (cleaned.length > 50) {
          paragraphs.push(cleaned)
        }
      }
    }
  }

  return paragraphs
}

function getYouTubeEmbedUrl(url: string): string | undefined {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) {
      return `https://www.youtube.com/embed/${match[1]}`
    }
  }
  return undefined
}

const isVideoUrl = (url: string) => VIDEO_PATTERNS.some(p => url.toLowerCase().includes(p))

/**
 * Scrape article content from URL with retries
 */
export async function scrapeArticle(url: string, summaryFallback?: string): Promise<ScrapedArticle | null> {
  if (isBlockedDomain(url)) {
    console.log(`Skipping blocked domain: ${url}`)
    return null
  }

  // Retry logic
  let attempts = 0
  const maxAttempts = 2

  while (attempts <= maxAttempts) {
    attempts++
    try {
      return await doScrape(url, summaryFallback)
    } catch (error: any) {
      if (attempts > maxAttempts) {
        console.error(`Failed to scrape ${url} after ${attempts} attempts:`, error.message)
        return null
      }
      // Wait before retry
      await new Promise(r => setTimeout(r, 1000 * attempts))
    }
  }
  return null
}

async function doScrape(url: string, summaryFallback?: string): Promise<ScrapedArticle | null> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT)

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) throw new Error(`Status ${response.status}`)

    const html = await response.text()
    const $ = cheerio.load(html)

    // Check if video content
    const isVideo = isVideoUrl(url)
    let videoEmbedUrl = getYouTubeEmbedUrl(url)

    // Attempt to scrape video embed if not found in URL
    if (isVideo && !videoEmbedUrl) {
      // Try og:video meta tags
      videoEmbedUrl = $('meta[property="og:video:url"]').attr('content')
        || $('meta[property="og:video:secure_url"]').attr('content')
        || $('meta[property="og:video"]').attr('content')
        || $('meta[name="twitter:player"]').attr('content')

      // Try iframes - extract ANY video embed found
      if (!videoEmbedUrl) {
        $('iframe').each((_, iframe) => {
          const src = $(iframe).attr('src') || ''
          // Accept any iframe with a src (most video embeds use iframes)
          if (src && src.startsWith('http')) {
            videoEmbedUrl = src
            return false // Stop at first valid embed
          }
        })
      }
    }

    // Clean unwanted elements
    const domain = getDomain(url)
    const selectors = Object.entries(SOURCE_SELECTORS).find(([key]) => domain.includes(key))?.[1]
    const removeSelectors = [...GENERIC_SELECTORS.remove, ...(selectors?.remove || [])]
    removeSelectors.forEach(s => $(s).remove())

    let content = ''

    if (isVideo) {
      // Video scraping strategy: getDescription + Summary
      const metaDesc = $('meta[name="description"]').attr('content')
        || $('meta[property="og:description"]').attr('content') || ''

      const videoDesc: string[] = []
      $('.video-description, .video-summary, .vjs-description').each((_, el) => {
        const text = $(el).text().trim()
        if (text.length > 20) videoDesc.push(text)
      })

      // Fallback to RSS summary if available
      content = [summaryFallback, metaDesc, ...videoDesc].filter(Boolean).join('\n\n')

      if (content.length < 50 && summaryFallback) {
        content = summaryFallback // Use at least the summary
      }
    } else {
      // Regular article scraping strategy
      let contentElement: cheerio.Cheerio<any> | null = null

      // Try specific selectors
      if (selectors?.content) {
        for (const sel of selectors.content) {
          if ($(sel).length) {
            contentElement = $(sel).first()
            break
          }
        }
      }

      // Try generic selectors
      if (!contentElement) {
        for (const sel of GENERIC_SELECTORS.content) {
          if ($(sel).length) {
            contentElement = $(sel).first()
            break
          }
        }
      }

      if (contentElement) {
        content = extractParagraphs($, contentElement).join('\n\n')
      }
    }

    if (!content || (content.length < 100 && !isVideo)) {
      // Last ditch effort: if we have a summary and it's substantial, use it
      // For videos, we accept shorter summaries since the video is the main content
      if (summaryFallback && (summaryFallback.length > 200 || (isVideo && summaryFallback.length > 20))) {
        content = summaryFallback
      } else {
        console.error(`Not enough content found for ${url}`)
        return null
      }
    }

    // Extract images
    const images: string[] = []
    const imageSelector = selectors?.images || GENERIC_SELECTORS.images

    // Keywords that indicate an irrelevant image (junk/UI)
    const JUNK_KEYWORDS = [
      'icon', 'logo', 'avatar', 'author', 'button', 'social',
      'share', 'newsletter', 'widget', 'shim', 'spacer', 'pixel',
      'tracker', 'ad-', 'advert', 'promo', 'spinner', 'loader',
      'banner', 'footer', 'header', 'nav', 'menu', 'related',
      'sponsored', 'partner', 'brand', 'default', 'placeholder',
      'background', 'bg-', 'overlay', 'chart', 'graph',
      // Store Badges & News Aggregators
      'google-news', 'google_news', 'googleplay', 'appstore', 'play.google',
      'badge', 'download', 'subscribe', 'follow', 'rss'
    ]

    $(imageSelector).each((_, el) => {
      const $el = $(el)
      const src = $el.attr('src') || $el.attr('data-src')

      if (!src || src.includes('data:') || src.includes('placeholder')) return

      // check for explicit small dimensions in HTML
      const width = parseInt($el.attr('width') || '0')
      const height = parseInt($el.attr('height') || '0')
      if ((width > 0 && width < 150) || (height > 0 && height < 150)) return

      // Check against junk keywords
      const lowerSrc = src.toLowerCase()
      if (JUNK_KEYWORDS.some(kw => lowerSrc.includes(kw))) return

      // Filter out 1x1 pixels or common tracking patterns often found in filenames
      if (lowerSrc.includes('1x1') || lowerSrc.includes('0x0')) return

      try {
        const absoluteUrl = new URL(src, url).href
        if (!images.includes(absoluteUrl)) images.push(absoluteUrl)
      } catch { }
    })

    const ogImage = $('meta[property="og:image"]').attr('content')
    if (ogImage && !images.includes(ogImage)) {
      // OG Image is usually high quality, put it first
      images.unshift(ogImage)
    }

    // Metadata
    const title = $('meta[property="og:title"]').attr('content')
      || $('h1').first().text().trim() || $('title').text().trim()

    const author = $('meta[name="author"]').attr('content')
      || $('[rel="author"]').first().text().trim()

    const publishedAt = $('meta[property="article:published_time"]').attr('content')
      || $('time[datetime]').attr('datetime')

    // Fix partial video embeds
    if (videoEmbedUrl && videoEmbedUrl.startsWith('//')) {
      videoEmbedUrl = 'https:' + videoEmbedUrl
    }

    return {
      title: cleanText(title),
      content,
      // Increased limit to 25 to capture full galleries + smart filtering ensures quality
      images: images.slice(0, 25),
      author,
      publishedAt,
      videoEmbedUrl,
      isVideo
    }

  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error('Timeout')
    }
    throw error
  }
}

export async function isScrapeable(url: string): Promise<boolean> {
  if (isBlockedDomain(url)) return false
  return true
  // Simplified for speed - we'll just try to scrape it and fail if needed
}
