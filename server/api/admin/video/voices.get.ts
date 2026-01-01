import { requireAdminAuth } from '~/server/utils/admin-auth'

// List available HeyGen voices
export default defineEventHandler(async (event) => {
  await requireAdminAuth(event)
  
  const config = useRuntimeConfig()
  const apiKey = config.heygenApiKey
  
  if (!apiKey) {
    throw createError({
      statusCode: 400,
      message: 'HeyGen API key not configured'
    })
  }
  
  try {
    const response = await fetch('https://api.heygen.com/v2/voices', {
      headers: {
        'X-Api-Key': apiKey,
        'Accept': 'application/json',
      },
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch voices')
    }
    
    // Return formatted voice list
    const voices = data.data?.voices || []
    
    // Sort by language (English first) and then by name
    const sortedVoices = voices.sort((a: any, b: any) => {
      const aLang = a.language || ''
      const bLang = b.language || ''
      if (aLang.startsWith('en') && !bLang.startsWith('en')) return -1
      if (!aLang.startsWith('en') && bLang.startsWith('en')) return 1
      return (a.name || '').localeCompare(b.name || '')
    })
    
    return {
      voices: sortedVoices.map((voice: any) => ({
        voice_id: voice.voice_id,
        name: voice.name || voice.display_name || 'Unknown',
        language: voice.language || 'Unknown',
        gender: voice.gender || 'Unknown',
        preview_audio: voice.preview_audio,
        type: voice.type,
      })),
      total: sortedVoices.length,
    }
  } catch (error: any) {
    console.error('[HeyGen] Failed to fetch voices:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to fetch voices'
    })
  }
})
