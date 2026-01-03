export interface Story {
  _id?: string
  guid: string
  slug: string
  title: string
  summary: string
  content: string              // Full AI-rewritten article
  originalSource: string       // "BBC News" (for attribution, no link)
  sourceUrl?: string           // Link to original article
  videoEmbedUrl?: string       // Embeddable video URL (YouTube, etc.)
  category: StoryCategory
  score: number
  imageUrl?: string            // Cloudinary proxied URL
  images: string[]             // All images in article (Cloudinary URLs)
  author: string               // "BrightWire Staff"
  readTime: number             // Estimated minutes
  publishedAt: Date
  createdAt: Date
  featured?: boolean
  tags: string[]
}

export type StoryCategory =
  | 'good-news'      // Daily Mix - general feel-good stories
  | 'heroes'         // Community Heroes - people making a difference
  | 'planet'         // Planet Wins - environment, nature, climate victories
  | 'innovation'     // Innovation - tech, science breakthroughs
  | 'solutions'      // Solutions - systemic fixes, policy wins
  | 'kindness'       // Acts of Kindness - heartwarming human moments
  | 'sports'         // Sports - wins, records, teamwork
  | 'world'          // World/International - specific country news (Nigeria, India, etc.)
  | 'health'         // Health & Wellness - medical breakthroughs, mental health
  | 'video'          // Video content

// Advertisement Types
export type AdType =
  | 'newsletter'     // Newsletter Sponsorship
  | 'sponsored'      // Sponsored Article
  | 'display'        // Display Advertising (banners)
  | 'category'       // Category Sponsorship

export type AdPlacement =
  | 'header'         // Top of page banner
  | 'sidebar'        // Sidebar ad
  | 'in-feed'        // Between articles
  | 'article-top'    // Top of article
  | 'article-bottom' // Bottom of article
  | 'newsletter'     // In newsletter
  | 'category-header'// Category page header

export type AdStatus = 'draft' | 'pending' | 'active' | 'paused' | 'expired' | 'rejected'

export interface Advertisement {
  _id?: string
  name: string                 // Internal name for reference
  advertiser: string           // Company name
  type: AdType
  placement: AdPlacement
  status: AdStatus

  // Content
  headline?: string            // Ad headline
  description?: string         // Ad description/body
  imageUrl?: string            // Banner image URL
  linkUrl: string              // Click destination
  ctaText?: string             // Call to action button text

  // Sponsored article specific
  articleSlug?: string         // If type is 'sponsored', links to article

  // Category sponsorship specific
  sponsoredCategory?: StoryCategory  // Which category they sponsor
  sponsorText?: string         // "Brought to you by..."

  // Scheduling
  startDate: Date
  endDate: Date

  // Targeting
  targetCategories?: StoryCategory[] // Show only on these categories

  // Priority & Rotation
  priority?: number            // 1-10, higher = shows more often (default: 5)
  weight?: number              // Custom weight for rotation (default: 1)

  // Pricing & Billing
  priceType: 'fixed' | 'cpm' | 'cpc'
  priceAmount: number          // Dollar amount
  budget?: number              // Total budget cap
  spent?: number               // Amount spent so far

  // Stats
  impressions: number
  clicks: number

  // Contact
  contactName: string
  contactEmail: string

  // Meta
  createdAt: Date
  updatedAt: Date
  notes?: string               // Internal notes
}

export interface AdStats {
  totalImpressions: number
  totalClicks: number
  ctr: number                  // Click-through rate
  revenue: number
}

export interface ClassificationResult {
  sentiment: 'positive' | 'negative' | 'neutral'
  score: number
  category: StoryCategory
  reason: string
}

export interface ScrapedArticle {
  title: string
  content: string
  images: string[]
  author?: string
  publishedAt?: string
  videoEmbedUrl?: string
  isVideo?: boolean
}

export interface RewrittenArticle {
  title: string
  content: string              // Markdown formatted
  summary: string              // 2-3 sentence summary
  tags: string[]
  readTime: number
}

export interface NewsSource {
  name: string
  feed: string
  logo?: string
  baseUrl: string
  selectors?: {                // CSS selectors for scraping
    content: string
    images?: string
    author?: string
  }
  forcedCategory?: StoryCategory // Explicitly force this category (skip AI classification)
}

export interface CategoryInfo {
  id: StoryCategory | 'all'
  label: string
  emoji: string
  color: string
}
