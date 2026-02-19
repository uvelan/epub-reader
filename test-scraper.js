const { scrapeFreeWebNovel } = require('./server/utils/BrowserscrapeNovel');

async function test() {
    console.log("Testing scraper with limit 3...");
    try {
        const result = await scrapeFreeWebNovel({
            slug: 'alchemy-emperor-of-the-divine-dao',
            limit: 3
        });

        console.log(`Title: ${result.title}`);
        console.log(`Chapters found: ${result.chapters.length}`);

        if (result.chapters.length === 3) {
            console.log("SUCCESS: Limit worked correctly.");
        } else {
            console.error(`FAILURE: Expected 3 chapters, got ${result.chapters.length}`);
        }
    } catch (error) {
        console.error("Test failed with error:", error);
    }
}

test();
