require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const connectDB = require('./config/db');

// Connect to MongoDB
connectDB();

// Automatically drop the legacy unique index on startup so users can upload multiple resumes
mongoose.connection.once('open', async () => {
  try {
    const collections = await mongoose.connection.db.listCollections({ name: 'resumes' }).toArray();
    if (collections.length > 0) {
      await mongoose.connection.db.collection('resumes').dropIndex('userId_1');
      console.log('✅ Legacy unique userId_1 index dropped successfully.');
    }
  } catch (err) {
    // If the index was already dropped or doesn't exist, safely ignore
    if (err.codeName !== 'IndexNotFound') {
      console.log('[Index Sync Check]:', err.message);
    }
  }
});

const app = express();

// Ensure the local 'uploads' directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Global Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically so users can view and download them
app.use('/uploads', express.static(uploadsDir));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/resumes', require('./routes/resumeRoutes'));

// Central Error Handler
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`[Server] Active on port ${PORT}`));