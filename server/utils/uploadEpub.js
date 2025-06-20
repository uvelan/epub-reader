// uploadEpub.js
const fs = require("fs");
const path = require("path");
const db = require("../database/db");
const { processEpub } = require("./epubProcessorEpub");

/**
 * Handles saving EPUB to SQLite after parsing
 * @param {string} filePath - Temp path of uploaded file
 * @returns {Promise<string>} - Book ID saved
 */
const handleUploadEpub = async (filePath) => {
    const bookId = path.basename(filePath, path.extname(filePath));

    try {
        const book = await processEpub(filePath);
        const timestampId = Date.now().toString();
        await new Promise((resolve, reject) => {
            db.run(
                `INSERT OR REPLACE INTO books (id, title, cover, content, description) VALUES (?, ?, ?, ?,?)`,
                [timestampId, book.title, book.cover, JSON.stringify(book.chapters), book.description],
                (err) => (err ? reject(err) : resolve())
            );
        });

        fs.unlinkSync(filePath); // Clean up temp file
        return bookId;
    } catch (err) {
        fs.unlinkSync(filePath); // Always cleanup
        throw err;
    }
};

module.exports = { handleUploadEpub };
