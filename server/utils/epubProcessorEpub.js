const EPub = require("epub");
const cheerio = require("cheerio");
const sharp = require("sharp");

exports.processEpub = (filePath) => {
    return new Promise((resolve, reject) => {
        try {
            const epub = new EPub(filePath);

            epub.on("error", (err) => {
                console.error("EPUB error:", err);
                reject(err);
            });

            epub.on("end", async () => {
                const toc = epub.toc;
                const meta = epub.metadata
                const book = {};
                book.title = meta.title;
                book.description = meta.description
                book.chapters = [];

                let pending = toc.length;
                if (pending === 0) return resolve([]);

                let coverId = meta.cover;

                // Fallback: look through manifest for image with "cover" in id or href
                if (!coverId) {
                    const fallbackKey = Object.keys(epub.manifest).find(
                        (key) =>
                            key.toLowerCase().includes("cover") &&
                            epub.manifest[key].media_type?.startsWith("image")
                    );
                    if (fallbackKey) coverId = fallbackKey;
                }

                let cover = "";
                if (coverId) {
                    try {
                        cover = await new Promise((res, rej) => {
                            epub.getImage(coverId, async (err, data, mimeType) => {
                                if (err || !data) return res("");

                                const resized = await sharp(data)
                                    .resize(200, 300, {fit: "cover"}) // adjust dimensions
                                    .toFormat("jpeg", {quality: 70})   // compress jpeg
                                    .toBuffer();

                                res(`data:image/jpeg;base64,${resized.toString("base64")}`);
                            });
                        });
                    } catch (e) {
                        console.warn("Cover image failed to load:", e);
                        cover = "";
                    }
                }


                book.cover = cover;

                toc.forEach((chapter, index) => {
                    epub.getChapter(chapter.id, (err, html) => {
                        if (err) {
                            console.error(`Failed to load chapter ${index}:`, err);
                            html = "";
                        }

                        // 🧼 Parse and split into paragraphs
                        const $ = cheerio.load(html);
                        const paragraphs = [];
                        $('h1, h2, h3, h4, h5, h6, p').each((_, p) => {
                            const text = $(p).text().trim();
                            if (text) paragraphs.push(text);
                        });

                        book.chapters.push({
                            id: index,
                            name: chapter.title,
                            path: chapter.href,
                            content: paragraphs, // ⬅️ array of paragraphs
                        });

                        pending--;
                        if (pending === 0) {
                            resolve(book);
                        }
                    });
                });
            });

            epub.parse();
        } catch (error) {
            console.error("EPUB processing error:", error);
            reject(error);
        }
    });
};

