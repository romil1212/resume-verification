const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true, // Non-unique index allows multiple resumes per user
    },
    fileName: {
      type: String,
      required: true,
      trim: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      required: true,
      uppercase: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },

    // Extracted Candidate Details
    name: {
      type: String,
      default: '',
      trim: true,
    },
    email: {
      type: String,
      default: '',
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      default: '',
      trim: true,
    },
    skills: {
      type: [String],
      default: [],
    },
    education: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    experience: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },

    // Text & AI Analysis
    rawText: {
      type: String,
      default: '',
    },
    parsedSummary: {
      type: String,
      default: '',
    },

    // Verification Telemetry
    verificationScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    verificationStatus: {
      type: String,
      enum: ['VERIFIED', 'REJECTED', 'PENDING'],
      default: 'PENDING',
      index: true,
    },
    verificationRemarks: {
      type: [String],
      default: [],
    },
    verificationDetails: {
      nameFound: { type: Boolean, default: false },
      emailFound: { type: Boolean, default: false },
      phoneFound: { type: Boolean, default: false },
      educationFound: { type: Boolean, default: false },
      skillsFound: { type: Boolean, default: false },
      experienceFound: { type: Boolean, default: false },
    },
    isPrimary: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual property to automatically construct a web-friendly path
resumeSchema.virtual('downloadUrl').get(function () {
  if (!this.filePath) return '';
  const cleanPath = this.filePath.replace(/\\/g, '/');
  return `/${cleanPath.replace(/^\/?/, '')}`;
});

// Compound index for fast queries when sorting a user's resume history
resumeSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Resume', resumeSchema);