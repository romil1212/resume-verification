const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

const escapeRegExp = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// 1. Text Extraction with detailed logging
const extractTextFromFile = async (filePath, fileType) => {
  const absolutePath = path.resolve(filePath);
  const fileBuffer = fs.readFileSync(absolutePath);

  if (fileType.toLowerCase() === 'pdf') {
    const data = await pdfParse(fileBuffer);
    console.log('--- EXTRACTED PDF TEXT START ---');
    console.log(data.text ? data.text.substring(0, 300) : 'NO TEXT EXTRACTED');
    console.log('--- EXTRACTED PDF TEXT END ---');
    return data.text || '';
  } else if (fileType.toLowerCase() === 'docx') {
    const result = await mammoth.extractRawText({ buffer: fileBuffer });
    return result.value || '';
  }
  return '';
};

// 2. Resume Verification Logic
const verifyResumeText = (rawText, candidateName = '') => {
  const text = (rawText || '').replace(/\r\n/g, '\n');

  // 1. Email Detection
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;
  const emailMatch = text.match(emailRegex);
  const detectedEmail = emailMatch ? emailMatch[0] : '';

  // 2. Phone Detection (Handles 10-digit Indian numbers, with or without spaces/hyphens)
  const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\b[6-9]\d{9}\b/g;
  const phoneMatch = text.match(phoneRegex);
  const detectedPhone = phoneMatch ? phoneMatch[0].trim() : '';

  // 3. Name Detection
  let detectedName = '';
  if (candidateName && text.toLowerCase().includes(candidateName.toLowerCase())) {
    detectedName = candidateName;
  } else {
    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length > 0 && lines[0].length < 50) {
      detectedName = lines[0];
    }
  }

  // 4. Skills Detection
  const skillKeywords = [
    'javascript', 'python', 'java', 'c++', 'c#', 'react', 'node', 'express',
    'mongodb', 'sql', 'mysql', 'html', 'css', 'tailwind', 'git', 'github', 'docker',
    'aws', 'gcp', 'terraform', 'linux', 'rest api', 'data structures', 'algorithms',
    'devops', 'socket.io'
  ];
  const detectedSkills = [];
  skillKeywords.forEach((skill) => {
    const escaped = escapeRegExp(skill);
    const regex = new RegExp(`(?:\\b|(?<=\\s))${escaped}(?:\\b|(?=\\s))`, 'i');
    if (regex.test(text)) {
      detectedSkills.push(skill.toUpperCase());
    }
  });

  // 5. Education Detection
  const educationKeywords = [
    'bachelor', 'master', 'b.tech', 'mca', 'bca', 'b.sc', 'm.sc', 'degree',
    'university', 'college', 'school', 'diploma', 'gpa', 'cgpa', 'education'
  ];
  const detectedEducation = [];
  educationKeywords.forEach((edu) => {
    const escaped = escapeRegExp(edu);
    const regex = new RegExp(`(?:\\b|(?<=\\s))${escaped}(?:\\b|(?=\\s))`, 'i');
    if (regex.test(text)) {
      detectedEducation.push(edu.toUpperCase());
    }
  });

  // 6. Experience / Projects Detection
  const experienceKeywords = [
    'experience', 'internship', 'employment', 'work history', 'developer',
    'software engineer', 'engineer', 'analyst', 'responsibilities', 'project', 'projects'
  ];
  const detectedExperience = [];
  experienceKeywords.forEach((exp) => {
    const escaped = escapeRegExp(exp);
    const regex = new RegExp(`(?:\\b|(?<=\\s))${escaped}(?:\\b|(?=\\s))`, 'i');
    if (regex.test(text)) {
      detectedExperience.push(exp.toUpperCase());
    }
  });

  // Verification Flags
  const nameFound = Boolean(detectedName);
  const emailFound = Boolean(detectedEmail);
  const phoneFound = Boolean(detectedPhone);
  const educationFound = detectedEducation.length > 0;
  const skillsFound = detectedSkills.length > 0;
  const experienceFound = detectedExperience.length > 0;

  // 100-Point Score Calculation
  let score = 0;
  const remarks = [];

  if (nameFound) score += 20;
  else remarks.push('Candidate name was not detected.');

  if (emailFound) score += 20;
  else remarks.push('Valid email address was not detected.');

  if (phoneFound) score += 20;
  else remarks.push('Contact phone number was not detected.');

  if (educationFound) score += 20;
  else remarks.push('Education details were not detected.');

  if (skillsFound) score += 20;
  else remarks.push('Technical skills section was not detected.');

  if (!experienceFound) {
    remarks.push('Experience or project details were not detected.');
  }

  const status = score >= 70 ? 'VERIFIED' : 'REJECTED';
  if (remarks.length === 0) {
    remarks.push('All required resume information was detected successfully.');
  }

  return {
    name: detectedName,
    email: detectedEmail,
    phone: detectedPhone,
    skills: detectedSkills,
    education: detectedEducation,
    experience: detectedExperience,
    verificationScore: score,
    verificationStatus: status,
    verificationRemarks: remarks,
    verificationDetails: {
      nameFound,
      emailFound,
      phoneFound,
      educationFound,
      skillsFound,
      experienceFound,
    },
  };
};

module.exports = { extractTextFromFile, verifyResumeText };