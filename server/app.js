const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
// const authRoutes = require('./routes/auth');
// const uploadRoutes = require('./routes/upload');
// const epubRoutes = require('./routes/epubRoutes'); // Add this line
// const epub = require("./routes/getEpub");
const epubUploadRoutes = require('./routes/epubUploadRoutes');
const epubDetails = require('./routes/getDetailsEpubRoutes');

const path = require('path');

require('./database/db');

const app = express();
// Add this with other route imports
// const epubRoutes = require('./routes/epubRoutes');

// Add this with other route middleware
// app.use('/api/epub', epubRoutes);
// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/upload', uploadRoutes);
// app.use('/api/epub', epubRoutes);
// app.use('/epub', epub);

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/upload', epubUploadRoutes);
app.use('/epub/',epubDetails);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});