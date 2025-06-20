const express = require('express');
const db = require("../database/db");

const router = express.Router();

router.get("/", (req, res) => {
    db.all("SELECT id, title, cover, description FROM books", (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

router.get("/:id", (req, res) => {
    db.get("SELECT * FROM books WHERE id = ?", [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: "Not found" });
        res.json(JSON.parse(row.content));
    });
});

router.delete("/:id", (req, res) => {
    const { id } = req.params;
    db.run("DELETE FROM books WHERE id = ?", [id], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ success: true, deletedId: id });
    });
});


module.exports = router;