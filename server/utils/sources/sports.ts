import type { NewsSource } from '~/types'

export const sportsSources: NewsSource[] = [
    // ========================================
    // SPORTS & ATHLETICS
    // ========================================
    // Major Broadcasters (Filtered by AI)
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
    {
        name: 'ESPN Top News',
        feed: 'https://www.espn.com/espn/rss/news',
        baseUrl: 'https://www.espn.com',
        forcedCategory: 'sports',
    },
    {
        name: 'CBS Sports',
        feed: 'https://www.cbssports.com/rss/headlines/',
        baseUrl: 'https://www.cbssports.com',
        forcedCategory: 'sports',
    },
    // Niche / Positive Sports
    {
        name: 'Good Sports',
        feed: 'https://www.goodsports.org/feed/',
        baseUrl: 'https://www.goodsports.org',
        forcedCategory: 'sports',
    }
]
