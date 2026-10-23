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

// Trust Nginx reverse proxy headers (for accurate client IPs and secure cookie/SSL handling)
app.set('trust proxy', 1);

// Ensure local 'uploads' directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Global Middlewares
app.use(cors({
  origin: '*', // Adjust or restrict to your AWS Amplify domain as needed
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(uploadsDir));

// Root Endpoint (for quick browser checks and curl commands)
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'CI/CD pipeline test: Backend updated successfully!',
    timestamp: new Date().toISOString()
  });
});

// Dedicated Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    dbState: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/resumes', require('./routes/resumeRoutes'));

// 404 Handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Central Error Handler
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Bind to process.env.PORT and 0.0.0.0
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Server] Active and listening on port ${PORT}`);
});