const { WebScraper } = require("../utils/WebScraper")
const express = require('express');
const { scrapeFreeWebNovel } = require("../utils/BrowserscrapeNovel")
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const { slug, limit } = req.query;

        if (!slug) {
            return res.status(400).json({ error: 'Missing slug parameter' });
        }

        const limitNum = limit ? parseInt(limit, 10) : 10;

        const out = await scrapeFreeWebNovel({
            slug: slug,
            limit: limitNum
        });
        return res.json(out);
    } catch (error) {
        console.error("Scraper error:", error);
        return res.status(500).json({ error: 'Failed to scrape novel' });
    }
})
module.exports = router;