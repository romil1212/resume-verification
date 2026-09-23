import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import API from '../services/api';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [resumesList, setResumesList] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loadingResumes, setLoadingResumes] = useState(false);

  // Fallback to localhost:5000 if VITE_API_URL is missing
  const API_HOST = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/api\/?$/, '');

  const handleLogout = () => {
    // 1. Clear session and tokens
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.clear();

    // 2. Reset profile popup state
    setIsProfileOpen(false);
    setResumesList([]);
    setSelectedIndex(0);

    // 3. Clear axios headers
    if (API.defaults?.headers?.common?.['Authorization']) {
      delete API.defaults.headers.common['Authorization'];
    }

    // 4. Navigate back to login
    navigate('/login', { replace: true });
  };

  const isActive = (path) => location.pathname === path;

  // Fetch all active resumes when user clicks their profile badge
  const handleOpenProfile = async () => {
    setIsProfileOpen(true);
    setLoadingResumes(true);
    try {
      const res = await API.get('/resumes/my-resume');
      const list = Array.isArray(res.data.data) ? res.data.data : (res.data.data ? [res.data.data] : []);
      setResumesList(list);
      setSelectedIndex(0);
    } catch (err) {
      setResumesList([]);
    } finally {
      setLoadingResumes(false);
    }
  };

  // Robust path sanitizer: handles both legacy absolute paths (C:/Users/...) and new relative paths
  const getCleanFileUrl = (pathString) => {
    if (!pathString) return null;
    const normalized = pathString.replace(/\\/g, '/');
    // Extracts only the filename after /uploads/ or uploads/
    const filename = normalized.split('uploads/').pop();
    return `${API_HOST}/uploads/${filename}`;
  };

  const selectedResume = resumesList[selectedIndex] || null;
  const resumeUrl = getCleanFileUrl(selectedResume?.filePath);

  return (
    <>
      <nav className="sticky top-0 z-[100] bg-[#0e1626]/90 backdrop-blur-xl border-b border-slate-800/80 px-6 lg:px-12 py-3.5 shadow-lg shadow-black/20 pointer-events-auto">
        <div className="max-w-7xl mx-auto flex justify-between items-center relative z-[101]">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-3 group cursor-pointer select-none">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/25 group-hover:scale-105 transition-transform">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-white tracking-wide">
              ResumeVerify
            </span>
          </Link>

          {/* Nav Items */}
          <div className="flex items-center gap-3 sm:gap-6 relative z-[102]">
            {token ? (
              <>
                {/* Clickable Profile Badge */}
                <button
                  type="button"
                  onClick={handleOpenProfile}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-slate-700/60 transition cursor-pointer select-none group"
                  title="View Profile & Uploaded Resumes"
                >
                  <div className="w-8 h-8 rounded-full bg-sky-950/80 border border-sky-500/40 flex items-center justify-center font-bold text-sky-400 text-xs uppercase group-hover:border-sky-400 transition">
                    {user.name ? user.name.slice(0, 2) : 'RO'}
                  </div>
                  <span className="text-sm font-medium text-slate-300 group-hover:text-white transition">
                    {user.name || 'User'}
                  </span>
                </button>

                <div className="h-5 w-[1px] bg-slate-800 hidden sm:block" />

                <Link
                  to="/dashboard"
                  className={`text-sm font-medium px-3.5 py-1.5 rounded-lg transition cursor-pointer select-none ${
                    isActive('/dashboard')
                      ? 'bg-sky-500/15 text-sky-400 font-semibold border border-sky-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  Dashboard
                </Link>

                <Link
                  to="/upload"
                  className={`text-sm font-medium px-3.5 py-1.5 rounded-lg transition cursor-pointer select-none ${
                    isActive('/upload')
                      ? 'bg-sky-500/15 text-sky-400 font-semibold border border-sky-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  Upload
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-xs font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 px-3.5 py-1.5 rounded-lg transition cursor-pointer active:scale-95 select-none"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white px-3 py-1.5 transition cursor-pointer">
                  Login
                </Link>
                <Link to="/register" className="text-sm font-semibold bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white px-4 py-1.5 rounded-lg shadow-lg shadow-sky-500/20 transition cursor-pointer">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* User Profile & Stored Resumes Modal */}
      {isProfileOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className="bg-[#111827] border border-slate-800 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-sky-950 border border-sky-500/30 flex items-center justify-center font-bold text-sky-400 text-sm uppercase">
                  {user.name ? user.name.slice(0, 2) : 'RO'}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white leading-tight">{user.name}</h3>
                  <p className="text-xs text-slate-400">
                    {user.email || 'Candidate Account'} • {resumesList.length} Stored Resume{resumesList.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsProfileOpen(false)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5">
              {loadingResumes ? (
                <div className="py-12 flex flex-col items-center justify-center gap-3">
                  <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xs text-slate-400">Loading stored resumes...</span>
                </div>
              ) : resumesList.length > 0 ? (
                <>
                  {/* Multi-Resume Selector Bar */}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                      Stored Resumes History:
                    </span>
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                      {resumesList.map((item, idx) => (
                        <button
                          key={item._id || idx}
                          type="button"
                          onClick={() => setSelectedIndex(idx)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer border ${
                            selectedIndex === idx
                              ? 'bg-sky-500/20 text-sky-400 border-sky-500/50 shadow-sm'
                              : 'bg-slate-800/60 text-slate-400 border-slate-700/60 hover:text-white hover:bg-slate-800'
                          }`}
                        >
                          #{resumesList.length - idx}: {item.fileName.length > 22 ? `${item.fileName.slice(0, 20)}...` : item.fileName}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Selected Resume Details Card */}
                  {selectedResume && (
                    <div className="bg-[#1a2333] border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                          Uploaded on {new Date(selectedResume.createdAt).toLocaleDateString()}
                        </span>
                        <p className="text-sm font-bold text-slate-100 truncate" title={selectedResume.fileName}>
                          {selectedResume.fileName}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {(selectedResume.fileSize / 1024).toFixed(1)} KB • {selectedResume.fileType}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {resumeUrl && (
                          <a
                            href={resumeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3.5 py-2 bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-400 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                          >
                            Open Document ↗
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Verification Status */}
                  {selectedResume && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-[#161f32] border border-slate-800/80 rounded-xl p-3.5">
                        <span className="text-[11px] font-semibold text-slate-400 block uppercase">Status</span>
                        <span className="text-sm font-bold text-emerald-400 mt-1 inline-block">
                          {selectedResume.verificationStatus}
                        </span>
                      </div>
                      <div className="bg-[#161f32] border border-slate-800/80 rounded-xl p-3.5">
                        <span className="text-[11px] font-semibold text-slate-400 block uppercase">Verification Score</span>
                        <span className="text-sm font-bold text-white mt-1 inline-block">
                          {selectedResume.verificationScore}%
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Skills Display */}
                  {selectedResume?.skills && selectedResume.skills.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Stored Skills Profile
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedResume.skills.map((skill, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 border border-slate-700 text-slate-300"
                          >
                            {typeof skill === 'string' ? skill : JSON.stringify(skill)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Document Embed for PDF */}
                  {resumeUrl && selectedResume?.fileType?.includes('PDF') && (
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Document Embed
                      </h4>
                      <div className="w-full h-80 rounded-xl overflow-hidden border border-slate-800 bg-black/40">
                        <iframe
                          src={resumeUrl}
                          title="Resume Preview"
                          className="w-full h-full"
                        />
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="py-10 text-center">
                  <p className="text-slate-400 text-sm">No resume uploaded to this profile yet.</p>
                  <Link
                    to="/upload"
                    onClick={() => setIsProfileOpen(false)}
                    className="inline-block mt-3 px-4 py-2 bg-sky-500 hover:bg-sky-400 text-white font-semibold text-xs rounded-xl transition cursor-pointer"
                  >
                    Upload Resume Now
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;