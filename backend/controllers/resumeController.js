const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const Resume = require('../models/Resume');
const { extractTextFromFile, verifyResumeText } = require('../services/resumeVerification');

// Helper to safely resolve and delete disk files regardless of stored format
const safeDeleteFile = (storedFilePath) => {
  if (!storedFilePath) return;

  try {
    let absolutePath = storedFilePath;

    // If stored as 'uploads/resume-....pdf', resolve from backend directory
    if (!path.isAbsolute(storedFilePath)) {
      absolutePath = path.resolve(__dirname, '..', storedFilePath);
    }

    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
    }
  } catch (err) {
    console.error(`[File Cleanup Error]: Failed to delete ${storedFilePath}`, err);
  }
};

// 1. Upload Resume
exports.uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a PDF or DOCX file' });
    }

    const userId = req.user._id || req.user.id;
    const fileExt = path.extname(req.file.originalname).substring(1).toLowerCase();

    // Prefer webPath from middleware or fallback strictly to 'uploads/<filename>'
    const webRelativePath = req.file.webPath || `uploads/${path.basename(req.file.path)}`;

    // 1. Text Extraction (uses disk path provided by Multer)
    const rawText = await extractTextFromFile(req.file.path, fileExt);

    // 2. Verification Logic
    const verificationResults = verifyResumeText(rawText, req.user.name);

    // 3. Save new resume profile to MongoDB (default isDeleted is false)
    const newResume = await Resume.create({
      userId,
      fileName: req.file.originalname,
      filePath: webRelativePath, // Guarantees clean 'uploads/resume-....pdf'
      fileType: fileExt.toUpperCase(),
      fileSize: req.file.size,
      rawText: rawText || '',
      isDeleted: false,
      ...verificationResults,
    });

    res.status(201).json({
      success: true,
      message: 'Resume verified and stored in profile successfully',
      data: newResume,
    });
  } catch (error) {
    // If text extraction or verification throws an error, delete temporary upload
    if (req.file) {
      safeDeleteFile(req.file.path);
    }
    res.status(500).json({ success: false, message: error.message || 'Server error during resume processing' });
  }
};

// 2. STEP-2: List API - Return only ACTIVE (non-deleted) resumes for the user
exports.getMyResume = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    // Filter by userId and strictly exclude records where isDeleted is true
    const resumes = await Resume.find({
      userId,
      isDeleted: false,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: resumes.length,
      data: resumes,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. STEP-3: Get Single Resume - Ensure soft-deleted records return 404
exports.getResumeById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id || req.user.id;

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid resume ID format' });
    }

    // Must match ID, owner, and not be deleted
    const resume = await Resume.findOne({ _id: id, userId, isDeleted: false });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found or has already been deleted',
      });
    }

    res.status(200).json({ success: true, data: resume });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. STEP-1 & STEP-3: Soft-Delete API - Update isDeleted flag instead of removing document
exports.deleteResume = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id || req.user.id;

    // Validate ID format (handles malformed IDs in Postman testing)
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid resume ID format',
      });
    }

    // Atomic update: only find and update if isDeleted is currently false
    const updatedResume = await Resume.findOneAndUpdate(
      { _id: id, userId, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true }
    );

    // Return 404 if record doesn't exist OR was already deleted
    if (!updatedResume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found or has already been deleted',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Resume removed successfully from profile',
      data: {
        id: updatedResume._id,
        isDeleted: updatedResume.isDeleted,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};