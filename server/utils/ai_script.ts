import Anthropic from '@anthropic-ai/sdk'
import type { Story } from '~/types'

export interface VideoScene {
  type: 'intro' | 'story' | 'outro'
  text: string
  articleId?: string // Only for 'story' type
  imagePrompt?: string // For intro/outro background generation if needed
  duration?: number // Estimated duration in seconds
}

export interface VideoScriptResponse {
  scenes: VideoScene[]
  title: string
  estimatedDuration: number
}

export async function generateVideoScript(articles: Story[], style: string = 'engaging'): Promise<VideoScriptResponse> {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

  const articleContext = articles.map((a, i) => `
ARTICLE ${i + 1} (ID: ${a._id || a.guid}):
TITLE: ${a.title}
SUMMARY: ${a.summary}
CONTENT_SNIPPET: ${a.content?.slice(0, 500) || ''}
CATEGORY: ${a.category}
SOURCE: ${a.originalSource}
`).join('\n---\n')

  const prompt = `You are a viral content creator for "BrightWire" - the #1 source for good news on social media.

Create a SHORT-FORM VIDEO SCRIPT (45-60 seconds) for TikTok/Instagram Reels featuring these stories:

${articleContext}

CRITICAL SCRIPT RULES:

1. **HOOK (First 3 seconds):**
   - Must be a PATTERN INTERRUPT (question, shocking stat, "wait what?!")
   - Examples: "This is insane...", "You need to see this", "Plot twist of the century"
   - NO generic greetings like "Hey guys!"

2. **STRUCTURE:**
   - Hook (3s)
   - Story 1 with visual transition (15-20s)
   - Story 2 with visual transition (15-20s) 
   - Story 3 with visual transition (15-20s)
   - CTA (3-5s): "Follow for daily good news"

3. **VISUAL CUES (CRITICAL FOR AVATAR):**
   - Each story MUST include [CUT TO: story description]
   - This tells HeyGen when to switch background images
   - Example: "[CUT TO: Image of the solar farm] In Arizona, they just built..."
   - This eliminates background bleeding issues!

4. **NATURAL SPEECH:**
   - Write how people ACTUALLY talk (contractions, casual)
   - Short sentences (10-15 words MAX)
   - Pause points with [BEAT] for emphasis
   - NO bullet points, NO hashtags in speech

5. **ENGAGEMENT TACTICS:**
   - Use "you" frequently (direct address)
   - Ask rhetorical questions
   - Build curiosity ("here's the crazy part...")
   - End with strong CTA

6. **LENGTH:**
   - Total: 120-140 words (for 45-60 seconds)
   - Each story: 35-45 words
   - Natural pacing, not rushed

EXAMPLE OUTPUT:

{
  "title": "Good News You Didn't See Today",
  "scenes": [
    {
      "type": "intro",
      "text": "Stop. You need to hear this. [BEAT] Three incredible things happened today that nobody's talking about."
    },
    {
      "type": "story",
      "articleId": "ARTICLE_1_ID",
      "text": "[CUT TO: Solar panels in Arizona desert] In Arizona, they just powered an entire town with solar for 72 hours straight. [BEAT] Zero emissions. And it only cost them half of what coal would've."
    },
    {
      "type": "story",
      "articleId": "ARTICLE_2_ID",
      "text": "[CUT TO: Dog reunion photo] This dog was missing for six years. Six YEARS. [BEAT] His owner never gave up. And yesterday? [BEAT] A shelter 300 miles away found him. They're together right now."
    },
    {
      "type": "story",
      "articleId": "ARTICLE_3_ID",
      "text": "[CUT TO: Scientists in lab] Scientists just figured out how to turn CO2 into fuel. Like, actual gasoline. [BEAT] This could change everything."
    },
    {
      "type": "outro",
      "text": "The world is better than the news makes it seem. Follow BrightWire for more stories like this."
    }
  ]
}

NOW CREATE THE SCRIPT FOR THE PROVIDED ARTICLES.
Return ONLY valid JSON. No markdown, no code blocks, no extra text.
`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    })

    const rawText = response.content[0].type === 'text' ? response.content[0].text : ''

    // Clean JSON
    const cleanJson = rawText
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim()

    const parsed = JSON.parse(cleanJson)

    // Estimate durations (approx 150 words per minute = 2.5 words per second)
    const scenesWithDuration = parsed.scenes.map((scene: VideoScene) => ({
      ...scene,
      duration: Math.ceil(scene.text.split(/\s+/).length / 2.5)
    }))

    return {
      title: parsed.title,
      scenes: scenesWithDuration,
      estimatedDuration: scenesWithDuration.reduce((acc: number, s: VideoScene) => acc + (s.duration || 0), 0)
    }

  } catch (error) {
    console.error('Failed to generate video script:', error)
    // Fallback? Or just rethrow to let the UI handle it
    throw new Error('AI Script Generation Failed')
  }
}
