import satori from 'satori'
import { Resvg } from '@resvg/resvg-js'

// Cache the font data
let fontRegularCache: ArrayBuffer | null = null
let fontBoldCache: ArrayBuffer | null = null

async function loadFonts(): Promise<{ regular: ArrayBuffer; bold: ArrayBuffer }> {
  if (fontRegularCache && fontBoldCache) {
    return { regular: fontRegularCache, bold: fontBoldCache }
  }
  
  // Fetch Roboto fonts
  const regularUrl = 'https://raw.githubusercontent.com/googlefonts/roboto/main/src/hinted/Roboto-Regular.ttf'
  const boldUrl = 'https://raw.githubusercontent.com/googlefonts/roboto/main/src/hinted/Roboto-Bold.ttf'
  
  try {
    const [regularRes, boldRes] = await Promise.all([
      fetch(regularUrl),
      fetch(boldUrl)
    ])
    
    if (!regularRes.ok || !boldRes.ok) {
      throw new Error('Failed to fetch fonts')
    }
    
    fontRegularCache = await regularRes.arrayBuffer()
    fontBoldCache = await boldRes.arrayBuffer()
    
    return { regular: fontRegularCache, bold: fontBoldCache }
  } catch (error) {
    console.error('Font fetch error:', error)
    throw error
  }
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const type = (query.type as string) || 'home'
  const category = query.category as string
  const title = query.title as string
  const subtitle = query.subtitle as string

  // Category configurations with vibrant colors
  const categories: Record<string, { emoji: string; gradient: string[]; accent: string }> = {
    'good-news': { emoji: '☀️', gradient: ['#fbbf24', '#f59e0b'], accent: '#92400e' },
    'heroes': { emoji: '🦸', gradient: ['#f87171', '#ef4444'], accent: '#7f1d1d' },
    'planet': { emoji: '🌍', gradient: ['#34d399', '#10b981'], accent: '#064e3b' },
    'innovation': { emoji: '🚀', gradient: ['#a78bfa', '#8b5cf6'], accent: '#4c1d95' },
    'solutions': { emoji: '💡', gradient: ['#60a5fa', '#3b82f6'], accent: '#1e3a8a' },
  }

  const cat = category ? categories[category] || categories['good-news'] : categories['good-news']

  let element: any

  // ARTICLE PAGE - Dynamic headline image
  if (type === 'article' && title) {
    // Smart text sizing based on title length
    const titleLength = title.length
    let fontSize = 72
    if (titleLength > 80) fontSize = 48
    else if (titleLength > 60) fontSize = 54
    else if (titleLength > 40) fontSize = 62
    
    // Truncate very long titles
    const displayTitle = title.length > 120 ? title.slice(0, 117) + '...' : title
    
    element = {
      type: 'div',
      props: {
        style: {
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: `linear-gradient(135deg, ${cat.gradient[0]} 0%, ${cat.gradient[1]} 100%)`,
          fontFamily: 'Roboto',
          position: 'relative',
          overflow: 'hidden',
        },
        children: [
          // Decorative circles
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                top: '-100px',
                right: '-100px',
                width: '400px',
                height: '400px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)',
              },
            },
          },
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                bottom: '-150px',
                left: '-150px',
                width: '500px',
                height: '500px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.08)',
              },
            },
          },
          // Main content
          {
            type: 'div',
            props: {
              style: {
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: '60px 80px',
                position: 'relative',
                zIndex: 1,
              },
              children: [
                // Category pill
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      marginBottom: '24px',
                    },
                    children: [
                      {
                        type: 'span',
                        props: {
                          style: {
                            fontSize: '40px',
                          },
                          children: cat.emoji,
                        },
                      },
                      {
                        type: 'span',
                        props: {
                          style: {
                            background: 'rgba(255,255,255,0.25)',
                            padding: '8px 20px',
                            borderRadius: '100px',
                            fontSize: '20px',
                            fontWeight: 600,
                            color: 'white',
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                          },
                          children: category?.replace(/-/g, ' ') || 'Good News',
                        },
                      },
                    ],
                  },
                },
                // HEADLINE - The star of the show
                {
                  type: 'h1',
                  props: {
                    style: {
                      fontSize: `${fontSize}px`,
                      fontWeight: 700,
                      color: 'white',
                      margin: 0,
                      lineHeight: 1.1,
                      textShadow: '0 4px 20px rgba(0,0,0,0.15)',
                      maxWidth: '1000px',
                    },
                    children: displayTitle,
                  },
                },
                // Subtitle if provided
                subtitle ? {
                  type: 'p',
                  props: {
                    style: {
                      fontSize: '28px',
                      color: 'rgba(255,255,255,0.9)',
                      margin: '20px 0 0 0',
                      maxWidth: '800px',
                      lineHeight: 1.4,
                    },
                    children: subtitle.length > 150 ? subtitle.slice(0, 147) + '...' : subtitle,
                  },
                } : null,
              ].filter(Boolean),
            },
          },
          // Bottom bar with branding
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '24px 80px',
                background: 'rgba(0,0,0,0.15)',
              },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                    },
                    children: [
                      {
                        type: 'span',
                        props: {
                          style: { fontSize: '32px' },
                          children: '☀️',
                        },
                      },
                      {
                        type: 'span',
                        props: {
                          style: {
                            fontSize: '28px',
                            fontWeight: 700,
                            color: 'white',
                          },
                          children: 'BrightWire',
                        },
                      },
                    ],
                  },
                },
                {
                  type: 'span',
                  props: {
                    style: {
                      fontSize: '22px',
                      color: 'rgba(255,255,255,0.8)',
                      fontWeight: 500,
                    },
                    children: 'brightwire.news',
                  },
                },
              ],
            },
          },
        ],
      },
    }
  }
  // CATEGORY PAGE
  else if (type === 'category' && category) {
    const categoryNames: Record<string, string> = {
      'good-news': "Today's Good News",
      'heroes': 'Community Heroes',
      'planet': 'Planet Wins',
      'innovation': 'Innovation & Discovery',
      'solutions': 'Solutions That Work',
    }
    
    element = {
      type: 'div',
      props: {
        style: {
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: `linear-gradient(135deg, ${cat.gradient[0]} 0%, ${cat.gradient[1]} 100%)`,
          fontFamily: 'Roboto',
        },
        children: [
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '60px 80px',
                background: 'rgba(255,255,255,0.95)',
                borderRadius: '32px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              },
              children: [
                {
                  type: 'span',
                  props: {
                    style: { fontSize: '120px', marginBottom: '16px' },
                    children: cat.emoji,
                  },
                },
                {
                  type: 'h1',
                  props: {
                    style: {
                      fontSize: '64px',
                      fontWeight: 700,
                      color: cat.accent,
                      margin: '0 0 16px 0',
                      textAlign: 'center',
                    },
                    children: categoryNames[category] || category,
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      marginTop: '24px',
                    },
                    children: [
                      {
                        type: 'span',
                        props: {
                          style: { fontSize: '32px' },
                          children: '☀️',
                        },
                      },
                      {
                        type: 'span',
                        props: {
                          style: {
                            fontSize: '32px',
                            fontWeight: 600,
                            color: '#78716c',
                          },
                          children: 'BrightWire',
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    }
  }
  // HOMEPAGE - Default
  else {
    element = {
      type: 'div',
      props: {
        style: {
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #ea580c 100%)',
          fontFamily: 'Roboto',
          position: 'relative',
          overflow: 'hidden',
        },
        children: [
          // Decorative elements
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                top: '-80px',
                left: '-80px',
                width: '300px',
                height: '300px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)',
              },
            },
          },
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                bottom: '-120px',
                right: '-120px',
                width: '400px',
                height: '400px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.08)',
              },
            },
          },
          // Main content
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                position: 'relative',
                zIndex: 1,
              },
              children: [
                {
                  type: 'span',
                  props: {
                    style: { fontSize: '120px', marginBottom: '16px' },
                    children: '☀️',
                  },
                },
                {
                  type: 'h1',
                  props: {
                    style: {
                      fontSize: '96px',
                      fontWeight: 700,
                      color: 'white',
                      margin: '0 0 8px 0',
                      textShadow: '0 4px 20px rgba(0,0,0,0.15)',
                    },
                    children: 'BrightWire',
                  },
                },
                {
                  type: 'p',
                  props: {
                    style: {
                      fontSize: '36px',
                      color: 'rgba(255,255,255,0.9)',
                      margin: '0 0 40px 0',
                      fontWeight: 500,
                    },
                    children: 'Good News That Brightens Your Day',
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      gap: '16px',
                    },
                    children: ['🦸 Heroes', '🌍 Planet', '🚀 Innovation', '💡 Solutions'].map((text) => ({
                      type: 'span',
                      props: {
                        style: {
                          background: 'rgba(255,255,255,0.2)',
                          padding: '12px 24px',
                          borderRadius: '100px',
                          fontSize: '22px',
                          fontWeight: 600,
                          color: 'white',
                        },
                        children: text,
                      },
                    })),
                  },
                },
              ],
            },
          },
        ],
      },
    }
  }

  try {
    // Load fonts
    const fonts = await loadFonts()
    
    // Generate SVG with Satori
    const svg = await satori(element, {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'Roboto',
          data: fonts.regular,
          weight: 400,
          style: 'normal',
        },
        {
          name: 'Roboto',
          data: fonts.bold,
          weight: 700,
          style: 'normal',
        },
      ],
    })

    // Convert SVG to PNG with Resvg
    const resvg = new Resvg(svg, {
      fitTo: {
        mode: 'width',
        value: 1200,
      },
    })
    const pngData = resvg.render()
    const pngBuffer = pngData.asPng()

    // Set headers
    setHeader(event, 'Content-Type', 'image/png')
    setHeader(event, 'Cache-Control', 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800')

    return pngBuffer
  } catch (error) {
    console.error('OG Image generation error:', error)
    
    throw createError({
      statusCode: 500,
      message: 'Failed to generate image',
    })
  }
})
