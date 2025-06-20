// const JSZip = require('jszip');
// const xml2js = require('xml2js');
// const path = require('path');
// const fs = require('fs');
// const EPub = require("epub");
//
// const parseXml = async (xmlString) => {
//     const parser = new xml2js.Parser();
//     return await parser.parseStringPromise(xmlString);
// };
//
// const normalizePath = (filePath) => {
//     return filePath.split(path.sep).join('/');
// };
//
// const extractTextFromHtml = (html) => {
//     // Simple HTML to text conversion - improve as needed
//     return html
//         .replace(/<[^>]+>/g, ' ')
//         .replace(/\s+/g, ' ')
//         .trim();
// };
//
//
// exports.processEpubb = (filePath) => {
//     return new Promise((resolve, reject) => {
//         try {
//             const epub = new EPub(filePath);
//
//             epub.on("error", (err) => {
//                 console.error("EPUB error:", err);
//                 reject(err);
//             });
//
//             epub.on("end", () => {
//                 const toc = epub.toc;
//                 const chapters = [];
//
//                 let pending = toc.length;
//                 if (pending === 0) return resolve([]);
//
//                 toc.forEach((chapter, index) => {
//                     epub.getChapter(chapter.id, (err, text) => {
//                         if (err) {
//                             console.error(`Failed to load chapter ${index}:`, err);
//                             text = ""; // default to empty content
//                         }
//
//                         chapters.push({
//                             id: index,
//                             name: chapter.title,
//                             path: chapter.href,
//                             content:  extractTextFromHtml(text)
//                         });
//
//                         pending--;
//                         if (pending === 0) {
//                             // All chapters processed
//                             resolve(chapters);
//                         }
//                     });
//                 });
//             });
//
//             epub.parse();
//         } catch (error) {
//             console.error("EPUB processing error:", error);
//             reject(error);
//         }
//     });
// };
//
//
// exports.processEpub = async (filePath) => {
//     try {
//         const data = await fs.promises.readFile(filePath);
//         const zip = await JSZip.loadAsync(data);
//         const chapters = [];
//
//         // 1. Read container.xml to find OPF file location
//         const containerXml = await zip.file('META-INF/container.xml')?.async('text');
//         if (!containerXml) throw new Error('Invalid EPUB: container.xml not found');
//
//         const container = await parseXml(containerXml);
//         const opfPath = container.container.rootfiles[0].rootfile[0].$['full-path'];
//         const opfDir = path.dirname(opfPath);
//
//         // 2. Parse OPF file
//         const opfFile = await zip.file(opfPath)?.async('text');
//         if (!opfFile) throw new Error('Invalid EPUB: OPF file not found');
//
//         const opf = await parseXml(opfFile);
//         const manifest = {};
//         const spine = [];
//
//         // Process manifest
//         opf.package.manifest[0].item.forEach(item => {
//             manifest[item.$.id] = item.$;
//         });
//
//         // Process spine
//         opf.package.spine[0].itemref.forEach(item => {
//             spine.push(item.$['idref']);
//         });
//
//         // 3. Process each spine item as a chapter
//         for (let i = 0; i < spine.length; i++) {
//             const itemId = spine[i];
//             const item = manifest[itemId];
//             if (!item) continue;
//
//             const chapterPath =  normalizePath(path.join(opfDir, item.href));
//             const chapterContent = await zip.file(chapterPath)?.async('text');
//             if (!chapterContent) continue;
//
//             // Extract chapter title (simplified)
//             let chapterName = `Chapter ${i + 1}`;
//             const titleMatch = chapterContent.match(/<title[^>]*>([^<]+)<\/title>/i);
//             if (titleMatch) chapterName = titleMatch[1];
//
//             chapters.push({
//                 id: `chapter-${i + 1}`,
//                 name: chapterName,
//                 path: chapterPath,
//                 content: extractTextFromHtml(chapterContent).substring(0, 500) + '...'
//             });
//         }
//
//         return chapters;
//     } catch (error) {
//         console.error('EPUB processing error:', error);
//         throw error;
//     }
// };
//
//  this.processEpubb("K:\\Projects\\epubbReader\\server\\uploads\\epubs\\Alchemy_Emperor_Of_The_Divine_Dao.epub")
//      .then(result => {
//          console.log(result);
//      });
//
//  // this.processEpubb("K:\\Projects\\epubbReader\\server\\uploads\\epubs\\The Desolate Era - Complete.epub")
//  //     .then(result => {
//  //         console.log(result);
//  //     });
