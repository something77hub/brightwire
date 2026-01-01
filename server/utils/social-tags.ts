/**
 * Centralized logic for generating viral social media hashtags
 * Used by both manual download package and Ayrshare integration
 */

export const SOCIAL_TAGS_CONFIG = {
    // Always include these high-volume viral tags (limit to 3-4)
    CORE: ['#GoodNews', '#PositiveNews', '#BrightWire', '#DailyMotivation'],

    // Platform specific limits
    LIMITS: {
        INSTAGRAM: 30, // Hard limit
        TWITTER: 4,    // Soft limit for readability
    }
}

const CATEGORY_TAGS: Record<string, string[]> = {
    'heroes': ['#Hero', '#Inspiration', '#RealHeroes', '#Community', '#BeTheChange'],
    'planet': ['#ClimateAction', '#Nature', '#Sustainability', '#Earth', '#Eco'],
    'innovation': ['#Innovation', '#TechForGood', '#Future', '#Science', '#Breakthrough'],
    'solutions': ['#Solutions', '#Progress', '#SocialImpact', '#Change', '#Hope'],
    'kindness': ['#Kindness', '#BeKind', '#Love', '#Humanity', '#Heartwarming'],
    'good-news': ['#Uplifting', '#GoodVibes', '#HappyNews', '#Smile', '#Joy'],
}

const DAY_TAGS: Record<number, string[]> = {
    0: ['#SundayVibes'],
    1: ['#MondayMotivation'],
    2: ['#Tuesdaythoughts'],
    3: ['#WednesdayWisdom'],
    4: ['#ThursdayThoughts'],
    5: ['#FridayFeeling', '#TGIF'],
    6: ['#SaturdayVibes'],
}

/**
 * Generate optimized hashtags for Instagram/Facebook (Max reach)
 */
export function generateViralHashtags(article: any): string {
    const category = article.category || 'good-news'
    const tags = article.tags || [] // These are now the "Smart Tags" from Claude

    // 1. Core Branding (3-4)
    const core = SOCIAL_TAGS_CONFIG.CORE

    // 2. Category Specific (2-3)
    const catTags = (CATEGORY_TAGS[category] || CATEGORY_TAGS['good-news']).slice(0, 3)

    // 3. Smart Dynamic Tags from AI (Priority!)
    // Filter out any that mimic categories or core tags
    const smartTags = tags
        .map((t: string) => t.replace(/[^a-zA-Z0-9]/g, ''))
        .filter((t: string) => t.length > 2)
        .map((t: string) => `#${t}`)
        .slice(0, 7) // Take up to 7 high-impact tags

    // 4. Day of Week (1)
    const dayTags = DAY_TAGS[new Date().getDay()] || []

    // Combine unique tags
    const allTags = new Set([
        ...core,
        ...smartTags,
        ...catTags,
        ...dayTags
    ])

    // Convert to array and slice to safe limit (15-20 is sweet spot, max 30)
    return Array.from(allTags).slice(0, 20).join(' ')
}

/**
 * Generate short hashtags for Twitter (3-4 max)
 */
export function generateTwitterHashtags(article: any): string {
    const tags = article.tags || []

    // 1. Primary tag (Context)
    const category = article.category || 'good-news'
    const mainCatTag = CATEGORY_TAGS[category]?.[0] || '#GoodNews'

    // 2. Best Smart Tag (Viral Topic)
    const bestSmartTag = tags[0] ? `#${tags[0].replace(/[^a-zA-Z0-9]/g, '')}` : ''

    // 3. Brand
    const brand = '#BrightWire'

    const twitterTags = [mainCatTag, bestSmartTag, brand].filter(Boolean)

    return Array.from(new Set(twitterTags)).join(' ')
}
