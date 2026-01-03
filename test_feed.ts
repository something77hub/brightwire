
import Parser from 'rss-parser';

const feedUrl = 'https://www.youtube.com/feeds/videos.xml?channel_id=UCOe_y6KKvS3PdIfb9q9pGug';

async function test() {
    console.log('Testing without headers...');
    try {
        const parser = new Parser();
        await parser.parseURL(feedUrl);
        console.log('Success without headers!');
    } catch (e: any) {
        console.log('Failed without headers:', e.message);
    }

    console.log('Testing with User-Agent...');
    try {
        const parser = new Parser({
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/rss+xml, text/xml, */*'
            }
        });
        const feed = await parser.parseURL(feedUrl);
        console.log(`Success with User-Agent! Found ${feed.items.length} items.`);
    } catch (e: any) {
        console.log('Failed with User-Agent:', e.message);
    }
}

test();
