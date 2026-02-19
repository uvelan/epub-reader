const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

// Configuration
const NOVEL_URL = 'https://freewebnovel.com/novel/alchemy-emperor-of-the-divine-dao.html';
const BASE_URL = 'https://freewebnovel.com';
const OUTPUT_FILE = 'alchemy-emperor-of-the-divine-dao.txt';

const WebScraper = async () => {
    try {
        // Get the main novel page
        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        };
        const { data } = await axios.get(NOVEL_URL, { headers });
        const $ = cheerio.load(data);

        // Extract novel title
        const title = $('.tit h3').text().trim();
        console.log(`Scraping: ${title}`);

        // Prepare output file
        fs.writeFileSync(OUTPUT_FILE, `Title: ${title}\n\n`, 'utf-8');

        // Get all chapter links
        const chapterLinks = [];
        $('.m-newest2 ul li a').each((i, el) => {
            const href = $(el).attr('href');
            if (href && href.startsWith('/alchemy-emperor-of-the-divine-dao/')) {
                chapterLinks.push(BASE_URL + href);
            }
        });

        console.log(`Found ${chapterLinks.length} chapters`);

        // Scrape each chapter
        for (let i = 0; i < chapterLinks.length; i++) {
            const chapterUrl = chapterLinks[i];
            try {
                const chapterResponse = await axios.get(chapterUrl, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                    }
                });
                const chapter$ = cheerio.load(chapterResponse.data);

                // Extract chapter title and content
                const chapterTitle = chapter$('.tit h3').text().trim();
                let chapterContent = chapter$('#article').text().trim();

                // Clean up content
                chapterContent = chapterContent
                    .replace(/\n\s*\n/g, '\n\n')
                    .replace(/FreeWebNovel\.com/g, '')
                    .replace(/Please\s+support\s+.*/gi, '');

                // Append to file
                fs.appendFileSync(
                    OUTPUT_FILE,
                    `Chapter ${i + 1}: ${chapterTitle}\n\n${chapterContent}\n\n`,
                    'utf-8'
                );

                console.log(`Processed chapter ${i + 1}: ${chapterTitle}`);

                // Add delay to avoid being blocked
                await new Promise(resolve => setTimeout(resolve, 2000));
            } catch (error) {
                console.error(`Error scraping chapter ${i + 1}: ${error.message}`);
            }
        }

        console.log(`Scraping complete! Saved to ${OUTPUT_FILE}`);
        return { success: true, chapters: chapterLinks.length };
    } catch (error) {
        console.error('Error scraping novel:', error.message);
        return { success: false, error: error.message };
    }
}

// For use as a module
module.exports = {WebScraper};
