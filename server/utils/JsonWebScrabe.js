// scrape-alchemy-json.js
// --------------------------------------------------------------
// npm i axios cheerio
// --------------------------------------------------------------
const axios   = require('axios');
const cheerio = require('cheerio');
const fs      = require('fs').promises;

/* ─── Config ─────────────────────────────────────────────────── */
const BASE_URL     = 'https://freewebnovel.com';
const NOVEL_SLUG   = 'nine-star-hegemon-body-arts';
const NOVEL_URL    = `${BASE_URL}/novel/${NOVEL_SLUG}`;
const OUT_JSON     = `${NOVEL_SLUG}.json`;
const UA           = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
    + '(KHTML, like Gecko) Chrome/125.0 Safari/537.36';

/* ─── Helper: fetch remote asset → Base‑64 data‑URI ──────────── */
async function urlToBase64 (url) {
    const res    = await axios.get(url, { responseType: 'arraybuffer', headers:{'User-Agent':UA} });
    const mime   = res.headers['content-type'] || 'image/jpeg';
    return `data:${mime};base64,${Buffer.from(res.data, 'binary').toString('base64')}`;
}

/* ─── Main scraper ───────────────────────────────────────────── */
async function scrapeNovel () {
    /* 1. Landing page */
    const { data: html } = await axios.get(NOVEL_URL, { headers:{'User-Agent':UA} });
    const $ = cheerio.load(html);

    /* meta */
    const title = $('h1, .tit h3').first().text().trim();
    const summary =
        $('.summary, .SUMMARY, .inner').text().trim()
        || $('h3:contains("SUMMARY")').next('p').text().trim();
    const coverUrl =
        $('meta[property="og:image"]').attr('content')
        || $('.book-img img').attr('src')
        || '';

    /* Convert cover → Base‑64 */
    const img = coverUrl ? await urlToBase64(coverUrl) : null;

    /* 2. All chapter links */
    const chapterLinks = [];
    $('.ul-list5[id=idData] > li a').each((_, el) =>
        chapterLinks.push(el.attribs)
    );

    /* 3. Fetch chapters sequentially (polite delay) */
    const chapterList = [];
    for (let i = 0; i < 5; i++) {
        try {
            const url  =BASE_URL + chapterLinks[i]['href'];
            const { data: cHtml } = await axios.get(url, { headers:{'User-Agent':UA} });
            const $$ = cheerio.load(cHtml);

            const paragraphs = [];

            const chTitle = chapterLinks[i]['title'] ;
           $$('#articleh1, h2, h3, h4, h5, h6, p').each((_, p) => {
                const text = $(p).text().trim();
                if (text) paragraphs.push(text);
            });

            chapterList.push({ title: chTitle, paragraphs , id:i});
            console.log(`✔︎ ${i + 1}/${chapterLinks.length}  ${chTitle}`);

            await new Promise(r => setTimeout(r, 1200));        // polite delay
        } catch (err) {
            console.warn(`⚠︎  Chapter ${i + 1} failed – ${err.message}`);
        }
    }

    /* 4. Build JSON object & write */
    const novelJson = { title, img, summery: summary, chapterList };
    await fs.writeFile(OUT_JSON, JSON.stringify(novelJson, null, 2), 'utf8');
    console.log('\nDone!  Saved →', OUT_JSON);
}

/* ─── Execute if run directly ───────────────────────────────── */
if (require.main === module) scrapeNovel();

module.exports = { scrapeNovel };
