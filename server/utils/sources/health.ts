import type { NewsSource } from '~/types'

export const healthSources: NewsSource[] = [
    // ========================================
    // HEALTH & WELLNESS (New Category)
    // ========================================
    // {
    //     name: 'Healthline News',
    //     feed: 'https://www.healthline.com/feeds/health-news',
    //     baseUrl: 'https://www.healthline.com',
    //     forcedCategory: 'health',
    // },
    // {
    //     name: 'Medical News Today',
    //     feed: 'https://www.medicalnewstoday.com/feed',
    //     baseUrl: 'https://www.medicalnewstoday.com',
    //     forcedCategory: 'health',
    // },
    {
        name: 'ScienceDaily Health',
        feed: 'https://www.sciencedaily.com/rss/health_medicine.xml',
        baseUrl: 'https://www.sciencedaily.com',
        forcedCategory: 'health',
    },
    {
        name: 'NIH News',
        feed: 'https://www.nih.gov/news-events/feed.xml',
        baseUrl: 'https://www.nih.gov',
        forcedCategory: 'health',
    },
    {
        name: 'Psychology Today',
        feed: 'https://www.psychologytoday.com/us/feed',
        baseUrl: 'https://www.psychologytoday.com',
        forcedCategory: 'health',
    },
    {
        name: 'MindBodyGreen',
        feed: 'https://www.mindbodygreen.com/rss/feed.xml',
        baseUrl: 'https://www.mindbodygreen.com',
        forcedCategory: 'health',
    },
    {
        name: 'Well+Good',
        feed: 'https://www.wellandgood.com/feed/',
        baseUrl: 'https://www.wellandgood.com',
        forcedCategory: 'health',
    },
    // Mental Health Specific
    {
        name: 'NAMI News',
        feed: 'https://www.nami.org/feed/',
        baseUrl: 'https://www.nami.org',
        forcedCategory: 'health',
    }
]
