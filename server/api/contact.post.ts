export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { name, email, subject, message } = body

  // Validate required fields
  if (!name || !email || !subject || !message) {
    throw createError({
      statusCode: 400,
      message: 'All fields are required',
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
    console.log(`[Contact Form] New message (Resend not configured):`)
    console.log(`  From: ${name} <${email}>`)
    console.log(`  Subject: ${subject}`)
    console.log(`  Message: ${message}`)
    return {
      success: true,
      message: 'Message received! We\'ll get back to you soon.',
    }
  }

  try {
    // Format subject line nicely
    const subjectLabels: Record<string, string> = {
      'general': 'General Inquiry',
      'story': 'Story Submission',
      'advertising': 'Advertising',
      'partnership': 'Partnership',
      'press': 'Press/Media',
      'technical': 'Technical Issue',
      'feedback': 'Feedback',
    }
    const subjectLabel = subjectLabels[subject] || subject

    // Send email via Resend
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: 'BrightWire Contact <noreply@brightwire.news>',
        to: ['contact@brightwire.news'],
        reply_to: email,
        subject: `[${subjectLabel}] New message from ${name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #F59E0B, #EA580C); padding: 20px; border-radius: 12px 12px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 24px;">☀️ New Contact Message</h1>
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
                <tr>
                  <td style="padding: 8px 0; color: #92400E; font-weight: bold;">Subject:</td>
                  <td style="padding: 8px 0; color: #78350F;">${subjectLabel}</td>
                </tr>
              </table>
              
              <div style="margin-top: 20px; padding: 16px; background: white; border-radius: 8px; border-left: 4px solid #F59E0B;">
                <p style="color: #92400E; font-weight: bold; margin: 0 0 8px 0;">Message:</p>
                <p style="color: #78350F; margin: 0; white-space: pre-wrap;">${message}</p>
              </div>
              
              <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid #FDE68A;">
                <a href="mailto:${email}" style="display: inline-block; background: #F59E0B; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: bold;">Reply to ${name}</a>
              </div>
            </div>
          </div>
        `,
        text: `
New Contact Message from BrightWire

From: ${name}
Email: ${email}
Subject: ${subjectLabel}

Message:
${message}

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
    console.log(`[Contact Form] Email sent successfully. ID: ${data.id}`)

    return {
      success: true,
      message: 'Message sent! We\'ll get back to you within 24-48 hours.',
    }
  } catch (error: any) {
    console.error('Contact form error:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to send message. Please try again.',
    })
  }
})
