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

    const prompt = `You are a charismatic, viral news anchor for "BrightWire" - a positive news channel.
Your task is to write a script for a 60-second vertical video (TikTok/Reels style) covering these specific stories.

INPUT CONTEXT:
${articleContext}

STYLE GUIDELINES (${style}):
- engaging: High energy, hook the viewer instantly, smooth transitions.
- quick: Fast-paced, punchy, no fluff.
- storyteller: Warm, emotional, focus on the human element.
- roundup: "Here are 3 things you need to know today" format.

CRITICAL INSTRUCTIONS:
1. **HOOK**: Start with a "scroll-stopper" (e.g., "You won't believe this...", "Stop scrolling!").
2. **Scenes**: Break the script into distinct SCENES.
   - Scene 1: Intro/Hook (Anchor on camera or generic background).
   - Story Scenes: ONE scene per story. When you talk about Article 1, it MUST be a separate scene linked to Article 1's ID.
   - Outro: Call to action (Follow for more good news).
3. **Alignment**: The "text" for a Story Scene must ONLY be about that story. Do not mix stories in one block.
4. **Length**: Total spoken word count should be ~130-150 words for a 60s video.
5. **Tone**: Optimistic, clear, modern.

OUTPUT FORMAT (JSON ONLY):
{
  "title": "Viral Video Title",
  "scenes": [
    {
      "type": "intro",
      "text": "Stop scrolling! Here is the best news you need to see today. I'm [Name] with BrightWire."
    },
    {
      "type": "story",
      "articleId": "ID_OF_ARTICLE_1",
      "text": "First up, in Japan, a revolutionary clean energy breakthrough..."
    },
    {
      "type": "story",
      "articleId": "ID_OF_ARTICLE_2",
      "text": "And check this out. A dog that was missing for 5 years just reunited with..."
    },
    {
      "type": "outro",
      "text": "The world is better than you think. Follow BrightWire for your daily dose of hope!"
    }
  ]
}

Return ONLY valid JSON. No markdown formatting.
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
