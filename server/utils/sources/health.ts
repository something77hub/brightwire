import type { NewsSource } from '~/types'

export const healthSources: NewsSource[] = [
    // ========================================
    // HEALTH & WELLNESS (New Category)
    // ========================================
    {
        name: 'ScienceDaily Health',
        feed: 'https://www.sciencedaily.com/rss/health_medicine.xml',
        baseUrl: 'https://www.sciencedaily.com',
        forcedCategory: 'health',
    },
    {
        name: 'Medical Xpress',
        feed: 'https://medicalxpress.com/rss-feed/',
        baseUrl: 'https://medicalxpress.com',
        forcedCategory: 'health',
    },
    // {
    //     name: 'NIH News',
    //     feed: 'https://www.nih.gov/news-events/feed.xml',
    //     baseUrl: 'https://www.nih.gov',
    //     forcedCategory: 'health',
    // },
    // {
    //     name: 'Psychology Today',
    //     feed: 'https://www.psychologytoday.com/us/feed',
    //     baseUrl: 'https://www.psychologytoday.com',
    //     forcedCategory: 'health',
    // },
    // {
    //     name: 'Harvard Health',
    //     feed: 'https://www.health.harvard.edu/rss/staying-healthy',
    //     baseUrl: 'https://www.health.harvard.edu',
    //     forcedCategory: 'health',
    // }
]
