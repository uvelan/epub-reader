// uploadEpub.js  – Postgres-ready version
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const { sql } = require('../database/db');
const { processEpub } = require('./epubProcessorEpub');
/**
 * Parse an uploaded EPUB and store it in Postgres.
 * @param {string} filePath – absolute path of the temporary upload
 * @returns {Promise<string>} – the book’s UUID
 */
const handleUploadEpub = async (filePath) => {    const tmpName = path.basename(filePath, path.extname(filePath)); // e.g. upload_123.epub → upload_123

    try {
        // 1 — Extract metadata & chapters
        const { title, cover, chapters, description } = await processEpub(filePath);
        const id = title.trim().replace(/\s+/g, '_');

        // 2 — UPSERT into Postgres (content stored as JSONB)
        await sql`
      INSERT INTO books (id, title, cover, content, description)
      VALUES (
        ${id},
        ${title},
        ${cover},
        ${JSON.stringify(chapters)},
        ${description}
      )
      ON CONFLICT (id) DO UPDATE
        SET title       = EXCLUDED.title,
            cover       = EXCLUDED.cover,
            description = EXCLUDED.description;
    `;
        await fs.unlink(filePath);
        return id;
    } catch (err) {
        await fs.unlink(filePath).catch(() => {}); // ensure file is removed even on failure
        throw err;
    }
};
module.exports = { handleUploadEpub };
