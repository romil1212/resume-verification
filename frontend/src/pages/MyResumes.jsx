import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';

const MyResumes = () => {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const API_HOST = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/api\/?$/, '');

  const fetchResumes = async () => {
    try {
      const res = await API.get('/resumes/my-resume');
      const list = Array.isArray(res.data?.data)
        ? res.data.data
        : (res.data?.data ? [res.data.data] : []);
      setResumes(list);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load uploaded resumes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleDelete = async (id, fileName) => {
    const confirmed = window.confirm(`Are you sure you want to delete "${fileName || 'this resume'}"?`);
    if (!confirmed) return;

    try {
      await API.delete(`/resumes/${id}`);
      setResumes((prev) => prev.filter((r) => r._id !== id));
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

  const filteredResumes = resumes.filter((item) => {
    const matchesSearch = item.fileName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'ALL' ||
      item.verificationStatus?.toUpperCase() === statusFilter.toUpperCase();
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-slate-500">Loading your resumes...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Resumes</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage and inspect all verified resumes associated with your student account.
          </p>
        </div>
        <Link
          to="/upload"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Upload Resume
        </Link>
      </div>

      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
          {error}
        </div>
      )}

      {/* Filter and Search Bar */}
      {resumes.length > 0 && (
        <div className="mt-6 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="w-full sm:w-72 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search resumes by filename..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 shrink-0">
              Status:
            </span>
            <div className="inline-flex rounded-lg border border-slate-300 bg-white p-0.5 text-xs font-medium">
              {['ALL', 'VERIFIED', 'REJECTED'].map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1 rounded-md transition ${
                    statusFilter === status
                      ? 'bg-blue-600 text-white font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {status === 'ALL' ? `All (${resumes.length})` : status.charAt(0) + status.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Resume Cards Grid */}
      {resumes.length === 0 ? (
        <div className="mt-8 bg-white border border-dashed border-slate-300 rounded-2xl p-12 text-center shadow-xs">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3 border border-blue-100">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-slate-900">No Resumes Found</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1 mb-6">
            You haven't uploaded any resumes yet. Upload a PDF or DOCX file to run automated ATS analysis and verification.
          </p>
          <Link
            to="/upload"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition"
          >
            Upload Resume Now
          </Link>
        </div>
      ) : filteredResumes.length === 0 ? (
        <div className="mt-8 bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 text-sm">
          No resumes match your current filter or search query.
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredResumes.map((item) => {
            const isVerified = item.verificationStatus === 'VERIFIED';
            const uploadDate = item.createdAt
              ? new Date(item.createdAt).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })
              : 'Unknown date';
            const fileSizeKb = item.fileSize ? (item.fileSize / 1024).toFixed(1) : 0;
            const fileUrl = getCleanFileUrl(item.filePath);

            return (
              <div
                key={item._id}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-slate-300 transition flex flex-col justify-between"
              >
                <div>
                  {/* Top Header */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 font-bold text-xs uppercase flex items-center justify-center shrink-0 border border-blue-100">
                        {item.fileType || 'DOC'}
                      </div>
                      <div className="min-w-0">
                        <h3
                          className="text-sm font-bold text-slate-900 truncate"
                          title={item.fileName}
                        >
                          {item.fileName}
                        </h3>
                        <p className="text-xs text-slate-500">
                          {fileSizeKb} KB • {item.fileType || 'FILE'}
                        </p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full shrink-0 border ${
                        isVerified
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isVerified ? 'bg-emerald-600' : 'bg-red-600'
                        }`}
                      ></span>
                      {isVerified ? 'Verified' : 'Rejected'}
                    </span>
                  </div>

                  {/* Metadata Specs */}
                  <div className="space-y-2 py-3 border-y border-slate-100 text-xs">
                    <div className="flex justify-between items-center text-slate-600">
                      <span>Uploaded:</span>
                      <span className="font-medium text-slate-800">{uploadDate}</span>
                    </div>

                    <div className="flex justify-between items-center text-slate-600">
                      <span>ATS Score:</span>
                      <span className="font-bold text-slate-900">
                        {item.verificationScore ?? 0} / 100
                      </span>
                    </div>

                    {/* Mini Progress Bar */}
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          (item.verificationScore ?? 0) >= 70
                            ? 'bg-emerald-500'
                            : 'bg-amber-500'
                        }`}
                        style={{ width: `${item.verificationScore ?? 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-4 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/resume/${item._id}`}
                      className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold rounded-md transition"
                    >
                      View Details
                    </Link>

                    {fileUrl && (
                      <a
                        href={fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold rounded-md transition"
                        title="Download / View document"
                      >
                        Download
                      </a>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(item._id, item.fileName)}
                    className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-semibold rounded-md transition"
                    title="Delete resume"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyResumes;
