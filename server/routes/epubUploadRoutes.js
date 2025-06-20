const multer = require("multer");
const { handleUploadEpub } = require("../utils/uploadEpub");
const express = require('express');
const router = express.Router();

const upload = multer({ dest: "uploads/epub" });

router.post('/', upload.single('epub'), async (req, res) => {
    const filePath = req.file.path;

    try {
        const bookId = await handleUploadEpub(filePath);
        res.json({ message: "Book saved", bookId });
    } catch (err) {
        console.error("Upload error:", err);
        res.status(500).json({ error: "Failed to process EPUB" });
    }
});
module.exports = router;