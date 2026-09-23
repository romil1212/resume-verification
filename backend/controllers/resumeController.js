const path = require('path');
const fs = require('fs');
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

    // 3. Save new resume profile to MongoDB (previous resumes are preserved)
    const newResume = await Resume.create({
      userId,
      fileName: req.file.originalname,
      filePath: webRelativePath, // Guarantees clean 'uploads/resume-....pdf'
      fileType: fileExt.toUpperCase(),
      fileSize: req.file.size,
      rawText: rawText || '',
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

// Return ALL resumes belonging to the user so none are lost
exports.getMyResume = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const resumes = await Resume.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: resumes.length,
      data: resumes,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getResumeById = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const resume = await Resume.findOne({ _id: req.params.id, userId });

    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    res.status(200).json({ success: true, data: resume });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteResume = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const resume = await Resume.findOne({ _id: req.params.id, userId });

    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    safeDeleteFile(resume.filePath);
    await Resume.deleteOne({ _id: resume._id });

    res.status(200).json({ success: true, message: 'Resume removed successfully from profile' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};