// routes/books.js
const express = require('express');
const { sql } = require('../database/db');   // ← from the Neon helper you already built

const router = express.Router();

/* ──────────────────────────────────────────────────────────────────
   GET /books          →  list all books (id, title, cover, description)
   ────────────────────────────────────────────────────────────────── */
router.get('/', async (_req, res) => {
    try {
        const rows = await sql`
      SELECT id, title, cover, description
      FROM books
      ORDER BY title ASC;
    `;
        res.json(rows);                         // Neon returns plain JS objects
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

/* ──────────────────────────────────────────────────────────────────
   GET /books/:id      →  full content of one book
   ────────────────────────────────────────────────────────────────── */
router.get('/:id', async (req, res) => {
    try {
        const [row] = await sql`
      SELECT content, chapterId, sentenceId
      FROM books
      WHERE id = ${req.params.id}
      LIMIT 1;
    `;

        if (!row) return res.status(404).json({ error: 'Not found' });
        res.json(row);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

router.post('/:id/progress', async (req, res) => {
    const { chapterId, sentenceId } = req.body || {};

    if (
        chapterId === undefined ||
        sentenceId === undefined ||
        Number.isNaN(+chapterId) ||
        Number.isNaN(+sentenceId)
    ) {
        return res
            .status(400)
            .json({ error: 'chapterId and sentenceId (numbers) are required' });
    }

    try {
        const [row] = await sql`
      UPDATE books
      SET chapterId  = ${chapterId},
          sentenceId = ${sentenceId}
      WHERE id = ${req.params.id}
      RETURNING id, chapterId , sentenceId;
    `;

        if (!row) return res.status(404).json({ error: 'Not found' });
        res.status(200).json(row);            // ← echoes the saved progress
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});
/* ──────────────────────────────────────────────────────────────────
   DELETE /books/:id   →  remove a book (returns deletedId on success)
   ────────────────────────────────────────────────────────────────── */
router.delete('/:id', async (req, res) => {
    try {
        const [deleted] = await sql`
      DELETE FROM books
      WHERE id = ${req.params.id}
      RETURNING id;
    `;

        if (!deleted)
            return res.status(404).json({ error: 'Not found' });

        res.json({ success: true, deletedId: deleted.id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

module.exports = router;
