import Anthropic from '@anthropic-ai/sdk'
import type { RewrittenArticle, ScrapedArticle, StoryCategory } from '~/types'

let anthropic: Anthropic | null = null

function getClient(): Anthropic {
  if (anthropic) return anthropic

  const config = useRuntimeConfig()
  const apiKey = config.anthropicApiKey

  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY environment variable is not set')
  }

  anthropic = new Anthropic({ apiKey })
  return anthropic
}

/**
 * Rewrite an article in BrightWire's voice
 * 
 * This transforms the original content into original writing that:
 * - Maintains all factual information
 * - Uses BrightWire's warm, optimistic tone
 * - Restructures and rewrites sentences (not copy-paste)
 * - Adds context and hopeful framing where appropriate
 */
export async function rewriteArticle(
  scraped: ScrapedArticle,
  category: StoryCategory,
  originalSource?: string,
  originalUrl?: string
): Promise<RewrittenArticle | null> {
  const client = getClient()

  const categoryContext: Record<StoryCategory, string> = {
    solutions: 'Focus on the problem being solved and the positive impact.',
    heroes: 'Highlight the human element and what makes this person/group inspiring.',
    planet: 'Emphasize the environmental win and hope for the planet.',
    innovation: 'Explain the breakthrough in accessible terms and its potential.',
    'good-news': 'Find the uplifting angle and human interest.',
    kindness: 'Capture the warmth, generosity and humanity of the story.',
  }

  // Detect if this is video content (short source material)
  const isVideoContent = scraped.content.length < 500
  const contentType = isVideoContent ? 'VIDEO SUMMARY' : 'ARTICLE'
  const lengthGuidance = isVideoContent 
    ? '200-400 words (shorter since source is limited)' 
    : '300-600 words'

  const prompt = `You are a journalist for BrightWire, a positive news publication. Your job is to REWRITE the following ${contentType.toLowerCase()} in your own words.

TODAY'S DATE: ${new Date().toISOString().split('T')[0]}

ORIGINAL ${contentType}:
Title: ${scraped.title}
Source: ${originalSource || 'Unknown'}
Content:
${scraped.content}

CATEGORY: ${category}
ANGLE: ${categoryContext[category]}

CRITICAL RULES FOR FACTUAL ACCURACY:
1. ONLY include facts that are EXPLICITLY stated in the original content above
2. NEVER invent quotes, statistics, names, dates, or any details not in the original
3. NEVER add information from your training data or general knowledge
4. NEVER add context about people's titles, positions, or roles unless explicitly stated in the original
5. If the original mentions a person, use ONLY the title/description given in the original text
6. Keep all numbers, names, and specific claims EXACTLY as stated in the original
7. If something is unclear in the original, omit it rather than guessing
8. DO NOT speculate about causes, effects, or implications not stated in the original
9. DO NOT add "former", "current", or any modifiers to titles unless the original explicitly uses them

EXAMPLE OF WHAT NOT TO DO:
- Original says "President Trump" → DO NOT change to "former President Trump" or "President-elect Trump"
- Original says "CEO Smith" → DO NOT add company name unless original includes it

WRITING INSTRUCTIONS:
1. Rewrite in BrightWire's voice: warm, hopeful, accessible
2. Every sentence must be your own words (no copy-paste)
3. Lead with the most exciting/hopeful aspect
4. Length: ${lengthGuidance}
5. Short paragraphs (2-3 sentences each)
6. End on a hopeful note IF the original supports it
7. Include "[P]" marker between paragraphs

FORMAT YOUR RESPONSE AS JSON:
{
  "title": "Your rewritten headline (factual, clear, positive)",
  "content": "Your rewritten article. Use [P] between paragraphs.",
  "summary": "A 2-3 sentence summary using ONLY facts from the original",
  "tags": ["tag1", "tag2", "tag3"],
  "keyFacts": ["fact1", "fact2", "fact3"] // 3-5 key facts you preserved from original
}

IMPORTANT: Return ONLY valid JSON. No markdown blocks. No explanations.`

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const content = response.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response type')
    }

    // Parse JSON response
    let result: RewrittenArticle
    try {
      // Try to extract JSON if wrapped in code blocks
      let jsonText = content.text.trim()
      if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/```json?\n?/g, '').replace(/```$/g, '').trim()
      }
      result = JSON.parse(jsonText)
    } catch (parseError) {
      console.error('Failed to parse rewrite response:', content.text.slice(0, 200))
      return null
    }

    // Calculate read time (average 200 words per minute)
    const wordCount = result.content.split(/\s+/).length
    const readTime = Math.max(1, Math.ceil(wordCount / 200))

    return {
      ...result,
      readTime,
    }

  } catch (error) {
    console.error('Article rewrite error:', error)
    return null
  }
}

/**
 * Generate a URL-friendly slug from a title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')     // Remove special chars
    .replace(/\s+/g, '-')              // Replace spaces with hyphens
    .replace(/-+/g, '-')               // Remove duplicate hyphens
    .replace(/^-|-$/g, '')             // Remove leading/trailing hyphens
    .slice(0, 80)                      // Limit length
}

/**
 * Classify and rewrite in a single API call (more efficient)
 */
export async function classifyAndRewrite(
  title: string,
  summary: string,
  scraped: ScrapedArticle
): Promise<{
  classification: {
    sentiment: 'positive' | 'negative' | 'neutral'
    score: number
    category: StoryCategory
  }
  article: RewrittenArticle
} | null> {
  const client = getClient()

  const prompt = `You are a journalist for BrightWire, a positive news publication. Analyze and potentially rewrite this article.

ORIGINAL HEADLINE: ${title}
RSS SUMMARY: ${summary}
FULL ARTICLE:
${scraped.content.slice(0, 4000)}

TASK 1 - CLASSIFY:
Determine if this is genuinely positive news worthy of BrightWire.
- Score 0-100 on how uplifting/hopeful the story is
- Only score 70+ if genuinely positive (not just "not bad")

TASK 2 - IF POSITIVE (score >= 70), REWRITE:
Create a new article in BrightWire's voice:
- Warm, hopeful, accessible, engaging tone
- 400-800 words, short paragraphs
- Lead with the most exciting aspect
- End on a hopeful note
- DO NOT copy original sentences

CATEGORY OPTIONS: solutions, heroes, planet, innovation, kindness, good-news

RESPOND WITH JSON ONLY:
{
  "sentiment": "positive" | "negative" | "neutral",
  "score": <number 0-100>,
  "category": "<category>",
  "reason": "<brief reason for score>",
  "article": {
    "title": "<rewritten headline>",
    "content": "<full rewritten article in markdown>",
    "summary": "<2-3 sentence preview>",
    "tags": ["tag1", "tag2", "tag3"]
  } // Include article ONLY if score >= 70, otherwise null
}`

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 2500,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const content = response.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response type')
    }

    // Parse JSON response
    let jsonText = content.text.trim()
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```json?\n?/g, '').replace(/```$/g, '').trim()
    }
    
    const result = JSON.parse(jsonText)

    if (result.score < 70 || !result.article) {
      return null
    }

    // Calculate read time
    const wordCount = result.article.content.split(/\s+/).length
    const readTime = Math.max(1, Math.ceil(wordCount / 200))

    return {
      classification: {
        sentiment: result.sentiment,
        score: result.score,
        category: result.category,
      },
      article: {
        ...result.article,
        readTime,
      },
    }

  } catch (error) {
    console.error('Classify and rewrite error:', error)
    return null
  }
}
