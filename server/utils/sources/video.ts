import type { NewsSource } from '~/types'

export const videoSources: NewsSource[] = [
    // ========================================
    // YOUTUBE CHANNELS
    // ========================================
    {
        name: 'Some Good News',
        feed: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCOe_y6KKvS3PdIfb9q9pGug',
        baseUrl: 'https://youtube.com',
        forcedCategory: 'video',
    },
    {
        name: 'Daily Dose Of Internet',
        feed: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCdC0An4ZPNr_YiFiYoVbwaw',
        baseUrl: 'https://youtube.com',
        forcedCategory: 'video',
    },
    {
        name: 'Great Big Story',
        feed: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCajXeitgFL-rb5-gXI-aG8Q',
        baseUrl: 'https://youtube.com',
        forcedCategory: 'video',
    },
    {
        name: 'Nas Daily',
        feed: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCJsUvAqDzczYv2UpFmu4PcA',
        baseUrl: 'https://youtube.com',
        forcedCategory: 'video',
    },
    {
        name: 'Goalcast',
        feed: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCc4IYtPKkJLSAHHuJx1GiGQ',
        baseUrl: 'https://youtube.com',
        forcedCategory: 'video',
    },
]
