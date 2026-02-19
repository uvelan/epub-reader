const axios = require('axios');
const { Buffer } = require('buffer');

async function WebUrlToBase64(imageUrl) {
    try {
        // Download the image
        const response = await axios.get(imageUrl, {
            responseType: 'arraybuffer',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        // Get content type from response headers
        const contentType = response.headers['content-type'] || 'image/jpeg';

        // Convert to base64
        const base64String = Buffer.from(response.data, 'binary').toString('base64');

        // Return data URI
        return `data:${contentType};base64,${base64String}`;
    } catch (error) {
        console.error('Error converting image URL to base64:', error.message);
        return null;
    }
}

module.exports = {WebUrlToBase64};