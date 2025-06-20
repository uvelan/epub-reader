// const express = require("express");
// const EPub = require("epub");
// const path = require("path");
// const processEpub = require("../utils/epubProcessorEpub");
//
// const router = express.Router();
//
// // GET /epub?file=path/to/book.epub
// router.get("/", async (req, res) => {
//     const file = req.query.file;
//     if (!file) return res.status(400).json({ error: "Missing 'file' parameter" });
//
//     const filePath = path.resolve(file);
//
//     try {
//         const chapters = await processEpub.processEpub("K:\\\\Projects\\\\epubbReader\\\\server\\\\uploads\\\\epubs\\\\Alchemy_Emperor_Of_The_Divine_Dao.epub");
//         res.json(chapters);
//     } catch (err) {
//         console.error("EPUB error:", err);
//         res.status(500).json({ error: "Failed to process EPUB" });
//     }
// });
//
// // GET /epub/cover?file=path/to/book.epub
// router.get("/cover", (req, res) => {
//     const file = req.query.file;
//     if (!file) return res.status(400).send("Missing 'file' parameter");
//
//     const filePath = path.resolve(file);
//     const epub = new EPub(filePath);
//
//     epub.on("error", (err) => {
//         console.error("EPUB error:", err);
//         res.status(500).send("Failed to open EPUB");
//     });
//
//     epub.on("end", () => {
//         const coverId = epub.cover;
//         if (!coverId) return res.status(404).send("Cover not found");
//
//         epub.getImage(coverId, (err, data, mimeType) => {
//             if (err) {
//                 console.error("Cover error:", err);
//                 return res.status(500).send("Failed to load cover image");
//             }
//
//             res.set("Content-Type", mimeType);
//             res.send(data);
//         });
//     });
//
//     epub.parse();
// });
//
// module.exports = router;
