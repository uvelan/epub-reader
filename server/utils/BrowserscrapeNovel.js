//
// Minimal dependency list:
//   npm i puppeteer puppeteer-extra puppeteer-extra-plugin-stealth
//
// ────────────────────────────────────────────────────────────────
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const { WebUrlToBase64 } = require("./WebUrlToBase64")
puppeteer.use(StealthPlugin());

/**
 * Scrape metadata + the first `limit` chapter links from FreeWebNovel.
 *
 * @param {Object}  opts
 * @param {string}  opts.slug   Novel slug as it appears in the URL
 *                              e.g. 'alchemy-emperor-of-the-divine-dao'
 * @param {number}  [opts.limit=10]  How many chapters to return
 * @param {object=} opts.browser     Re‑use an existing Puppeteer browser
 * @returns {Promise<{
 *   title: string,
 *   author: string,
 *   summary: string,
 *   chapters: { title: string, link: string }[]
 * }>}
 */
async function scrapeFreeWebNovel({ slug, limit = 10, browser: extBrowser } = {}) {
    if (!slug) throw new Error('scrapeFreeWebNovel(): opts.slug is required');

    const url = `https://freewebnovel.com/novel/${slug}`;
    const browser = extBrowser ||
        await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            defaultViewport: { width: 1280, height: 800 }
        });

    let page;
    try {
        page = await browser.newPage();
        await page.setUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
            '(KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
        );

        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60_000 });
        await page.waitForSelector('#idData li', { timeout: 15_000 });

        const response = await page.evaluate(async max => {
            const pick = sel => (document.querySelector(sel)?.textContent || '').trim();

            const imgEl = document.querySelector('pic img');
            const coverUrl = (imgEl?.src ||
                document.querySelector('meta[property="og:image"]')?.content ||
                '').trim();

            const title = pick('h1');
            const author = pick('.novel-author span') || pick('a[href*="Flying Alone"]');

            let summary = pick('.summary') || pick('.SUMMARY') || pick(".inner");
            if (!summary) {
                const h3 = pick('p')
                summary = (h3.textContent || '').trim();
            }

            const chapters = [];
            const listItems = Array.from(document.querySelectorAll('#idData li'));
            // Use the passed limit (max) to slice the list
            const limitedItems = max > 0 ? listItems.slice(0, max) : listItems;

            limitedItems.forEach(li => {
                const a = li.querySelector('a');
                chapters.push({ title: a?.textContent.trim(), link: a?.href });
            });
            return { title, author, summary, chapters, coverUrl };
        }, limit);
        if (response.coverUrl) {
            response['base64'] = await WebUrlToBase64(response.coverUrl);
        }

        return response;
    } catch (e) {
        console.error(e);
    }
    finally {
        if (!extBrowser) await browser.close();
    }
}

module.exports = { scrapeFreeWebNovel };