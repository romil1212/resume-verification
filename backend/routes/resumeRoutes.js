const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect } = require('../middleware/authMiddleware');
const {
  uploadResume,
  getMyResume,
  getResumeById,
  deleteResume,
} = require('../controllers/resumeController');

// Ensure root-level uploads directory exists
const uploadDir = path.resolve(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const cleanExt = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `resume-${uniqueSuffix}${cleanExt}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedExts = ['.pdf', '.docx'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF and DOCX files are allowed'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max limit
  fileFilter,
});

// Middleware wrapper that validates upload limits and normalizes web path
const handleUpload = (req, res, next) => {
  upload.single('resume')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, message: 'File size exceeds 5MB limit' });
      }
      return res.status(400).json({ success: false, message: err.message });
    } else if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }

    // Attach a consistent web-relative path for saving directly into MongoDB
    if (req.file) {
      req.file.webPath = `uploads/${req.file.filename}`;
    }

    next();
  });
};

router.post('/upload', protect, handleUpload, uploadResume);
router.get('/my-resume', protect, getMyResume);
router.get('/:id', protect, getResumeById);
router.delete('/:id', protect, deleteResume);

module.exports = router;