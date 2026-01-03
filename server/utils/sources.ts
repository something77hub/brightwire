import { generalSources } from './sources/general'
import { sportsSources } from './sources/sports'
import { healthSources } from './sources/health'

// Re-export negative/positive keywords maintained from original file
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
  // Social media junk
  'reddit', 'subreddit', 'thread', 'comment', 'upvote',
]

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
  'triumph',
]

export function scoreStory(title: string, summary: string): number {
  const text = `${title} ${summary}`.toLowerCase()
  let score = 0

  for (const keyword of negativeKeywords) {
    if (text.includes(keyword)) {
      score -= 10
    }
  }

  for (const keyword of positiveKeywords) {
    if (text.includes(keyword)) {
      score += 5
    }
  }

  return score
}

export function preFilterStory(title: string, summary: string): 'skip' | 'boost' | 'classify' {
  const score = scoreStory(title, summary)
  if (score <= -10) return 'skip'
  if (score >= 5) return 'boost'
  return 'classify'
}

// Aggregate all sources
export const newsSources = [
  ...generalSources,
  ...sportsSources,
  ...healthSources,
]
