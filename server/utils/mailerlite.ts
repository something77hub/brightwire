// MailerLite API utility with proper rate limit handling
// Rate limit: 120 requests per minute globally

export async function mailerliteFetch(
  url: string, 
  options: RequestInit = {}
): Promise<Response> {
  const apiKey = process.env.MAILERLITE_API_KEY
  
  if (!apiKey) {
    throw new Error('MailerLite API key not configured')
  }
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      ...options.headers,
    },
  })
  
  // Check rate limit headers
  const remaining = response.headers.get('X-RateLimit-Remaining')
  const retryAfter = response.headers.get('Retry-After')
  
  if (remaining) {
    console.log(`[MailerLite] Rate limit remaining: ${remaining}/120`)
  }
  
  // Handle rate limit (429)
  if (response.status === 429) {
    const waitSeconds = retryAfter ? parseInt(retryAfter, 10) : 60
    console.log(`[MailerLite] Rate limited! Waiting ${waitSeconds}s before retry...`)
    
    await new Promise(r => setTimeout(r, waitSeconds * 1000))
    
    // Retry once after waiting
    return fetch(url, {
      ...options,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        ...options.headers,
      },
    })
  }
  
  return response
}

// Helper to add delay between requests when doing bulk operations
// 120 requests/min = 2 requests/sec = 500ms between requests (with buffer)
export async function rateLimitDelay(ms: number = 550): Promise<void> {
  await new Promise(r => setTimeout(r, ms))
}
