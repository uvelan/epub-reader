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
const handleUploadEpub = async (filePath) => {
  const tmpName = path.basename(filePath, path.extname(filePath)); // e.g. upload_123.epub → upload_123

  try {
    // 1 — Extract metadata & chapters
    const { title, cover, chapters, description } = await processEpub(filePath);
    const id = title.trim().replace(/\s+/g, '_');

    // 2 — UPSERT into Postgres (content stored as JSONB for books is now null/omitted)
    await sql`
      INSERT INTO books (id, title, cover, description)
      VALUES (
        ${id},
        ${title},
        ${cover},
        ${description}
      )
      ON CONFLICT (id) DO UPDATE
        SET title       = EXCLUDED.title,
            cover       = EXCLUDED.cover,
            description = EXCLUDED.description;
    `;

    // 3 — REPLACE chapters
    // First delete existing chapters for this book (in case it's an update)
    await sql`DELETE FROM chapters WHERE book_id = ${id}`;

    // Then insert new chapters
    if (chapters && chapters.length > 0) {
      for (const chapter of chapters) {
        // Ensure text fields and JSON don't break the query
        await sql`
                  INSERT INTO chapters (book_id, chapter_index, name, path, content)
                  VALUES (
                    ${id},
                    ${chapter.id},
                    ${chapter.name},
                    ${chapter.path},
                    ${JSON.stringify(chapter.content)}
                  )
                `;
      }
    }

    await fs.unlink(filePath);
    return id;
  } catch (err) {
    await fs.unlink(filePath).catch(() => { }); // ensure file is removed even on failure
    throw err;
  }
};
module.exports = { handleUploadEpub };
