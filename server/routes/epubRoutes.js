// const express = require('express');
// const multer = require('multer');
// const path = require('path');
// const fs = require('fs');
// const { processEpub } = require('../utils/epubProcessorEpub');
// const router = express.Router();
//
// // Configure storage for EPUB files
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         const uploadDir = path.join(__dirname, '../uploads/epubs');
//         if (!fs.existsSync(uploadDir)) {
//             fs.mkdirSync(uploadDir, { recursive: true });
//         }
//         cb(null, uploadDir);
//     },
//     filename: (req, file, cb) => {
//         const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
//         cb(null, 'epub-' + uniqueSuffix + path.extname(file.originalname));
//     }
// });
//
// // File filter to only accept EPUB files
// const fileFilter = (req, file, cb) => {
//     const ext = path.extname(file.originalname).toLowerCase();
//     if (ext === '.epub' || file.mimetype === 'application/epub+zip') {
//         cb(null, true);
//     } else {
//         cb(new Error('Only EPUB files are allowed'), false);
//     }
// };
//
// const upload = multer({
//     storage,
//     fileFilter,
//     limits: {
//         fileSize: 50 * 1024 * 1024 // 50MB limit
//     }
// });
//
// // EPUB upload and processing endpoint
// router.post('/', upload.single('epub'), async (req, res) => {
//     try {
//         if (!req.file) {
//             return res.status(400).json({
//                 success: false,
//                 error: 'No file uploaded or invalid file type'
//             });
//         }
//         console.log(req.file);
//         // Process the EPUB file
//         const chapters = await processEpub(req.file.path);
//
//         // Clean up - remove the uploaded file after processing
//         fs.unlink(req.file.path, (err) => {
//             if (err) console.error('Error deleting temporary EPUB file:', err);
//         });
//
//         res.json({
//             success: true,
//             originalName: req.file.originalname,
//             chapters: chapters,
//             json: JSON.stringify(chapters, null, 2)
//         });
//
//     } catch (error) {
//         console.error('EPUB processing error:', error);
//
//         // Clean up if error occurred
//         if (req.file?.path) {
//             fs.unlink(req.file.path, (err) => {
//                 if (err) console.error('Error cleaning up failed upload:', err);
//             });
//         }
//
//         res.status(500).json({
//             success: false,
//             error: 'Error processing EPUB file',
//             details: error.message
//         });
//     }
// });
//
// module.exports = router;