require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const connectDB = require('./config/db');

// Connect to MongoDB
connectDB();

// Automatically drop legacy unique index on startup so users can upload multiple resumes
mongoose.connection.once('open', async () => {
  try {
    const collections = await mongoose.connection.db.listCollections({ name: 'resumes' }).toArray();
    if (collections.length > 0) {
      await mongoose.connection.db.collection('resumes').dropIndex('userId_1');
      console.log('✅ Legacy unique userId_1 index dropped successfully.');
    }
  } catch (err) {
    if (err.codeName !== 'IndexNotFound') {
      console.log('[Index Sync Check]:', err.message);
    }
  }
});

const app = express();

// Ensure local 'uploads' directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Global Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(uploadsDir));

// Health check endpoint for Render monitoring
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

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

// Bind to process.env.PORT and 0.0.0.0 for Render
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Server] Active and listening on port ${PORT}`);
});