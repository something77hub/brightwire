import type { NewsSource } from '~/types'

export const newsSources: NewsSource[] = [
  // ========================================
  // DEDICATED POSITIVE NEWS SITES (13)
  // ========================================
  {
    name: 'Good News Network',
    feed: 'https://www.goodnewsnetwork.org/feed/',
    baseUrl: 'https://goodnewsnetwork.org',
  },
  {
    name: 'GNN Heroes',
    feed: 'https://www.goodnewsnetwork.org/category/news/heroes/feed/',
    baseUrl: 'https://goodnewsnetwork.org',
  },
  {
    name: 'GNN Inspiring',
    feed: 'https://www.goodnewsnetwork.org/category/news/inspiring/feed/',
    baseUrl: 'https://goodnewsnetwork.org',
  },
  {
    name: 'Positive News',
    feed: 'https://www.positive.news/feed/',
    baseUrl: 'https://positive.news',
  },
  {
    name: 'Reasons to be Cheerful',
    feed: 'https://reasonstobecheerful.world/feed/',
    baseUrl: 'https://reasonstobecheerful.world',
  },
  {
    name: 'Upworthy',
    feed: 'https://www.upworthy.com/feeds/feed.rss',
    baseUrl: 'https://upworthy.com',
  },
  {
    name: 'Sunny Skyz',
    feed: 'https://feeds.feedburner.com/SunnySkyz',
    baseUrl: 'https://sunnyskyz.com',
  },
  {
    name: 'Optimist Daily',
    feed: 'https://www.optimistdaily.com/feed/',
    baseUrl: 'https://optimistdaily.com',
  },
  {
    name: 'Good Good Good',
    feed: 'https://www.goodgoodgood.co/articles/rss.xml',
    baseUrl: 'https://goodgoodgood.co',
  },
  {
    name: 'DailyGood',
    feed: 'https://www.dailygood.org/rss/good-news.xml',
    baseUrl: 'https://dailygood.org',
  },
  {
    name: 'Greater Good Magazine',
    feed: 'https://greatergood.berkeley.edu/feed/rss',
    baseUrl: 'https://greatergood.berkeley.edu',
  },
  {
    name: 'YES! Magazine',
    feed: 'https://www.yesmagazine.org/feed',
    baseUrl: 'https://yesmagazine.org',
  },
  {
    name: 'The Better India',
    feed: 'https://www.thebetterindia.com/feed/',
    baseUrl: 'https://thebetterindia.com',
  },

  // ========================================
  // SCIENCE & INNOVATION (13)
  // ========================================
  {
    name: 'Science Daily',
    feed: 'https://www.sciencedaily.com/rss/all.xml',
    baseUrl: 'https://sciencedaily.com',
  },
  {
    name: 'Science Daily Health',
    feed: 'https://www.sciencedaily.com/rss/top/health.xml',
    baseUrl: 'https://sciencedaily.com',
  },
  {
    name: 'Science Daily Tech',
    feed: 'https://www.sciencedaily.com/rss/top/technology.xml',
    baseUrl: 'https://sciencedaily.com',
  },
  {
    name: 'Phys.org',
    feed: 'https://phys.org/rss-feed/',
    baseUrl: 'https://phys.org',
  },
  {
    name: 'Freethink',
    feed: 'https://www.freethink.com/feed/all',
    baseUrl: 'https://freethink.com',
  },
  {
    name: 'Singularity Hub',
    feed: 'https://singularityhub.com/feed/',
    baseUrl: 'https://singularityhub.com',
  },
  {
    name: 'MIT Tech Review',
    feed: 'https://www.technologyreview.com/feed/',
    baseUrl: 'https://technologyreview.com',
  },
  {
    name: 'Medical Xpress',
    feed: 'https://medicalxpress.com/rss-feed/',
    baseUrl: 'https://medicalxpress.com',
  },
  {
    name: 'EurekAlert',
    feed: 'https://www.eurekalert.org/feed/rss',
    baseUrl: 'https://eurekalert.org',
  },
  {
    name: 'New Scientist',
    feed: 'https://www.newscientist.com/section/news/feed/',
    baseUrl: 'https://newscientist.com',
  },
  {
    name: 'Ars Technica Science',
    feed: 'https://feeds.arstechnica.com/arstechnica/science',
    baseUrl: 'https://arstechnica.com',
  },
  {
    name: 'Big Think',
    feed: 'https://bigthink.com/feed/',
    baseUrl: 'https://bigthink.com',
  },
  {
    name: 'Popular Science',
    feed: 'https://www.popsci.com/feed/',
    baseUrl: 'https://popsci.com',

  },
  {
    name: 'Space.com',
    feed: 'https://www.space.com/feeds/all',
    baseUrl: 'https://space.com',
  },
  {
    name: 'The Verge Science',
    feed: 'https://www.theverge.com/science/rss/index.xml',
    baseUrl: 'https://theverge.com',
  },

  // ========================================
  // ENVIRONMENT & CLIMATE WINS (12)
  // ========================================
  {
    name: 'Grist',
    feed: 'https://grist.org/feed/',
    baseUrl: 'https://grist.org',
  },
  {
    name: 'CleanTechnica',
    feed: 'https://cleantechnica.com/feed/',
    baseUrl: 'https://cleantechnica.com',
  },
  {
    name: 'Electrek',
    feed: 'https://electrek.co/feed/',
    baseUrl: 'https://electrek.co',
  },
  {
    name: 'Mongabay',
    feed: 'https://news.mongabay.com/feed/',
    baseUrl: 'https://mongabay.com',
  },
  {
    name: 'Carbon Brief',
    feed: 'https://www.carbonbrief.org/feed/',
    baseUrl: 'https://carbonbrief.org',
  },
  {
    name: 'Yale E360',
    feed: 'https://e360.yale.edu/feed.xml',
    baseUrl: 'https://e360.yale.edu',
  },
  {
    name: 'Inside Climate News',
    feed: 'https://insideclimatenews.org/feed/',
    baseUrl: 'https://insideclimatenews.org',
  },
  {
    name: 'The Revelator',
    feed: 'https://therevelator.org/feed/',
    baseUrl: 'https://therevelator.org',
  },
  {
    name: 'Canary Media',
    feed: 'https://www.canarymedia.com/feed/',
    baseUrl: 'https://canarymedia.com',
  },
  {
    name: 'Treehugger',
    feed: 'https://www.treehugger.com/feeds/all',
    baseUrl: 'https://treehugger.com',
  },
  {
    name: 'Earth.org',
    feed: 'https://earth.org/feed/',
    baseUrl: 'https://earth.org',
  },
  {
    name: 'Inhabitat',
    feed: 'https://inhabitat.com/feed/',
    baseUrl: 'https://inhabitat.com',
  },

  // ========================================
  // HUMAN INTEREST & HEROES (7)
  // ========================================
  {
    name: 'Bored Panda Good News',
    feed: 'https://www.boredpanda.com/feed/?tags=good-news',
    baseUrl: 'https://boredpanda.com',
  },
  {
    name: 'Mental Floss',
    feed: 'https://www.mentalfloss.com/feed',
    baseUrl: 'https://mentalfloss.com',
  },
  {
    name: 'Inspire More',
    feed: 'https://www.inspiremore.com/feed/',
    baseUrl: 'https://inspiremore.com',
  },
  {
    name: 'Today I Found Out',
    feed: 'https://www.todayifoundout.com/feed/',
    baseUrl: 'https://todayifoundout.com',
  },
  {
    name: 'Simplemost',
    feed: 'https://www.simplemost.com/feed/',
    baseUrl: 'https://simplemost.com',
  },
  {
    name: 'Global Citizen',
    feed: 'https://www.globalcitizen.org/en/content/feed/',
    baseUrl: 'https://globalcitizen.org',
  },

  // ========================================
  // MAINSTREAM NEWS (filtered for positive)
  // ========================================
  {
    name: 'BBC News',
    feed: 'https://feeds.bbci.co.uk/news/rss.xml',
    baseUrl: 'https://bbc.com',
  },
  {
    name: 'BBC World',
    feed: 'https://feeds.bbci.co.uk/news/world/rss.xml',
    baseUrl: 'https://bbc.com',
  },
  {
    name: 'BBC Science',
    feed: 'https://feeds.bbci.co.uk/news/science_and_environment/rss.xml',
    baseUrl: 'https://bbc.com',
  },
  {
    name: 'Guardian Science',
    feed: 'https://www.theguardian.com/science/rss',
    baseUrl: 'https://theguardian.com',
  },
  {
    name: 'Guardian Environment',
    feed: 'https://www.theguardian.com/environment/rss',
    baseUrl: 'https://theguardian.com',
  },
  {
    name: 'HuffPost Good News',
    feed: 'https://www.huffpost.com/section/good-news/feed',
    baseUrl: 'https://huffpost.com',
  },

  // ========================================
  // YOUTUBE CHANNELS (embeddable videos)
  // ========================================
  {
    name: 'Some Good News',
    feed: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCOe_y6KKvS3PdIfb9q9pGug',
    baseUrl: 'https://youtube.com',
  },
  {
    name: 'Daily Dose Of Internet',
    feed: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCdC0An4ZPNr_YiFiYoVbwaw',
    baseUrl: 'https://youtube.com',
  },
  {
    name: 'Great Big Story',
    feed: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCajXeitgFL-rb5-gXI-aG8Q',
    baseUrl: 'https://youtube.com',
  },
  {
    name: 'Nas Daily',
    feed: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCJsUvAqDzczYv2UpFmu4PcA',
    baseUrl: 'https://youtube.com',
  },
  {
    name: 'Goalcast',
    feed: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCc4IYtPKkJLSAHHuJx1GiGQ',
    baseUrl: 'https://youtube.com',
  },
  // ========================================
  // AFRICAN & NIGERIAN NEWS (5)
  // ========================================
  {
    name: 'Punch Nigeria',
    feed: 'https://punchng.com/feed/',
    baseUrl: 'https://punchng.com',
    forcedCategory: 'world',
  },
  {
    name: 'Vanguard News',
    feed: 'https://www.vanguardngr.com/feed/',
    baseUrl: 'https://www.vanguardngr.com',
    forcedCategory: 'world',
  },
  {
    name: 'The Cable',
    feed: 'https://www.thecable.ng/feed',
    baseUrl: 'https://www.thecable.ng',
    forcedCategory: 'world',
  },
  {
    name: 'Premium Times',
    feed: 'https://www.premiumtimesng.com/feed',
    baseUrl: 'https://www.premiumtimesng.com',
    forcedCategory: 'world',
  },
  {
    name: 'Daily Trust',
    feed: 'https://dailytrust.com/feed',
    baseUrl: 'https://dailytrust.com',
    forcedCategory: 'world',
  },

  // ========================================
  // SPORTS & ATHLETICS (New)
  // ========================================
  {
    name: 'BBC Sport',
    feed: 'https://feeds.bbci.co.uk/sport/rss.xml',
    baseUrl: 'https://bbc.com/sport',
    forcedCategory: 'sports',
  },
  {
    name: 'Yahoo Sports',
    feed: 'https://sports.yahoo.com/rss/',
    baseUrl: 'https://sports.yahoo.com',
    forcedCategory: 'sports',
  },
  // ========================================
  // ARTS & CULTURE (Requested)
  // ========================================
  {
    name: 'Artnet News',
    feed: 'https://news.artnet.com/feed',
    baseUrl: 'https://news.artnet.com',
  },
  {
    name: 'Hyperallergic',
    feed: 'https://hyperallergic.com/feed/',
    baseUrl: 'https://hyperallergic.com',
  },
  {
    name: 'The Art Newspaper',
    feed: 'https://www.theartnewspaper.com/feed',
    baseUrl: 'https://www.theartnewspaper.com',
  },
  {
    name: 'Colossal',
    feed: 'https://www.thisiscolossal.com/feed/',
    baseUrl: 'https://thisiscolossal.com',
  },

  // ========================================
  // INTERNATIONAL / GLOBAL (Requested)
  // ========================================
  {
    name: 'Al Jazeera English',
    feed: 'https://www.aljazeera.com/xml/rss/all.xml',
    baseUrl: 'https://aljazeera.com',
    forcedCategory: 'world',
  },
  {
    name: 'Deutsche Welle (DW)',
    feed: 'https://rss.dw.com/xml/rss-en-all',
    baseUrl: 'https://dw.com',
    forcedCategory: 'world',
  },
  {
    name: 'France 24',
    feed: 'https://www.france24.com/en/rss',
    baseUrl: 'https://france24.com',
    forcedCategory: 'world',
  },
  {
    name: 'Euronews',
    feed: 'https://www.euronews.com/rss?format=xml',
    baseUrl: 'https://euronews.com',
    forcedCategory: 'world',
  },
  {
    name: 'Kyodo News (Japan)',
    feed: 'https://english.kyodonews.net/rss/news.xml',
    baseUrl: 'https://english.kyodonews.net',
    forcedCategory: 'world',
  },

  // ========================================
  // REGIONAL SPOTLIGHTS (Requested)
  // ========================================
  // India (already have The Better India)
  {
    name: 'Times of India',
    feed: 'https://timesofindia.indiatimes.com/rssfeedstopstories.cms',
    baseUrl: 'https://timesofindia.indiatimes.com',
    forcedCategory: 'world',
  },
  {
    name: 'NDTV India',
    feed: 'https://feeds.feedburner.com/ndtvnews-top-stories',
    baseUrl: 'https://ndtv.com',
    forcedCategory: 'world',
  },

  // Australia
  {
    name: 'ABC News Australia',
    feed: 'https://www.abc.net.au/news/feed/45910/rss.xml',
    baseUrl: 'https://www.abc.net.au',
    forcedCategory: 'world',
  },
  {
    name: '9News Australia',
    feed: 'https://www.9news.com.au/rss',
    baseUrl: 'https://www.9news.com.au',
    forcedCategory: 'world',
  },

  // Dubai / Middle East
  {
    name: 'Khaleej Times (Dubai)',
    feed: 'https://www.khaleejtimes.com/rss',
    baseUrl: 'https://www.khaleejtimes.com',
    forcedCategory: 'world',
  },
  {
    name: 'The National (UAE)',
    feed: 'https://www.thenationalnews.com/arc/outboundfeeds/rss/?outputType=xml',
    baseUrl: 'https://www.thenationalnews.com',
    forcedCategory: 'world',
  },
  {
    name: 'Gulf News',
    feed: 'https://gulfnews.com/rss/news',
    baseUrl: 'https://gulfnews.com',
    forcedCategory: 'world',
  },
]

// Keywords that usually indicate negative news - pre-filter before AI classification
export const negativeKeywords = [
  'killed', 'kills', 'killing', 'murder', 'murdered',
  'dies', 'died', 'death', 'deaths', 'dead',
  'war', 'wars', 'warfare', 'bombing', 'bombed',
  'attack', 'attacks', 'attacked', 'terrorist', 'terrorism',
  'crash', 'crashes', 'crashed', 'explosion', 'explodes',
  'disaster', 'catastrophe', 'tragedy', 'tragic',
  'shooting', 'shot', 'shooter', 'gunman',
  'rape', 'raped', 'assault', 'assaulted',
  'abuse', 'abused', 'victim', 'victims',
  'suicide', 'overdose', 'fatal', 'fatality',
  'crisis', 'collapse', 'collapsed', 'recession',
  'scandal', 'corruption', 'fraud', 'scam',
  'arrest', 'arrested', 'prison', 'jail', 'sentenced',
  'fire', 'fires', 'wildfire', 'blaze', 'inferno',
  'flood', 'floods', 'hurricane', 'tornado', 'earthquake',
  'missing', 'kidnapped', 'abducted',
]

// Keywords that often indicate positive news - boost these
export const positiveKeywords = [
  'breakthrough', 'discovery', 'discovered', 'innovation',
  'success', 'successful', 'achievement', 'achieved',
  'cure', 'cured', 'treatment', 'recovery', 'recovered',
  'saved', 'saves', 'rescue', 'rescued', 'hero', 'heroes',
  'donate', 'donated', 'donation', 'charity', 'volunteer',
  'record', 'milestone', 'historic', 'first-ever',
  'renewable', 'solar', 'clean energy', 'sustainable',
  'restored', 'restoration', 'conservation', 'protected',
  'community', 'together', 'unity', 'celebrate',
  'kindness', 'generosity', 'compassion', 'inspire',
  'hope', 'hopeful', 'optimistic', 'positive',
  'growth', 'growing', 'thriving', 'flourishing',
  'peace', 'peaceful', 'agreement', 'cooperation',
  'win', 'wins', 'won', 'triumph', 'victory',
]

/**
 * Score a story based on keywords to decide potential action.
 * Returns a score: < -5 (skip), > 5 (boost), else (neutral/classify)
 */
export function scoreStory(title: string, summary: string): number {
  const text = `${title} ${summary}`.toLowerCase()
  let score = 0

  // Penalize negative keywords strongly
  for (const keyword of negativeKeywords) {
    if (text.includes(keyword)) {
      score -= 10
    }
  }

  // Boost positive keywords
  for (const keyword of positiveKeywords) {
    if (text.includes(keyword)) {
      score += 5
    }
  }

  return score
}

export function preFilterStory(title: string, summary: string): 'skip' | 'boost' | 'classify' {
  const score = scoreStory(title, summary)

  // Strict filter: if it has even one strong negative word, it's likely -10, so valid to skip
  if (score <= -10) return 'skip'
  if (score >= 5) return 'boost'
  return 'classify'
}
