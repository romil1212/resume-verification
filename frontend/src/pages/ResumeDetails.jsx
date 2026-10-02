import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../services/api';

const ResumeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_HOST = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/api\/?$/, '');

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const res = await API.get(`/resumes/${id}`);
        setResume(res.data?.data || null);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load resume details.');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  const handleDelete = async () => {
    const confirmed = window.confirm(`Are you sure you want to delete "${resume?.fileName || 'this resume'}"?`);
    if (!confirmed) return;

    try {
      await API.delete(`/resumes/${id}`);
      navigate('/resumes');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete resume.');
    }
  };

  const getCleanFileUrl = (pathString) => {
    if (!pathString) return null;
    const normalized = pathString.replace(/\\/g, '/');
    const filename = normalized.split('uploads/').pop();
    return `${API_HOST}/uploads/${filename}`;
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-slate-500">Loading resume report...</p>
      </div>
    );
  }

  if (error || !resume) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl">
          <p className="font-semibold text-sm">{error || 'Resume not found.'}</p>
          <Link
            to="/resumes"
            className="inline-block mt-4 px-4 py-2 bg-white text-red-700 border border-red-300 rounded-lg text-xs font-semibold hover:bg-red-100 transition"
          >
            &larr; Back to My Resumes
          </Link>
        </div>
      </div>
    );
  }

  const isVerified = resume.verificationStatus === 'VERIFIED';
  const fileUrl = getCleanFileUrl(resume.filePath);
  const uploadDate = resume.createdAt
    ? new Date(resume.createdAt).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : 'Unknown date';
  const fileSizeKb = resume.fileSize ? (resume.fileSize / 1024).toFixed(1) : 0;

  // Verification Checklist Items
  const details = resume.verificationDetails || {};
  const checklist = [
    { label: 'Candidate Name', isFound: Boolean(details.nameFound || resume.name) },
    { label: 'Email Address', isFound: Boolean(details.emailFound || resume.email) },
    { label: 'Phone Number', isFound: Boolean(details.phoneFound || resume.phone) },
    { label: 'Education Section', isFound: Boolean(details.educationFound || (resume.education && resume.education.length > 0)) },
    { label: 'Skills Section', isFound: Boolean(details.skillsFound || (resume.skills && resume.skills.length > 0)) },
    { label: 'Experience Details', isFound: Boolean(details.experienceFound || (resume.experience && resume.experience.length > 0)) },
  ];

  const detectedItems = checklist.filter((item) => item.isFound);
  const missingItems = checklist.filter((item) => !item.isFound);

  // ATS Breakdown calculation based on real extraction
  const contactScore = Math.round(
    ((details.nameFound ? 1 : 0) + (details.emailFound ? 1 : 0) + (details.phoneFound ? 1 : 0)) / 3 * 100
  );
  const skillsScore = resume.skills?.length > 0 ? Math.min(100, resume.skills.length * 15 + 40) : 0;
  const educationScore = details.educationFound ? 90 : 20;
  const experienceScore = details.experienceFound ? 85 : 30;
  const structureScore = resume.rawText?.length > 100 ? 88 : 40;

  const atsBreakdown = [
    { name: 'Contact Information', score: contactScore },
    { name: 'Technical Skills', score: skillsScore },
    { name: 'Education & Academics', score: educationScore },
    { name: 'Experience & Projects', score: experienceScore },
    { name: 'Document Structure & Format', score: structureScore },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Action & Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Link
            to="/resumes"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition"
          >
            &larr; My Resumes
          </Link>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 px-2 py-1.5 transition"
          >
            Dashboard
          </Link>
        </div>

        <div className="flex items-center gap-2">
          {fileUrl && (
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold rounded-lg hover:bg-blue-100 transition"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Open Original Document
            </a>
          )}
          <button
            type="button"
            onClick={handleDelete}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 text-xs font-semibold rounded-lg hover:bg-red-100 transition"
          >
            Delete Resume
          </button>
        </div>
      </div>

      {/* Main Document & Status Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Inspected Document
          </span>
          <h1 className="text-xl font-bold text-slate-900 mt-0.5 break-all">
            {resume.fileName}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Uploaded on {uploadDate} • {fileSizeKb} KB • {resume.fileType || 'DOCUMENT'}
          </p>
        </div>

        <div className="flex items-center gap-4 shrink-0 sm:border-l sm:border-slate-200 sm:pl-6">
          <div className="text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Completeness
            </span>
            <span className="text-2xl font-black text-slate-900">
              {resume.verificationScore ?? 0}<span className="text-sm font-semibold text-slate-400">/100</span>
            </span>
          </div>

          <span
            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase border ${
              isVerified
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-red-50 text-red-700 border-red-200'
            }`}
          >
            {resume.verificationStatus || 'PENDING'}
          </span>
        </div>
      </div>

      {/* Grid: Resume Information & Candidate Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Card 1: Resume Information */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 pb-2 border-b border-slate-100">
            Resume Information
          </h2>
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1">
              <span className="text-slate-500">File Name:</span>
              <span className="font-semibold text-slate-800 truncate max-w-[220px]" title={resume.fileName}>
                {resume.fileName}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Upload Date:</span>
              <span className="font-semibold text-slate-800">{uploadDate}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">File Format:</span>
              <span className="font-semibold text-slate-800 uppercase">{resume.fileType || 'N/A'}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">File Size:</span>
              <span className="font-semibold text-slate-800">{fileSizeKb} KB</span>
            </div>
          </div>
        </div>

        {/* Card 2: Extracted Candidate Information */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 pb-2 border-b border-slate-100">
            Extracted Candidate Information
          </h2>
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Name:</span>
              <span className={`font-semibold ${resume.name ? 'text-slate-900' : 'text-amber-600'}`}>
                {resume.name || 'Not detected'}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Email:</span>
              <span className={`font-semibold break-all ${resume.email ? 'text-slate-900' : 'text-amber-600'}`}>
                {resume.email || 'Not detected'}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Phone:</span>
              <span className={`font-semibold ${resume.phone ? 'text-slate-900' : 'text-amber-600'}`}>
                {resume.phone || 'Not detected'}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Text Length:</span>
              <span className="font-semibold text-slate-800">
                {resume.rawText ? `${resume.rawText.length} characters` : '0 characters'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* STEP 7 — VERIFICATION RESULT SECTION */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-100 gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900">Resume Verification Result</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Structural completeness evaluation based on detected contact, academic, and professional sections.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">Score:</span>
            <span className="text-base font-bold text-blue-600">{resume.verificationScore ?? 0}/100</span>
            <span
              className={`px-2 py-0.5 rounded text-xs font-bold ${
                isVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
              }`}
            >
              {isVerified ? 'Verified' : 'Rejected'}
            </span>
          </div>
        </div>

        {/* Found and Missing Summary Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {/* Detected Section */}
          <div className="bg-emerald-50/60 border border-emerald-200 rounded-lg p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-2 flex items-center gap-1.5">
              <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
              Detected Information ({detectedItems.length})
            </h3>
            <ul className="space-y-1.5 text-xs text-emerald-900">
              {detectedItems.length > 0 ? (
                detectedItems.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>{item.label}</span>
                  </li>
                ))
              ) : (
                <li className="text-slate-400 italic">No standard sections were detected.</li>
              )}
            </ul>
          </div>

          {/* Missing Section */}
          <div className="bg-amber-50/60 border border-amber-200 rounded-lg p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-800 mb-2 flex items-center gap-1.5">
              <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M12 4a8 8 0 100 16 8 8 0 000-16z" />
              </svg>
              Missing Information ({missingItems.length})
            </h3>
            <ul className="space-y-1.5 text-xs text-amber-900">
              {missingItems.length > 0 ? (
                missingItems.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="text-amber-600 font-bold">⚠</span>
                    <span>{item.label}</span>
                  </li>
                ))
              ) : (
                <li className="text-emerald-700 font-medium">
                  ✓ None! All standard resume sections are present.
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Academic Disclaimer Note */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-[11px] text-slate-500">
          <strong>Academic Note:</strong> This portal evaluates resume structure, keyword detection, and content completeness. It verifies whether required sections are properly formatted and identifiable in the document, but does not claim to authenticate external degrees, certificates, or third-party employer records.
        </div>
      </div>

      {/* STEP 8 — ATS ANALYSIS SECTION */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-100 gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900">AI-Based ATS Compatibility</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Applicant Tracking System parsing metrics and keyword visibility.
            </p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-blue-600">{resume.verificationScore ?? 0}</span>
            <span className="text-xs font-semibold text-slate-400"> / 100</span>
          </div>
        </div>

        {/* ATS Breakdown Bars */}
        <div className="space-y-3 mb-6">
          {atsBreakdown.map((item, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between text-xs font-medium text-slate-700">
                <span>{item.name}</span>
                <span className="font-bold">{item.score}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    item.score >= 70 ? 'bg-blue-600' : 'bg-amber-500'
                  }`}
                  style={{ width: `${item.score}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        {/* AI & Diagnostic Suggestions */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            System Improvement Suggestions
          </h3>
          <div className="space-y-1.5 text-xs text-slate-700">
            {resume.verificationRemarks && resume.verificationRemarks.length > 0 ? (
              resume.verificationRemarks.map((remark, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>{remark}</span>
                </div>
              ))
            ) : (
              <p className="text-slate-500">No suggestions reported.</p>
            )}
          </div>
        </div>
      </div>

      {/* EXTRACTED CONTENT SECTIONS (Skills, Education, Experience) */}
      <div className="space-y-6">
        {/* Skills Section */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Extracted Skills</h3>
            <span className="text-xs text-slate-500">
              {resume.skills?.length || 0} Skills Detected
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {resume.skills && resume.skills.length > 0 ? (
              resume.skills.map((skill, index) => (
                <span
                  key={index}
                  className="text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-md"
                >
                  {typeof skill === 'string' ? skill : JSON.stringify(skill)}
                </span>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic">No technical skills detected in the document.</p>
            )}
          </div>
        </div>

        {/* Education & Experience in 2 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Education */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Extracted Education</h3>
              <span className="text-xs text-slate-500">
                {resume.education?.length || 0} Mentions
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {resume.education && resume.education.length > 0 ? (
                resume.education.map((edu, index) => (
                  <span
                    key={index}
                    className="text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200 px-2.5 py-1 rounded-md"
                  >
                    {typeof edu === 'string' ? edu : JSON.stringify(edu)}
                  </span>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic">No academic degrees or institutions detected.</p>
              )}
            </div>
          </div>

          {/* Experience / Projects */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Experience / Projects</h3>
              <span className="text-xs text-slate-500">
                {resume.experience?.length || 0} Mentions
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {resume.experience && resume.experience.length > 0 ? (
                resume.experience.map((exp, index) => (
                  <span
                    key={index}
                    className="text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-md"
                  >
                    {typeof exp === 'string' ? exp : JSON.stringify(exp)}
                  </span>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic">No work experience or project keywords detected.</p>
              )}
            </div>
          </div>
        </div>

        {/* Embedded PDF Viewer if PDF */}
        {fileUrl && resume.fileType?.toUpperCase() === 'PDF' && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3 pb-2 border-b border-slate-100">
              Document Preview
            </h3>
            <div className="w-full h-96 rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
              <iframe
                src={fileUrl}
                title="Resume Preview Document"
                className="w-full h-full"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeDetails;