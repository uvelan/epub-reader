// const express = require('express');
// const multer = require('multer');
// const path = require('path');
// const fs = require('fs');
// const { processEpub } = require('../utils/epubProcessor');
// const router = express.Router();
//
// // Configure storage
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         const uploadDir = path.join(__dirname, '../uploads');
//         if (!fs.existsSync(uploadDir)) {
//             fs.mkdirSync(uploadDir, { recursive: true });
//         }
//         cb(null, uploadDir);
//     },
//     filename: (req, file, cb) => {
//         const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
//         cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
//     }
// });
//
// const upload = multer({
//     storage,
//     fileFilter: (req, file, cb) => {
//         if (file.mimetype === 'application/epub+zip' || path.extname(file.originalname) === '.epub') {
//             cb(null, true);
//         } else {
//             cb(new Error('Only EPUB files are allowed'));
//         }
//     },
//     limits: {
//         fileSize: 50 * 1024 * 1024 // 50MB limit
//     }
// });
//
// // EPUB upload and processing endpoint
// router.post('/epub', upload.single('epub'), async (req, res) => {
//     try {
//         if (!req.file) {
//             return res.status(400).json({ error: 'No file uploaded' });
//         }
//
//         const chapters = await processEpub(req.file.path);
//
//         // Cleanup - remove the uploaded file after processing
//         fs.unlink(req.file.path, (err) => {
//             if (err) console.error('Error deleting temp file:', err);
//         });
//
//         res.json({
//             success: true,
//             originalName: req.file.originalname,
//             chapters,
//             json: JSON.stringify(chapters, null, 2)
//         });
//     } catch (error) {
//         console.error('EPUB processing error:', error);
//         res.status(500).json({
//             error: 'Error processing EPUB file',
//             details: error.message
//         });
//     }
// });
//
// module.exports = router;