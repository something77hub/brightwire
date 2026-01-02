import { requireAdminAuth } from '~/server/utils/admin-auth'

// Post to social media via Ayrshare
export default defineEventHandler(async (event) => {
  await requireAdminAuth(event)

  const config = useRuntimeConfig()
  const apiKey = config.ayrshareApiKey

  if (!apiKey) {
    throw createError({
      statusCode: 400,
      message: 'Ayrshare API key not configured. Add AYRSHARE_API_KEY to environment variables.'
    })
  }

  const body = await readBody(event)
  console.log('[Ayrshare] Received body:', JSON.stringify(body))
  console.log('[Ayrshare] POST CONTENT PREVIEW (first 300 chars):', body.post?.slice(0, 300))

  const { post, platforms, mediaUrl, scheduleDate } = body

  if (!post) {
    throw createError({
      statusCode: 400,
      message: 'Post content is required'
    })
  }

  if (!platforms || !Array.isArray(platforms) || platforms.length === 0) {
    console.log('[Ayrshare] Invalid platforms:', platforms)
    throw createError({
      statusCode: 400,
      message: 'At least one platform is required. Make sure you have connected social accounts on ayrshare.com first.'
    })
  }

  // Normalize platform names to lowercase (Ayrshare expects lowercase)
  const normalizedPlatforms = platforms.map((p: string) => p.toLowerCase())

  console.log('[Ayrshare] Platforms to post to:', normalizedPlatforms)

  // POST TO EACH PLATFORM INDIVIDUALLY
  // This prevents one platform's error from killing posts to other platforms
  const results = {
    successes: [] as Array<{ platform: string, postId?: string }>,
    failures: [] as Array<{ platform: string, error: string }>,
    scheduled: !!scheduleDate
  }

  for (const platform of normalizedPlatforms) {
    try {
      // Build request for this single platform
      const requestBody: any = {
        post,
        platforms: [platform] // Single platform only
      }

      // Add media if provided
      if (mediaUrl) {
        requestBody.mediaUrls = [mediaUrl]
      }

      // Add schedule if provided
      if (scheduleDate) {
        requestBody.scheduleDate = new Date(scheduleDate).toISOString()
      }

      console.log(`[Ayrshare] Posting to ${platform}:`, JSON.stringify(requestBody))

      // Make the API call for this platform
      const response = await fetch('https://app.ayrshare.com/api/post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(requestBody)
      })

      const data = await response.json()
      console.log(`[Ayrshare] ${platform} response:`, JSON.stringify(data))

      // Check for errors
      if (data.status === 'error' || data.errors?.length > 0 || !response.ok) {
        const errorMsg = data.errors?.[0]?.message || data.message || data.error || 'Unknown error'
        console.error(`[Ayrshare] ${platform} failed:`, errorMsg)

        // Log failure but continue to next platform
        results.failures.push({
          platform,
          error: errorMsg
        })
      } else {
        // Success!
        console.log(`[Ayrshare] ✅ ${platform} posted successfully`)
        results.successes.push({
          platform,
          postId: data.postIds?.[0] || data.id
        })
      }
    } catch (error: any) {
      // Catch network errors or unexpected failures
      console.error(`[Ayrshare] ${platform} exception:`, error.message)
      results.failures.push({
        platform,
        error: error.message || 'Network error'
      })
    }
  }

  // Return partial success if ANY platform succeeded
  if (results.successes.length > 0) {
    const successPlatforms = results.successes.map(s => s.platform).join(', ')
    const failurePlatforms = results.failures.map(f => `${f.platform} (${f.error})`).join(', ')

    return {
      success: true,
      partialFailure: results.failures.length > 0,
      successes: results.successes,
      failures: results.failures,
      scheduled: results.scheduled,
      message: results.failures.length > 0
        ? `Posted to ${successPlatforms}. Failed: ${failurePlatforms}`
        : scheduleDate
          ? `Scheduled for ${new Date(scheduleDate).toLocaleString()}`
          : `Posted to ${successPlatforms} successfully!`
    }
  }

  // All platforms failed - return error but don't throw
  const allErrors = results.failures.map(f => `${f.platform}: ${f.error}`).join('; ')
  return {
    success: false,
    successes: [],
    failures: results.failures,
    scheduled: false,
    message: `All platforms failed: ${allErrors}`
  }
})
