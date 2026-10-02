import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import VerificationCard from '../components/VerificationCard';

const Dashboard = () => {
  const [resumesList, setResumesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const API_HOST = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/api\/?$/, '');

  const fetchResumes = async () => {
    try {
      setLoading(true);
      const res = await API.get('/resumes/my-resume');
      const list = Array.isArray(res.data?.data)
        ? res.data.data
        : (res.data?.data ? [res.data.data] : []);
      setResumesList(list);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const latestResume = resumesList[0] || null;

  const handleDeleteResume = async (id, fileName) => {
    if (!id) return;
    const confirmDelete = window.confirm(`Are you sure you want to delete "${fileName || 'this resume'}"?`);
    if (!confirmDelete) return;

    try {
      await API.delete(`/resumes/${id}`);
      setResumesList((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove resume.');
    }
  };

  const getCleanFileUrl = (pathString) => {
    if (!pathString) return null;
    const normalized = pathString.replace(/\\/g, '/');
    const filename = normalized.split('uploads/').pop();
    return `${API_HOST}/uploads/${filename}`;
  };

  const latestFileUrl = getCleanFileUrl(latestResume?.filePath);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-slate-500">Loading dashboard telemetry...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Welcome Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 mb-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-2">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              Academic Evaluation Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Welcome back, {user.name || 'Student'}
            </h1>
            <p className="text-slate-500 text-sm mt-1 max-w-2xl">
              Automated resume content verification, section completeness detection, and ATS compatibility analytics.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/upload"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg shadow-sm transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Upload Resume
            </Link>

            <Link
              to="/resumes"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold text-sm rounded-lg shadow-xs transition"
            >
              View My Resumes
              <span className="ml-1 px-2 py-0.5 bg-slate-100 text-slate-700 text-xs rounded-full font-bold">
                {resumesList.length}
              </span>
            </Link>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
          {error}
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total Uploads */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
            Total Resumes
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-bold text-slate-900">{resumesList.length}</span>
            <span className="text-xs text-slate-400 font-medium">In your profile</span>
          </div>
        </div>

        {/* Latest ATS Score */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
            Latest ATS Score
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-bold text-blue-600">
              {latestResume ? `${latestResume.verificationScore ?? 0}/100` : 'N/A'}
            </span>
            <span className="text-xs text-slate-400 font-medium">Completeness</span>
          </div>
        </div>

        {/* Latest Verification Status */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
            Latest Status
          </span>
          <div className="flex items-center justify-between mt-2">
            {latestResume ? (
              <span
                className={`inline-flex items-center gap-1.5 text-sm font-bold px-2.5 py-1 rounded-md border ${
                  latestResume.verificationStatus === 'VERIFIED'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-red-50 text-red-700 border-red-200'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    latestResume.verificationStatus === 'VERIFIED' ? 'bg-emerald-600' : 'bg-red-600'
                  }`}
                ></span>
                {latestResume.verificationStatus}
              </span>
            ) : (
              <span className="text-sm font-semibold text-slate-400">No resumes</span>
            )}
            <span className="text-xs text-slate-400 font-medium">Evaluation</span>
          </div>
        </div>

        {/* Latest Upload Date */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
            Latest Upload
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-sm font-bold text-slate-900 truncate">
              {latestResume?.createdAt
                ? new Date(latestResume.createdAt).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })
                : 'None'}
            </span>
            <span className="text-xs text-slate-400 font-medium">Activity</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {!latestResume ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center shadow-xs">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3 border border-blue-100">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-slate-900">No Resume Uploaded Yet</h3>
          <p className="text-slate-500 text-sm max-w-md mx-auto mt-1 mb-6">
            Upload your resume in PDF or Word (.docx) format to receive instant automated section detection, ATS scoring, and profile verification.
          </p>
          <Link
            to="/upload"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition"
          >
            Upload Document &rarr;
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Latest Resume Overview */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs">
              <div className="flex items-start justify-between gap-3 mb-5">
                <div className="min-w-0">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                    Latest Inspected Resume
                  </span>
                  <h3 className="text-base font-bold text-slate-900 truncate mt-1" title={latestResume.fileName}>
                    {latestResume.fileName}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {latestResume.fileSize ? (latestResume.fileSize / 1024).toFixed(1) : 0} KB • {latestResume.fileType || 'FILE'}
                  </p>
                </div>
                <span
                  className={`shrink-0 px-2.5 py-1 rounded-md text-xs font-bold uppercase border ${
                    latestResume.verificationStatus === 'VERIFIED'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-red-50 text-red-700 border-red-200'
                  }`}
                >
                  {latestResume.verificationStatus}
                </span>
              </div>

              {/* Score Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-5">
                <div className="flex justify-between items-baseline mb-2">
                  <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                    ATS / Verification Score
                  </span>
                  <span className="text-2xl font-bold text-slate-900">
                    {latestResume.verificationScore ?? 0} / 100
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      (latestResume.verificationScore ?? 0) >= 70 ? 'bg-emerald-600' : 'bg-amber-500'
                    }`}
                    style={{ width: `${latestResume.verificationScore ?? 0}%` }}
                  ></div>
                </div>
                <div className="flex justify-between items-center mt-2 text-xs text-slate-500 font-medium">
                  <span>Pass Threshold: 70%</span>
                  <span>{(latestResume.verificationScore ?? 0) >= 70 ? 'Passed Criteria' : 'Needs Review'}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <Link
                  to={`/resume/${latestResume._id}`}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 shadow-xs transition"
                >
                  View Full Details & AI Analysis &rarr;
                </Link>

                {latestFileUrl && (
                  <a
                    href={latestFileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition"
                  >
                    Download / View Document ↗
                  </a>
                )}

                <button
                  type="button"
                  onClick={() => handleDeleteResume(latestResume._id, latestResume.fileName)}
                  className="w-full py-1.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 text-xs font-semibold rounded-lg transition"
                >
                  Delete This Resume
                </button>
              </div>
            </div>

            {/* Quick Resumes Switcher */}
            {resumesList.length > 1 && (
              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Other Uploaded Resumes ({resumesList.length - 1})
                  </h4>
                  <Link to="/resumes" className="text-xs font-semibold text-blue-600 hover:underline">
                    View All
                  </Link>
                </div>
                <div className="space-y-2">
                  {resumesList.slice(1, 4).map((item) => (
                    <Link
                      key={item._id}
                      to={`/resume/${item._id}`}
                      className="block p-2.5 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-semibold text-slate-800 truncate max-w-[170px]">
                          {item.fileName}
                        </span>
                        <span className="text-xs font-bold text-slate-600">
                          {item.verificationScore}%
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Content Checklist & Diagnostic Remarks */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Detected Content Checklist</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Automated extraction checks for standard resume structural elements
                  </p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md border border-slate-200">
                  6 Core Checks
                </span>
              </div>

              {/* 6-Card Checklist Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-6">
                <VerificationCard
                  label="Candidate Name"
                  isFound={Boolean(latestResume.verificationDetails?.nameFound)}
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  }
                />
                <VerificationCard
                  label="Email Address"
                  isFound={Boolean(latestResume.verificationDetails?.emailFound)}
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  }
                />
                <VerificationCard
                  label="Phone Number"
                  isFound={Boolean(latestResume.verificationDetails?.phoneFound)}
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  }
                />
                <VerificationCard
                  label="Education & Academics"
                  isFound={Boolean(latestResume.verificationDetails?.educationFound)}
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" />
                    </svg>
                  }
                />
                <VerificationCard
                  label="Technical Skills"
                  isFound={Boolean(latestResume.verificationDetails?.skillsFound)}
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                  }
                />
                <VerificationCard
                  label="Experience / Projects"
                  isFound={Boolean(latestResume.verificationDetails?.experienceFound)}
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  }
                />
              </div>

              {/* Diagnostic Remarks from Backend */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  System Diagnostic Remarks & Suggestions
                </h3>
                <div className="space-y-2">
                  {latestResume.verificationRemarks && latestResume.verificationRemarks.length > 0 ? (
                    latestResume.verificationRemarks.map((remark, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700">
                        <span className="text-blue-600 font-bold">•</span>
                        <span>{remark}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500">No diagnostic remarks reported by parser.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;