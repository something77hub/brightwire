import satori from 'satori'
import { Resvg } from '@resvg/resvg-js'

// Cache the font data
let fontCache: ArrayBuffer | null = null

async function loadFont(): Promise<ArrayBuffer> {
  if (fontCache) return fontCache
  
  // Fetch Roboto Bold TTF - clean, readable, static font file
  const fontUrl = 'https://raw.githubusercontent.com/googlefonts/roboto/main/src/hinted/Roboto-Bold.ttf'
  
  try {
    const response = await fetch(fontUrl)
    if (!response.ok) {
      throw new Error(`Failed to fetch font: ${response.status}`)
    }
    fontCache = await response.arrayBuffer()
    return fontCache
  } catch (error) {
    console.error('Font fetch error:', error)
    throw error
  }
}

// Generate a simple logo PNG for Google Rich Results
export default defineEventHandler(async (event) => {
  // Create a simple horizontal logo: sun emoji + "BrightWire" text
  const element = {
    type: 'div',
    props: {
      style: {
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'white',
        fontFamily: 'Roboto',
        padding: '10px 20px',
      },
      children: [
        {
          type: 'div',
          props: {
            style: {
              width: '50px',
              height: '50px',
              background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '12px',
            },
            children: {
              type: 'span',
              props: {
                style: { fontSize: '28px' },
                children: '☀️',
              },
            },
          },
        },
        {
          type: 'span',
          props: {
            style: {
              fontSize: '36px',
              fontWeight: 700,
              color: '#f59e0b',
            },
            children: 'BrightWire',
          },
        },
      ],
    },
  }

  try {
    // Load font
    const fontData = await loadFont()
    
    // Generate SVG with Satori
    const svg = await satori(element, {
      width: 600,
      height: 60,
      fonts: [
        {
          name: 'Roboto',
          data: fontData,
          weight: 700,
          style: 'normal',
        },
      ],
    })

    // Convert SVG to PNG with Resvg
    const resvg = new Resvg(svg, {
      fitTo: {
        mode: 'width',
        value: 600,
      },
    })
    const pngData = resvg.render()
    const pngBuffer = pngData.asPng()

    // Set headers - cache for a long time since logo rarely changes
    setHeader(event, 'Content-Type', 'image/png')
    setHeader(event, 'Cache-Control', 'public, max-age=2592000, s-maxage=2592000') // 30 days

    return pngBuffer
  } catch (error) {
    console.error('Logo generation error:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to generate logo',
    })
  }
})
