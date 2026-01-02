// Generate a shareable quote card as SVG
// SVG renders fonts properly in browsers - users can right-click save as PNG
export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)

    // Handle URL decoding safely
    const safeDecodeURI = (str: string | undefined, fallback: string): string => {
      if (!str) return fallback
      try {
        return decodeURIComponent(str)
      } catch {
        return str // Already decoded or invalid
      }
    }

    const quote = safeDecodeURI(query.quote as string, 'Good news exists. We find it.')
    const source = safeDecodeURI(query.source as string, 'BrightWire')
    const category = (query.category as string) || 'good-news'
    const backgroundImage = query.bg ? safeDecodeURI(query.bg as string, '') : null

    // Canvas dimensions (Instagram/Twitter friendly)
    const width = 1200
    const height = 630

    // Category colors
    const categoryColors: Record<string, { bg: string; accent: string; text: string }> = {
      'good-news': { bg: '#FFF7ED', accent: '#F59E0B', text: '#78350F' },
      'heroes': { bg: '#FEF3C7', accent: '#D97706', text: '#78350F' },
      'planet': { bg: '#ECFDF5', accent: '#10B981', text: '#064E3B' },
      'innovation': { bg: '#EFF6FF', accent: '#3B82F6', text: '#1E3A8A' },
      'solutions': { bg: '#F5F3FF', accent: '#8B5CF6', text: '#4C1D95' },
      'kindness': { bg: '#FDF2F8', accent: '#EC4899', text: '#831843' },
    }

    const colors = categoryColors[category] || categoryColors['good-news']

    // Escape HTML entities for SVG
    const escapeHtml = (text: string) =>
      text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')

    // Word wrap for SVG
    const wrapText = (text: string, maxChars: number): string[] => {
      const words = text.split(' ')
      const lines: string[] = []
      let currentLine = ''

      for (const word of words) {
        if ((currentLine + ' ' + word).length > maxChars) {
          if (currentLine) lines.push(currentLine)
          currentLine = word
        } else {
          currentLine = currentLine ? `${currentLine} ${word}` : word
        }
      }
      if (currentLine) lines.push(currentLine)
      return lines
    }

    // Truncate quote if too long
    const maxQuoteLength = 400
    const displayQuote = quote.length > maxQuoteLength
      ? quote.slice(0, maxQuoteLength - 3) + '...'
      : quote

    // Improved dynamic font sizing
    let fontSize = 50
    if (displayQuote.length > 300) fontSize = 32
    else if (displayQuote.length > 200) fontSize = 38
    else if (displayQuote.length > 100) fontSize = 44

    // Adjust line wrapping based on font size
    const charsPerLine = Math.floor(45 * (50 / fontSize))
    const lines = wrapText(displayQuote, charsPerLine)

    const lineHeight = fontSize * 1.35
    const totalHeight = lines.length * lineHeight
    const startY = (height - totalHeight) / 2 + fontSize * 0.5 // Better vertical centering

    // Build text lines as separate tspan elements
    const quoteTspans = lines.map((line, i) =>
      `<tspan x="80" dy="${i === 0 ? 0 : lineHeight}">${escapeHtml(line)}</tspan>`
    ).join('')

    let svg: string

    if (backgroundImage) {
      // Fetch image and embed as base64
      let imageData = ''
      try {
        // Handle relative URLs
        const imageUrl = backgroundImage.startsWith('http')
          ? backgroundImage
          : `${process.env.SITE_URL || 'http://localhost:3000'}${backgroundImage}`

        const response = await fetch(imageUrl)
        if (response.ok) {
          const buffer = await response.arrayBuffer()
          const base64 = Buffer.from(buffer).toString('base64')
          const contentType = response.headers.get('content-type') || 'image/jpeg'
          imageData = `data:${contentType};base64,${base64}`
        } else {
          console.error('Failed to fetch background image, status:', response.status)
        }
      } catch (e) {
        console.error('Failed to fetch background image:', e)
      }

      if (imageData) {
        svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500&amp;family=Inter:wght@400;600&amp;display=swap');
    </style>
  </defs>
  
  <!-- Background Image -->
  <image href="${imageData}" x="0" y="0" width="${width}" height="${height}" preserveAspectRatio="xMidYMid slice"/>
  
  <!-- Dark Overlay -->
  <rect width="${width}" height="${height}" fill="rgba(0,0,0,0.55)"/>
  
  <!-- Quote marks -->
  <text x="50" y="150" font-family="Georgia, 'Playfair Display', serif" font-size="180" fill="white" fill-opacity="0.2">"</text>
  
  <!-- Quote text -->
  <text x="80" y="${startY}" font-family="Georgia, 'Playfair Display', serif" font-size="${fontSize}" font-weight="500" fill="white">
    ${quoteTspans}
  </text>
  
  <!-- Source -->
  <text x="80" y="${height - 75}" font-family="Arial, 'Inter', sans-serif" font-size="22" fill="white" fill-opacity="0.85">— ${escapeHtml(source)}</text>
  
  <!-- Branding -->
  <text x="${width - 60}" y="${height - 65}" font-family="Arial, 'Inter', sans-serif" font-size="32" font-weight="700" fill="white" text-anchor="end">https://brightwire.news</text>
  <text x="${width - 60}" y="${height - 20}" font-family="Arial, 'Inter', sans-serif" font-size="32" font-weight="700" fill="#F59E0B" text-anchor="end">☀️ BrightWire</text>
</svg>`
      } else {
        // Fallback to solid color
        svg = generateSolidSvg(width, height, colors, quoteTspans, startY, fontSize, source, escapeHtml)
      }
    } else {
      svg = generateSolidSvg(width, height, colors, quoteTspans, startY, fontSize, source, escapeHtml)
    }

    setResponseHeader(event, 'Content-Type', 'image/svg+xml')
    setResponseHeader(event, 'Cache-Control', 'public, max-age=3600')

    return svg
  } catch (error: any) {
    console.error('Quote card generation error:', error)
    // Return a simple error SVG
    setResponseHeader(event, 'Content-Type', 'image/svg+xml')
    return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
      <rect width="1200" height="630" fill="#FFF7ED"/>
      <text x="600" y="315" text-anchor="middle" font-family="Arial" font-size="24" fill="#78350F">Error generating quote card</text>
    </svg>`
  }
})

function generateSolidSvg(
  width: number,
  height: number,
  colors: { bg: string; accent: string; text: string },
  quoteTspans: string,
  startY: number,
  fontSize: number,
  source: string,
  escapeHtml: (text: string) => string
): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500&amp;family=Inter:wght@400;600&amp;display=swap');
    </style>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${colors.bg}"/>
      <stop offset="100%" stop-color="#FFFFFF"/>
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="${width}" height="${height}" fill="url(#bg)"/>
  
  <!-- Accent bar -->
  <rect x="0" y="0" width="10" height="${height}" fill="${colors.accent}"/>
  
  <!-- Quote marks -->
  <text x="50" y="180" font-family="Georgia, 'Playfair Display', serif" font-size="200" fill="${colors.accent}" fill-opacity="0.15">"</text>
  <text x="${width - 100}" y="${height - 20}" font-family="Georgia, 'Playfair Display', serif" font-size="200" fill="${colors.accent}" fill-opacity="0.15" text-anchor="end">"</text>
  
  <!-- Quote text -->
  <text x="80" y="${startY}" font-family="Georgia, 'Playfair Display', serif" font-size="${fontSize}" font-weight="500" fill="${colors.text}">
    ${quoteTspans}
  </text>
  
  <!-- Source -->
  <text x="80" y="${height - 75}" font-family="Arial, 'Inter', sans-serif" font-size="22" fill="#6B7280">— ${escapeHtml(source)}</text>
  
  <!-- Branding -->
  <text x="${width - 60}" y="${height - 65}" font-family="Arial, 'Inter', sans-serif" font-size="32" font-weight="700" fill="${colors.text}" text-anchor="end">https://brightwire.news</text>
  <text x="${width - 60}" y="${height - 20}" font-family="Arial, 'Inter', sans-serif" font-size="32" font-weight="700" fill="${colors.accent}" text-anchor="end">☀️ BrightWire</text>
</svg>`
}
