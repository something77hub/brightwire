
import * as cheerio from 'cheerio';

async function testSelector() {
    const url = 'https://www.space.com/space-exploration/artemis/2026-is-the-year-humanity-will-finally-go-back-to-the-moon';
    console.log(`Fetching ${url}...`);
    try {
        const response = await fetch(url);
        const html = await response.text();
        const $ = cheerio.load(html);

        const selector = '#article-body';
        const removeSelectors = ['aside', '.ad-unit', '.advertisement', '#top-leaderboard', '.newsletter-signup', '.exit-intent', '.utility-bar', '#viafoura-comments', '.taboola-container'];

        // Remove unwanted
        removeSelectors.forEach(s => $(s).remove());

        const content = $(selector).text().trim();
        console.log(`Content length: ${content.length}`);
        if (content.length > 100) {
            console.log("Success! Content found.");
            console.log("Sample start:", content.substring(0, 100).replace(/\n/g, ' '));
        } else {
            console.log("Failure. Content too short.");
            console.log("Body text length:", $('body').text().length);
        }
    } catch (e) {
        console.error("Error:", e);
    }
}

testSelector();
