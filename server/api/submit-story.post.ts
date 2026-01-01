export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { name, email, storyUrl, description, source } = body

  // Validate required fields
  if (!name || !email || !description) {
    throw createError({
      statusCode: 400,
      message: 'Name, email, and description are required',
    })
  }

  // Validate email format
  if (!email.includes('@')) {
    throw createError({
      statusCode: 400,
      message: 'Valid email is required',
    })
  }

  const resendApiKey = process.env.RESEND_API_KEY

  // If Resend is not configured, log and return success (for development)
  if (!resendApiKey) {
    console.log(`[Story Submission] New submission (Resend not configured):`)
    console.log(`  From: ${name} <${email}>`)
    console.log(`  URL: ${storyUrl || 'Not provided'}`)
    console.log(`  Source: ${source || 'Not provided'}`)
    console.log(`  Description: ${description}`)
    return {
      success: true,
      message: 'Story submitted! We\'ll review it soon.',
    }
  }

  try {
    // Send email via Resend
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: 'BrightWire Submissions <noreply@brightwire.news>',
        to: ['contact@brightwire.news'],
        reply_to: email,
        subject: `[Story Submission] New story from ${name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #F59E0B, #EA580C); padding: 20px; border-radius: 12px 12px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 24px;">📝 New Story Submission</h1>
            </div>
            
            <div style="background: #FFFBEB; padding: 24px; border-radius: 0 0 12px 12px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #92400E; font-weight: bold; width: 100px;">From:</td>
                  <td style="padding: 8px 0; color: #78350F;">${name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #92400E; font-weight: bold;">Email:</td>
                  <td style="padding: 8px 0;"><a href="mailto:${email}" style="color: #D97706;">${email}</a></td>
                </tr>
                ${storyUrl ? `
                <tr>
                  <td style="padding: 8px 0; color: #92400E; font-weight: bold;">Story URL:</td>
                  <td style="padding: 8px 0;"><a href="${storyUrl}" style="color: #D97706;">${storyUrl}</a></td>
                </tr>
                ` : ''}
                ${source ? `
                <tr>
                  <td style="padding: 8px 0; color: #92400E; font-weight: bold;">Source:</td>
                  <td style="padding: 8px 0; color: #78350F;">${source}</td>
                </tr>
                ` : ''}
              </table>
              
              <div style="margin-top: 20px; padding: 16px; background: white; border-radius: 8px; border-left: 4px solid #F59E0B;">
                <p style="color: #92400E; font-weight: bold; margin: 0 0 8px 0;">Why this story:</p>
                <p style="color: #78350F; margin: 0; white-space: pre-wrap;">${description}</p>
              </div>
              
              <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid #FDE68A;">
                ${storyUrl ? `<a href="${storyUrl}" style="display: inline-block; background: #F59E0B; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-right: 10px;">View Story</a>` : ''}
                <a href="mailto:${email}" style="display: inline-block; background: #78350F; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: bold;">Reply to ${name}</a>
              </div>
            </div>
          </div>
        `,
        text: `
New Story Submission for BrightWire

From: ${name}
Email: ${email}
${storyUrl ? `Story URL: ${storyUrl}` : ''}
${source ? `Source: ${source}` : ''}

Why this story:
${description}

---
Reply directly to this email to respond to ${name}.
        `.trim(),
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Resend error:', error)
      throw new Error(error?.message || 'Failed to send email')
    }

    const data = await response.json()
    console.log(`[Story Submission] Email sent successfully. ID: ${data.id}`)

    return {
      success: true,
      message: 'Story submitted! We\'ll review it and get back to you.',
    }
  } catch (error: any) {
    console.error('Story submission error:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to submit story. Please try again.',
    })
  }
})
